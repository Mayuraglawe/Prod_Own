# LiteTrace — Lag Mitigation: Implementation Guide

Companion to the Latency & Performance Risk Report. Each section maps 1:1 to an action item, with the problem, the fix, how it works, where it plugs in, and tunables.

Files: `rateLimiter.ts` · `groupingBatchWriter.ts` · `alertCooldown.ts` · `consumerLagMonitor.ts`

---

## 1. Ingestion Rate Limiting + Edge Dedup

**File:** `rateLimiter.ts`

### Problem
`IngestionService` accepts all payloads unconditionally and pushes to `TELEMETRY_RECEIVED`. A noisy tenant (buggy SDK, infinite-loop error) can flood Kafka and stall the Processing workers for everyone.

### Solution
**Token bucket rate limiter**, one bucket per tenant, stored in Redis, checked atomically via a Lua script.

| Piece | Detail |
|---|---|
| `checkRateLimit(tenantId, capacity, refillRate)` | Runs the Lua script server-side in Redis — read + refill + deduct happens in one atomic op, no race between concurrent requests hitting the same tenant. |
| `rateLimitMiddleware` | Drop-in Express/Fastify middleware. Rejects with `429` **before** the payload reaches Kafka. |
| Bucket state | Stored as a Redis hash (`tokens`, `ts`) per tenant, TTL 1hr (auto-cleans idle tenants). |

**Why Lua, not a JS read-then-write:** two concurrent requests reading the same bucket, then both writing, can double-spend tokens. The Lua script executes as a single atomic Redis operation — no race window.

### Edge Dedup (fast-path)
`isDuplicate(fingerprint, windowSeconds)` — `SET key val EX 5 NX`. If the key already exists, it's a duplicate within the window → drop before Kafka. One Redis round-trip, no hashing pipeline needed at this stage since the SDK/ingest layer can compute a cheap fingerprint (e.g. hash of error type + message + stack top frame) inline.

### Integration Point
Ingestion Service, before the Kafka `producer.send()` call:
```
rateLimitMiddleware → isDuplicate check → producer.send(TELEMETRY_RECEIVED)
```

### Tunables
- `capacity` / `refillRate` — set per plan tier (free vs paid), pull from tenant config, cache the lookup in Redis to avoid a DB hit per request.
- Dedup `windowSeconds` — 5s is a reasonable default for "same error spamming in a loop"; raise it if legitimate high-frequency errors are common.

---

## 2. Grouping Service Batch Writer

**File:** `groupingBatchWriter.ts`

### Problem
Sequential per-event Postgres writes (Issue upsert) + ClickHouse inserts (Occurrence) under a burst exhaust the Prisma connection pool. Grouping stalls → Kafka consumer lag backs up further upstream.

### Solution
**Micro-batching buffer** inside the Kafka consumer's `eachMessage` handler. Events accumulate in memory and flush as one bulk operation instead of N round-trips.

| Mechanism | Detail |
|---|---|
| Flush trigger | Whichever comes first: buffer hits `maxBatchSize` (default 500) or `maxWaitMs` elapses (default 500ms). |
| Issue upsert | Deduplicated in-memory by `fingerprint` (`Map`, last-write-wins) before writing — a burst of 500 occurrences for the same issue becomes **one** upsert row, not 500. |
| Postgres write | `Prisma.sql` + `Prisma.join` — parameterized multi-row `INSERT ... ON CONFLICT (fingerprint) DO UPDATE`. Parameterized, not string-interpolated, so it's injection-safe. |
| ClickHouse write | Single batched `insert()` call with `JSONEachRow` format — ClickHouse is built for bulk row inserts, this is the intended usage pattern (not one insert per row). |
| Flush guard | `flushing` boolean prevents overlapping flushes if a timer fires while a previous flush is still in-flight. |

### Integration Point
```
kafka.consumer.run({ eachMessage }) → writer.addOccurrence(occ, issue)
process.on('SIGTERM', () => writer.flush())   // don't drop the buffer on deploy/restart
```

### Tunables
- `maxBatchSize` — raise for higher throughput tenants, lower if Postgres row size is large.
- `maxWaitMs` — lower = fresher dashboard data, higher = better batching efficiency. 500ms is a reasonable "still feels real-time" ceiling.
- **Not yet wired:** failed batch handling currently just logs. For production, push failed batches to a dead-letter topic instead of dropping them.

---

## 3. Alert Cooldown / Dedup

**File:** `alertCooldown.ts`

### Problem
A spike in one error type can trigger the same alert rule thousands of times → floods Slack/email, external providers rate-limit our webhooks, BullMQ notification queue backs up.

### Solution
**Redis-enforced cooldown window per issue.** `SET key 1 EX <cooldown> NX` — the first call within the window returns `OK` (fire the alert), every subsequent call within the window returns `null` (suppressed), enforced atomically by Redis itself — no separate "check then set" race.

| Function | Purpose |
|---|---|
| `shouldFireAlert(issueId, windowSeconds)` | Gate before enqueueing to `notificationQueue`. |
| `incrementSuppressedCount` / `popSuppressedCount` | Optional: track how many times the alert was suppressed during cooldown, so the next real notification can say *"fired 47 more times since last alert"* instead of going silent with no context. |

### Integration Point
Alerting service, right before `notificationQueue.add()`:
```
evaluateAndNotify(issueId, rule, notificationQueue)
  → shouldFireAlert() gate → queue.add('send-alert', ...)
```

### Tunables
- `cooldownSeconds` — per-rule config (report specifies 30 min default), stored on the `AlertRule` record.
- Suppressed-count key has no TTL set in the snippet — add one (e.g. same as cooldown window) if you want it to self-expire instead of persisting indefinitely on rarely-firing issues.

---

## 4. Consumer Lag & Queue Depth Monitoring

**File:** `consumerLagMonitor.ts`

### Problem
None of the above self-reports when it's failing. Without visibility, lag builds silently until a customer complains their dashboard is stale.

### Solution
**Two independent probes**, both polling-based:

| Probe | How |
|---|---|
| `getKafkaConsumerLag(groupId, topic)` | `kafkajs` admin client — diffs `fetchTopicOffsets` (high watermark, i.e. latest produced offset) against `fetchOffsets` (last committed offset per consumer group), per partition. Sum = total lag in messages. |
| `pollLagAndAlert(...)` | Wraps the above in `setInterval`, fires `onBreach(lag)` callback when lag exceeds `threshold`. Default callback just `console.warn`s — replace with a Slack/n8n webhook call for real alerting. |
| `getBullMQQueueMetrics(queue)` | `waiting`/`active`/`delayed`/`failed` counts straight from BullMQ — cheap, no extra infra needed. |

### Integration Point
Run as a **standalone sidecar process** (not inside the ingestion/grouping hot path — it's diagnostic, shouldn't compete for the same event loop under load):
```
pollLagAndAlert('grouping-service-group', 'TELEMETRY_RECEIVED', 5000, 30000)
setInterval(() => getBullMQQueueMetrics(notificationQueue), 30000)
```

### Tunables
- `threshold` — depends on acceptable staleness; report example (12:00 error visible at 12:30) implies lag has been silently over threshold for 30 min — pick a threshold that fires well before that.
- `intervalMs` — 30s is a reasonable poll rate; don't go much lower, `fetchTopicOffsets`/`fetchOffsets` are admin API calls with their own overhead.
- Wire `onBreach` to n8n (matches existing alerting infra) rather than building a second notification path.

---

## Wiring Order (end to end)

```
Client SDK
   │
   ▼
[rateLimiter] rate-limit + edge-dedup ──(429/drop)──> reject
   │ (allowed)
   ▼
Kafka: TELEMETRY_RECEIVED
   │
   ▼
Grouping consumer ──> [groupingBatchWriter] ──> bulk write Postgres + ClickHouse
   │
   ▼
Alert rule evaluation ──> [alertCooldown] gate ──(suppressed)──> drop
   │ (fires)
   ▼
BullMQ notificationQueue ──> Slack/email/n8n

[consumerLagMonitor] — runs independently, watches Kafka group lag + BullMQ depth, alerts the team
```

## Rollout Priority

1. **Rate limiter** — highest leverage, stops the problem at the source before it costs Kafka/DB resources downstream.
2. **Batch writer** — second, since it's the actual bottleneck once traffic passes the rate limiter.
3. **Alert cooldown** — independent of the above, can ship in parallel.
4. **Lag monitor** — ship last since it's diagnostic, but ship it *before* onboarding real customers, not after — it's how you'll know if 1–3 are actually working under real load.

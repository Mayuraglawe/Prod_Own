# Sentry Internals → LiteTrace Implementation Guide

---

## PART 1 — How Sentry Actually Works (Deep Dive)

### 1.1 Event Capture (SDK side)

The SDK hooks into your runtime at the lowest possible level so it catches errors you didn't explicitly try/catch:

| Runtime | Hook mechanism |
|---|---|
| Node.js | `process.on('uncaughtException')`, `process.on('unhandledRejection')`, Express/Fastify error middleware |
| Browser | `window.onerror`, `window.onunhandledrejection`, wrapped `setTimeout`/`fetch`/`XHR` |
| Go | `recover()` in deferred functions, wrapped `http.Handler` |

**What gets captured per event:**

```json
{
  "event_id": "c9d8f1a2b3e4...",
  "timestamp": "2026-07-23T10:15:00Z",
  "platform": "node",
  "level": "error",
  "exception": {
    "values": [{
      "type": "TypeError",
      "value": "Cannot read property 'id' of undefined",
      "stacktrace": {
        "frames": [
          {"filename": "app.js", "function": "getUser", "lineno": 42, "colno": 8, "in_app": true},
          {"filename": "express/lib/router.js", "function": "handle", "lineno": 137, "in_app": false}
        ]
      }
    }]
  },
  "breadcrumbs": [
    {"timestamp": "...", "category": "http", "message": "GET /api/users/123", "level": "info"},
    {"timestamp": "...", "category": "db.query", "message": "SELECT * FROM users WHERE id=$1"}
  ],
  "tags": {"environment": "production", "release": "v1.4.2"},
  "user": {"id": "u_123", "ip_address": "1.2.3.4"},
  "contexts": {"runtime": {"name": "node", "version": "20.11.0"}},
  "fingerprint": ["{{ default }}"]
}
```

Key design point: **breadcrumbs** are a ring buffer (last ~100 events) that the SDK maintains in memory continuously — every HTTP call, console log, DB query, nav event gets pushed to it, so when an error fires you get "what happened right before this" for free.

### 1.2 Transport — never blocks your app

- Events go into an in-memory queue inside the SDK.
- A background worker flushes the queue on an interval (or immediately for `fatal`/`error` level).
- On network failure: exponential backoff retry, capped queue size (drops oldest events, never crashes your app because of a monitoring failure).
- This is exactly the pattern you already use with Asynq — fire-and-forget enqueue, worker processes async.

### 1.3 Ingest — Relay

Relay (Rust) sits in front of the processing pipeline and does cheap, fast validation **before** anything touches Kafka:

1. Auth check (DSN public key matches project)
2. Payload size cap (reject > ~1MB by default)
3. Rate limiting per project (token bucket in Redis — reject with `429` + `Retry-After` if project quota exceeded)
4. PII scrubbing (configurable regex/rules strip credit card numbers, emails, etc. from breadcrumbs/messages before storage)
5. Basic schema validation

Only after this does it write to Kafka. This layer exists specifically so a buggy client can't DoS the processing pipeline.

### 1.4 Fingerprinting & Grouping — the core IP

This is the part that actually makes Sentry useful (dedup 10,000 raw events into 12 real issues).

**Default fingerprint algorithm:**
1. Take the top N stack frames (usually all `in_app: true` frames, i.e. your code, not library code).
2. For each frame, extract `(normalized_filename, function_name)` — line numbers are **excluded** by default so the same bug at a slightly different line (after a minor edit) still groups together.
3. Concatenate into a string, SHA1 hash it → `fingerprint_hash`.
4. If `event.fingerprint` is explicitly set by the developer (custom grouping), use that instead of computed frames.

```python
def compute_fingerprint(stack_frames, custom_fingerprint=None):
    if custom_fingerprint:
        return sha1("|".join(custom_fingerprint)).hexdigest()

    in_app_frames = [f for f in stack_frames if f.get("in_app")]
    parts = [f"{normalize_path(f['filename'])}:{f['function']}" for f in in_app_frames]
    return sha1("|".join(parts)).hexdigest()
```

**Grouping on write:**
```sql
INSERT INTO issues (fingerprint, title, first_seen, last_seen, times_seen, status)
VALUES ($1, $2, now(), now(), 1, 'unresolved')
ON CONFLICT (project_id, fingerprint)
DO UPDATE SET
  last_seen = now(),
  times_seen = issues.times_seen + 1,
  status = CASE WHEN issues.status = 'resolved' THEN 'regressed' ELSE issues.status END;
```

That `ON CONFLICT` clause is the entire "issue" concept — it's just an upsert keyed on `(project_id, fingerprint)`.

### 1.5 Symbolication (minified/compiled code)

For minified JS or compiled Go binaries, raw stack traces are useless (`main.js:1:48291`). Sentry uploads **source maps** / debug symbols at build/deploy time, tagged with a `release` version. When an event comes in tagged with that release, a symbolication worker re-maps line/col back to original source before fingerprinting runs. This has to happen **before** fingerprinting, or grouping breaks across every deploy.

### 1.6 Alert Rule Engine — the notification trigger

Rules are stored per-project as condition trees, evaluated on every issue state transition:

```json
{
  "project_id": "proj_1",
  "conditions": [
    {"type": "first_seen"},
    {"type": "event_frequency", "value": 100, "interval": "1h"},
    {"type": "state_change", "from": "ignored", "to": "unresolved"}
  ],
  "condition_logic": "any",
  "actions": [
    {"type": "slack", "channel": "#alerts", "workspace_id": "T123"},
    {"type": "webhook", "url": "https://example.com/webhook/abc"}
  ]
}
```

The engine runs as part of the same worker that processes the Kafka event — after upserting the issue row, it re-fetches the project's active rules and evaluates each condition against the issue's current state (`times_seen`, `status`, `first_seen == now()` etc). Any match enqueues one notification job **per action**, not per rule — so 2 matching rules pointing at the same Slack channel still gets deduped before send.

### 1.7 Notification Dispatch — dedup is the hard part

Naive version: issue fires → send Slack message. Problem: if an issue happens 500 times in a minute, you get 500 Slack messages.

**Real dedup logic (Redis-based):**
```
key = f"notif:dedup:{issue_id}:{action_id}"
if redis.exists(key):
    skip  # already notified recently
else:
    redis.setex(key, ttl=300, value=1)  # 5 min cooldown
    send_notification()
```

Combined with a **digest window**: instead of sending "issue X happened" instantly every time, batch state changes for N seconds and send one message: *"IssueX — seen 47 times in the last 5 min, affecting 12 users."*

---

## PART 2 — Full LiteTrace Implementation

Your stack: Go + PostgreSQL (RLS) + Redis + Asynq + Next.js. Below is a working skeleton for every layer.

### 2.1 Client SDK (TypeScript, minimal)

```typescript
// litetrace-sdk/index.ts
interface LiteTraceConfig {
  dsn: string;         // e.g. "https://<project_key>@ingest.litetrace.io/api/1/events"
  environment?: string;
  release?: string;
}

class LiteTraceClient {
  private queue: any[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private breadcrumbs: any[] = [];

  constructor(private config: LiteTraceConfig) {
    process.on('uncaughtException', (err) => this.capture(err, 'fatal'));
    process.on('unhandledRejection', (reason) => this.capture(reason as Error, 'error'));
  }

  addBreadcrumb(category: string, message: string, level = 'info') {
    this.breadcrumbs.push({ timestamp: Date.now(), category, message, level });
    if (this.breadcrumbs.length > 100) this.breadcrumbs.shift(); // ring buffer
  }

  capture(err: Error, level: 'error' | 'fatal' | 'warning' = 'error', fingerprint?: string[]) {
    const event = {
      event_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      environment: this.config.environment ?? 'production',
      release: this.config.release,
      exception: {
        type: err.name,
        value: err.message,
        stacktrace: this.parseStack(err.stack ?? ''),
      },
      breadcrumbs: [...this.breadcrumbs],
      fingerprint,
    };
    this.queue.push(event);
    this.scheduleFlush(level === 'fatal');
  }

  private parseStack(stack: string) {
    return stack.split('\n').slice(1).map((line) => {
      const match = line.match(/at (.+) \((.+):(\d+):(\d+)\)/);
      return match
        ? { function: match[1], filename: match[2], lineno: +match[3], colno: +match[4], in_app: !match[2].includes('node_modules') }
        : { raw: line.trim() };
    });
  }

  private scheduleFlush(immediate = false) {
    if (immediate) return this.flush();
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => this.flush(), 2000);
  }

  private async flush() {
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = null;
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.queue.length);
    try {
      await fetch(this.config.dsn, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch }),
      });
    } catch {
      // drop silently on failure — never let monitoring crash the app
      // (production version: retry with backoff, cap queue size)
    }
  }
}

export default LiteTraceClient;
```

### 2.2 Ingest API (Go)

```go
// ingest/handler.go
package ingest

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/redis/go-redis/v9"
)

type EventBatch struct {
	Events []Event `json:"events"`
}

type Event struct {
	EventID     string                 `json:"event_id"`
	ProjectKey  string                 `json:"-"` // set from URL, not payload
	Timestamp   time.Time              `json:"timestamp"`
	Level       string                 `json:"level"`
	Environment string                 `json:"environment"`
	Release     string                 `json:"release"`
	Exception   map[string]interface{} `json:"exception"`
	Breadcrumbs []map[string]interface{} `json:"breadcrumbs"`
	Fingerprint []string               `json:"fingerprint"`
}

func IngestHandler(rdb *redis.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		projectKey := r.PathValue("project_key") // Go 1.22+ routing

		// 1. rate limit check (token bucket per project)
		allowed, err := checkRateLimit(r.Context(), rdb, projectKey)
		if err != nil || !allowed {
			http.Error(w, "rate limit exceeded", http.StatusTooManyRequests)
			return
		}

		var batch EventBatch
		if err := json.NewDecoder(r.Body).Decode(&batch); err != nil {
			http.Error(w, "invalid payload", http.StatusBadRequest)
			return
		}

		for i := range batch.Events {
			batch.Events[i].ProjectKey = projectKey
			payload, _ := json.Marshal(batch.Events[i])

			// 2. push to Redis stream (not directly to Postgres — matches your privacy-first pattern from LeadHub)
			err := rdb.XAdd(r.Context(), &redis.XAddArgs{
				Stream: "litetrace:events",
				Values: map[string]interface{}{"payload": payload, "project": projectKey},
			}).Err()
			if err != nil {
				http.Error(w, "failed to enqueue", http.StatusInternalServerError)
				return
			}
		}

		w.WriteHeader(http.StatusAccepted)
	}
}

func checkRateLimit(ctx interface{ Done() <-chan struct{} }, rdb *redis.Client, projectKey string) (bool, error) {
	// token bucket: INCR + EXPIRE pattern, 1000 events/min per project
	key := "ratelimit:" + projectKey
	count, err := rdb.Incr(nil, key).Result()
	if err != nil {
		return false, err
	}
	if count == 1 {
		rdb.Expire(nil, key, time.Minute)
	}
	return count <= 1000, nil
}
```

### 2.3 Fingerprinting Worker (Go, Asynq consumer of the Redis stream)

```go
// worker/fingerprint.go
package worker

import (
	"context"
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

func ComputeFingerprint(customFP []string, frames []map[string]interface{}) string {
	if len(customFP) > 0 {
		return sha1Hex(strings.Join(customFP, "|"))
	}
	var parts []string
	for _, f := range frames {
		inApp, _ := f["in_app"].(bool)
		if !inApp {
			continue
		}
		fn, _ := f["function"].(string)
		file, _ := f["filename"].(string)
		parts = append(parts, file+":"+fn)
	}
	return sha1Hex(strings.Join(parts, "|"))
}

func sha1Hex(s string) string {
	h := sha1.Sum([]byte(s))
	return hex.EncodeToString(h[:])
}

func ProcessStream(ctx context.Context, rdb *redis.Client, db *pgxpool.Pool) {
	for {
		streams, err := rdb.XRead(ctx, &redis.XReadArgs{
			Streams: []string{"litetrace:events", "$"},
			Block:   0,
		}).Result()
		if err != nil {
			continue
		}

		for _, stream := range streams {
			for _, msg := range stream.Messages {
				var event map[string]interface{}
				json.Unmarshal([]byte(msg.Values["payload"].(string)), &event)

				frames, _ := event["exception"].(map[string]interface{})["stacktrace"].([]map[string]interface{})
				fp := ComputeFingerprint(nil, frames)

				upsertIssue(ctx, db, event["project_key"].(string), fp, event)
			}
		}
	}
}

func upsertIssue(ctx context.Context, db *pgxpool.Pool, projectKey, fingerprint string, event map[string]interface{}) {
	var issueID string
	var wasResolved bool
	var timesSeen int

	err := db.QueryRow(ctx, `
		INSERT INTO issues (project_key, fingerprint, title, first_seen, last_seen, times_seen, status)
		VALUES ($1, $2, $3, now(), now(), 1, 'unresolved')
		ON CONFLICT (project_key, fingerprint)
		DO UPDATE SET
			last_seen = now(),
			times_seen = issues.times_seen + 1,
			status = CASE WHEN issues.status = 'resolved' THEN 'regressed' ELSE issues.status END
		RETURNING id, times_seen, (status = 'regressed') AS was_resolved
	`, projectKey, fingerprint, event["exception"].(map[string]interface{})["type"]).
		Scan(&issueID, &timesSeen, &wasResolved)

	if err != nil {
		return
	}

	// enqueue notification evaluation as a separate async job — never block ingestion
	enqueueNotificationCheck(ctx, issueID, timesSeen, wasResolved)
}
```

### 2.4 Postgres Schema (with RLS, matching your existing pattern)

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    project_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_key TEXT NOT NULL REFERENCES projects(project_key),
    fingerprint TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unresolved', -- unresolved | resolved | regressed | ignored
    first_seen TIMESTAMPTZ NOT NULL,
    last_seen TIMESTAMPTZ NOT NULL,
    times_seen INT NOT NULL DEFAULT 1,
    UNIQUE (project_key, fingerprint)
);

CREATE TABLE alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_key TEXT NOT NULL REFERENCES projects(project_key),
    trigger_type TEXT NOT NULL, -- 'new_issue' | 'regression' | 'frequency'
    threshold INT,               -- e.g. 100 events
    interval_seconds INT,        -- e.g. 3600
    action_type TEXT NOT NULL,   -- 'slack' | 'webhook' | 'email'
    action_config JSONB NOT NULL -- {"url": "...", "channel": "..."}
);

CREATE TABLE notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issues(id),
    action_id UUID NOT NULL REFERENCES alert_rules(id),
    sent_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: org-scoped isolation, consistent with your Algomate/SafalHires pattern
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY issue_org_isolation ON issues
    USING (project_key IN (
        SELECT project_key FROM projects WHERE org_id = current_setting('app.current_org_id')::uuid
    ));
```

### 2.5 Notification Worker (Asynq task + Redis dedup)

```go
// worker/notify.go
package worker

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/hibiken/asynq"
	"github.com/redis/go-redis/v9"
)

const TypeNotifyCheck = "notify:check"

type NotifyPayload struct {
	IssueID     string
	TimesSeen   int
	WasResolved bool
}

func enqueueNotificationCheck(ctx context.Context, issueID string, timesSeen int, wasResolved bool) {
	payload, _ := json.Marshal(NotifyPayload{IssueID: issueID, TimesSeen: timesSeen, WasResolved: wasResolved})
	task := asynq.NewTask(TypeNotifyCheck, payload)
	// your existing Asynq client instance
	asynqClient.Enqueue(task, asynq.Queue("notifications"))
}

func HandleNotifyCheck(rdb *redis.Client, db *pgxpool.Pool) func(context.Context, *asynq.Task) error {
	return func(ctx context.Context, t *asynq.Task) error {
		var p NotifyPayload
		json.Unmarshal(t.Payload(), &p)

		rules := fetchMatchingRules(ctx, db, p.IssueID, p.TimesSeen, p.WasResolved)

		for _, rule := range rules {
			dedupKey := fmt.Sprintf("notif:dedup:%s:%s", p.IssueID, rule.ID)
			set, err := rdb.SetNX(ctx, dedupKey, 1, 5*time.Minute).Result()
			if err != nil || !set {
				continue // already notified in the last 5 min for this issue+rule
			}
			dispatch(ctx, rule, p)
		}
		return nil
	}
}

func dispatch(ctx context.Context, rule AlertRule, p NotifyPayload) {
	switch rule.ActionType {
	case "slack":
		sendSlack(rule.ActionConfig["webhook_url"], fmt.Sprintf(
			"🔴 Issue seen %d times — <https://litetrace.io/issues/%s|view>", p.TimesSeen, p.IssueID))
	case "webhook":
		sendGenericWebhook(rule.ActionConfig["url"], map[string]interface{}{
			"issue_id": p.IssueID, "times_seen": p.TimesSeen, "event": "issue_notification",
		})
	}
}

func sendSlack(webhookURL string, text string) {
	body, _ := json.Marshal(map[string]string{"text": text})
	http.Post(webhookURL, "application/json", bytesReader(body))
}

func sendGenericWebhook(url string, payload map[string]interface{}) {
	body, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", url, bytesReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-LiteTrace-Signature", signPayload(body)) // HMAC
	http.DefaultClient.Do(req)
}
```

### 2.6 Rule matching logic (what `fetchMatchingRules` actually checks)

```go
func fetchMatchingRules(ctx context.Context, db *pgxpool.Pool, issueID string, timesSeen int, wasResolved bool) []AlertRule {
	rows, _ := db.Query(ctx, `
		SELECT ar.id, ar.trigger_type, ar.threshold, ar.action_type, ar.action_config
		FROM alert_rules ar
		JOIN issues i ON i.project_key = ar.project_key
		WHERE i.id = $1
	`, issueID)

	var matched []AlertRule
	for rows.Next() {
		var r AlertRule
		rows.Scan(&r.ID, &r.TriggerType, &r.Threshold, &r.ActionType, &r.ActionConfig)

		switch r.TriggerType {
		case "new_issue":
			if timesSeen == 1 {
				matched = append(matched, r)
			}
		case "regression":
			if wasResolved {
				matched = append(matched, r)
			}
		case "frequency":
			if timesSeen >= r.Threshold {
				matched = append(matched, r)
			}
		}
	}
	return matched
}
```

---

## PART 3 — Notification Flow, End to End (for LiteTrace)

```
App throws error
   → SDK captures (stack + breadcrumbs), batches in memory
   → POST /api/1/events/{project_key} (async, non-blocking)
        → Rate limit check (Redis INCR/EXPIRE)
        → XADD to litetrace:events stream
   → Fingerprint worker consumes stream
        → SHA1(in_app frames) = fingerprint
        → UPSERT issues (project_key, fingerprint) ON CONFLICT
        → Enqueue Asynq task: notify:check
   → Notification worker picks up task
        → Query alert_rules for this project
        → Match trigger_type against (times_seen, was_resolved)
        → For each matched rule: SETNX dedup key (5 min TTL)
        → If not already sent recently: dispatch to Slack / webhook / email
   → notification_log row written (audit trail + "notified at" for dashboard)
```

## PART 4 — What to build first (MVP cut)

| Priority | Component | Why first |
|---|---|---|
| 1 | Ingest API + Redis stream | Nothing works without capture |
| 2 | Fingerprint worker + Postgres upsert | Core value prop — dedup |
| 3 | `new_issue` trigger only, webhook action only | Simplest notification path |
| 4 | Dashboard read (Next.js, list issues) | Needed for demo/pitch |
| 5 | Frequency-based rules + Slack action | Add once core loop is proven |
| 6 | Digest/batching for high-frequency issues | Polish, not MVP-blocking |

Skip for v1: symbolication (assume unminified/dev builds), custom fingerprint override, PII scrubbing rules engine — hardcode a basic regex strip instead.

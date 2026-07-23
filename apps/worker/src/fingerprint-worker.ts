import { redisConnection, enqueueAlert } from '@prod-own/queue';
import { prisma } from '@prod-own/db';
import { scrubContent, scrubMetadata, fingerprint as computeFingerprint } from '@prod-own/ingest';

const STREAM_KEY = 'litetrace:events';

/**
 * Starts the Redis Stream consumer for the ingest pipeline.
 *
 * Uses XREAD BLOCK to efficiently wait for new events without busy-polling.
 * On each event it:
 *  1. Scrubs content (already scrubbed at ingest, belt-and-suspenders check)
 *  2. Computes a stable SHA-256 fingerprint via normalised stack trace
 *  3. Upserts the Issue (create or update lastSeen/eventCount/status)
 *  4. Creates the raw Event record
 *  5. Enqueues an alert job if the issue is new or re-opened
 *
 * @returns A stop function — call it to abort the loop cleanly.
 */
export function startFingerprintWorker(): () => void {
  const abortController = new AbortController();
  console.log(`[Fingerprint Worker] Starting Redis Stream consumer on ${STREAM_KEY}`);

  async function loop() {
    // '$' means: only read messages that arrive after this consumer starts.
    // On reconnect we could persist lastId, but for V1 we accept re-delivery.
    let lastId = '$';

    while (!abortController.signal.aborted) {
      try {
        const results = await redisConnection.xread(
          'BLOCK', 5000,
          'STREAMS', STREAM_KEY,
          lastId
        );

        if (!results) continue; // timeout — loop again

        for (const [, messages] of results) {
          for (const [messageId, fields] of messages) {
            // ioredis returns fields as a flat array: [key1, val1, key2, val2, ...]
            let payloadStr = '';
            for (let i = 0; i < fields.length; i += 2) {
              if (fields[i] === 'payload') {
                payloadStr = fields[i + 1] ?? '';
                break;
              }
            }

            if (payloadStr) {
              await processEvent(payloadStr);
            }

            lastId = messageId;
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes('Connection is closed')) {
          console.log('[Fingerprint Worker] Redis connection closed — stopping.');
          break;
        }
        console.error('[Fingerprint Worker] Error in stream loop:', err);
        // Brief sleep to avoid a tight crash loop on transient errors
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    console.log('[Fingerprint Worker] Stopped.');
  }

  loop();

  return () => {
    abortController.abort();
  };
}

async function processEvent(payloadStr: string): Promise<void> {
  try {
    const event = JSON.parse(payloadStr) as Record<string, unknown>;
    const { tenantId, sourceId, content: rawContent, metadata, environment, release } = event;

    if (typeof tenantId !== 'string' || typeof sourceId !== 'string' || typeof rawContent !== 'string') {
      console.warn('[Fingerprint Worker] Dropping malformed event — missing required fields.');
      return;
    }

    // Belt-and-suspenders scrub (primary scrub happens at the ingest API)
    const { content } = scrubContent(rawContent);

    // Parse metadata — may be a JSON string or an object
    let parsedMetadata: Record<string, unknown> | undefined;
    if (typeof metadata === 'string') {
      try { parsedMetadata = JSON.parse(metadata); } catch { parsedMetadata = undefined; }
    } else if (typeof metadata === 'object' && metadata !== null) {
      parsedMetadata = metadata as Record<string, unknown>;
    }

    const scrubbedMeta = scrubMetadata(parsedMetadata);

    // Compute stable fingerprint from normalised stack trace
    const { fingerprint, title } = computeFingerprint(content);

    // Upsert Issue
    const existingIssue = await prisma.issue.findUnique({
      where: { sourceId_fingerprint: { sourceId, fingerprint } },
    });

    let issueId: string;
    let trigger: 'new_issue' | 'reopened' | null = null;

    if (existingIssue) {
      issueId = existingIssue.id;

      await prisma.issue.update({
        where: { id: issueId },
        data: {
          eventCount: { increment: 1 },
          lastSeen: new Date(),
          // Re-open resolved issues on new occurrence
          status: existingIssue.status === 'RESOLVED' ? 'OPEN' : existingIssue.status,
        },
      });

      if (existingIssue.status === 'RESOLVED') {
        trigger = 'reopened';
      }
    } else {
      console.log(`[Fingerprint Worker] New issue — fingerprint: ${fingerprint.slice(0, 12)}...`);
      const newIssue = await prisma.issue.create({
        data: {
          tenantId,
          sourceId,
          fingerprint,
          title,
          eventCount: 1,
          status: 'OPEN',
        },
      });
      issueId = newIssue.id;
      trigger = 'new_issue';
    }

    // Persist raw event
    await prisma.event.create({
      data: {
        tenantId,
        sourceId,
        issueId,
        content,
        metadata: (scrubbedMeta ?? {}) as Parameters<typeof prisma.event.create>[0]['data']['metadata'],
        environment: typeof environment === 'string' ? environment : 'unknown',
        release: typeof release === 'string' ? release : 'unknown',
      },
    });

    if (trigger) {
      console.log(`[Fingerprint Worker] Enqueuing alert: ${trigger} for issue ${issueId}`);
      await enqueueAlert(issueId, trigger);
    }
  } catch (err: unknown) {
    console.error('[Fingerprint Worker] Error processing event payload:', err);
  }
}

import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '../../../../../lib/role-guard';
import { redisConnection, createFingerprintQueue, createAlertQueue } from '@litetrace/queue';

/**
 * GET /api/admin/platform/health
 *
 * Retrieves health metrics for the data pipeline:
 * - Redis Streams backlog (litetrace:events)
 * - BullMQ queue counts (alerts, fingerprints)
 *
 * 🔐 Requires: SUPER_ADMIN
 */
export async function GET() {
  const guard = await requireSuperAdmin();
  if (guard) return guard.response;

  try {
    let streamLag = 0;
    try {
      // Query redis streams for consumer group info to calculate lag
      const groups = await redisConnection.xinfo('GROUPS', 'litetrace:events') as unknown[];
      if (groups && groups.length > 0) {
        // Find the fingerprint worker group (assuming it's the primary consumer)
        const fpGroup = groups.find((g: unknown) => {
          // Flatten array of arrays to key-value object
          const dict: Record<string, unknown> = {};
          if (Array.isArray(g)) {
            for (let i = 0; i < g.length; i += 2) {
              dict[g[i] as string] = g[i + 1];
            }
          }
          return dict.name === 'fingerprint_workers' || true; // Fallback to first group
        });
        
        if (fpGroup && Array.isArray(fpGroup)) {
          const dict: Record<string, unknown> = {};
          for (let i = 0; i < fpGroup.length; i += 2) {
            dict[fpGroup[i] as string] = fpGroup[i + 1];
          }
          streamLag = (typeof dict.lag === 'number' ? dict.lag : 0) || (typeof dict.pending === 'number' ? dict.pending : 0);
        }
      }
    } catch (streamErr) {
      // Stream might not exist yet if no events ingested
      console.warn('[Admin Health] Could not read stream lag:', streamErr);
    }

    const fingerprintQueue = createFingerprintQueue();
    const alertQueue = createAlertQueue();

    const [fpCounts, alertCounts] = await Promise.all([
      fingerprintQueue.getJobCounts('waiting', 'active', 'failed', 'delayed'),
      alertQueue.getJobCounts('waiting', 'active', 'failed', 'delayed'),
    ]);

    await fingerprintQueue.close();
    await alertQueue.close();

    return NextResponse.json(
      {
        health: {
          streamLag,
          queues: {
            fingerprints: fpCounts,
            alerts: alertCounts,
          }
        }
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[Admin Health] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch platform health' }, { status: 500 });
  }
}

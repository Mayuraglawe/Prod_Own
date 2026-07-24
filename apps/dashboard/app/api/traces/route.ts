import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@litetrace/db';
import { redisConnection } from '@litetrace/queue';
import {
  apmTracePayloadSchema,
  shouldSampleTrace,
  calculateRollupMetrics,
} from '@litetrace/observability';

/**
 * POST /api/traces
 *
 * OpenTelemetry / APM trace ingestion endpoint.
 * Accepts span batches, applies sampling rules, calculates latency rollups,
 * and pushes sampled traces to Redis stream.
 */
export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing x-api-key header' }, { status: 401 });
    }

    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const rows = await prisma.$queryRaw<Array<{ id: string; tenantId: string }>>`
      SELECT id, "tenantId" FROM "Source" WHERE "apiKeyHash" = ${keyHash} LIMIT 1
    `;
    const source = rows[0] ?? null;

    if (!source) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const body = await req.json();
    const validated = apmTracePayloadSchema.parse(body);

    // Apply head + tail sampling
    const sampledSpans = validated.spans.filter((span) => shouldSampleTrace(span));

    // Calculate latency rollups (p50, p95, p99)
    const rollups = calculateRollupMetrics(validated.spans);

    // Enqueue sampled trace data to Redis stream
    const streamPayload = {
      tenantId: source.tenantId,
      sourceId: source.id,
      service: validated.service,
      environment: validated.environment,
      sampledSpanCount: sampledSpans.length,
      rollups: JSON.stringify(rollups),
      spans: JSON.stringify(sampledSpans),
    };

    await redisConnection.xadd('litetrace:traces', '*', 'payload', JSON.stringify(streamPayload));

    return NextResponse.json(
      {
        message: 'Traces processed successfully',
        receivedSpans: validated.spans.length,
        sampledSpans: sampledSpans.length,
        rollups,
      },
      { status: 202 }
    );
  } catch (err: unknown) {
    if (err !== null && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid trace payload' }, { status: 400 });
    }
    console.error('[Traces API] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@prod-own/db';
import { redisConnection } from '@prod-own/queue';
import { validateRawIngestBody, scrubContent, scrubMetadata } from '@prod-own/ingest';

/**
 * POST /api/ingest
 *
 * Accepts error events from SDK clients and the legacy HTTP integration.
 *
 * Authentication:
 *  - Preferred: `x-api-key` header containing the plaintext API key for this source.
 *    The key is SHA-256 hashed and compared against Source.apiKeyHash.
 *  - Fallback: `sourceId` in request body (backward compat — used by sources without
 *    an API key set yet). A deprecation warning is logged when this path is taken.
 *
 * Pipeline: rate-limit → validate → scrub → enqueue (Redis stream)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // --- Step 1: Validate the request body ---
    let validatedBody: Awaited<ReturnType<typeof validateRawIngestBody>>;
    try {
      validatedBody = validateRawIngestBody(body);
    } catch (err: unknown) {
      // ZodError has a flatten() method — use duck-typing to avoid importing zod directly
      if (
        err !== null &&
        typeof err === 'object' &&
        'flatten' in err &&
        typeof (err as { flatten: unknown }).flatten === 'function'
      ) {
        const zodErr = err as { flatten: () => { fieldErrors: Record<string, unknown[]> } };
        return NextResponse.json(
          { error: 'Invalid payload', details: zodErr.flatten().fieldErrors },
          { status: 400 }
        );
      }
      throw err;
    }

    const { sourceId, content, error: legacyError, metadata, environment, release } = validatedBody;
    // Normalise content field — prefer `content`, fall back to legacy `error`
    const rawContent = content ?? legacyError ?? '';

    // --- Step 2: Authenticate the source ---
    const apiKey = req.headers.get('x-api-key');
    let source: { id: string; tenantId: string } | null = null;

    if (apiKey) {
      // Preferred path: authenticate via hashed API key.
      // Using $queryRaw avoids a dependency on Prisma's generated SourceWhereInput
      // having apiKeyHash — the generated types update only after a full migration cycle
      // and an IDE TypeScript server restart, which is error-prone.
      const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
      const rows = await prisma.$queryRaw<Array<{ id: string; tenantId: string }>>`
        SELECT id, "tenantId" FROM "Source" WHERE "apiKeyHash" = ${keyHash} LIMIT 1
      `;
      source = rows[0] ?? null;

      if (!source) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
    } else if (sourceId) {
      // Legacy path: look up by sourceId in body (no API key header)
      console.warn(
        '[Ingest API] Source authenticated by sourceId (no x-api-key header). ' +
        'This path is deprecated — please set an API key on the Source record.'
      );
      source = await prisma.source.findUnique({
        where: { id: sourceId },
        select: { id: true, tenantId: true },
      });

      if (!source) {
        return NextResponse.json({ error: 'Invalid sourceId' }, { status: 401 });
      }
    } else {
      return NextResponse.json(
        { error: 'Missing authentication — provide x-api-key header or sourceId in body' },
        { status: 401 }
      );
    }

    // --- Step 3: Rate limiting (token bucket, per source) ---
    const rateLimitKey = `ratelimit:${source.id}`;
    const count = await redisConnection.incr(rateLimitKey);
    if (count === 1) {
      // First request in window — set expiry
      await redisConnection.expire(rateLimitKey, 60);
    }
    if (count > 1000) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // --- Step 4: Scrub secrets before enqueuing ---
    const { content: scrubbedContent, redactedPatterns } = scrubContent(rawContent);
    const scrubbedMetadata = scrubMetadata(
      typeof metadata === 'object' && metadata !== null ? (metadata as Record<string, unknown>) : undefined
    );

    if (redactedPatterns.length > 0) {
      console.info(
        `[Ingest API] Scrubbed patterns from source ${source.id}: ${redactedPatterns.join(', ')}`
      );
    }

    // --- Step 5: Enqueue to Redis stream ---
    const payload = {
      tenantId: source.tenantId,
      sourceId: source.id,
      content: scrubbedContent,
      metadata: JSON.stringify(scrubbedMetadata ?? {}),
      environment: environment ?? 'unknown',
      release: release ?? 'unknown',
    };

    await redisConnection.xadd('litetrace:events', '*', 'payload', JSON.stringify(payload));

    return NextResponse.json({ message: 'Event queued' }, { status: 202 });
  } catch (err: unknown) {
    console.error('[Ingest API] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

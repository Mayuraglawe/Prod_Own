import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@litetrace/db';
import { uploadSourceMapSchema, registerSourceMap } from '@litetrace/ingest';

/**
 * POST /api/sourcemaps
 *
 * Accepts source map uploads during CI/CD build pipelines.
 * Authentication: `x-api-key` header (hashed and matched against Source.apiKeyHash).
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
    const validated = uploadSourceMapSchema.parse(body);

    const record = registerSourceMap({
      tenantId: source.tenantId,
      release: validated.release,
      minifiedUrl: validated.minifiedUrl,
      mapData: validated.mapData,
    });

    return NextResponse.json(
      { message: 'Source map uploaded successfully', id: record.id },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (err !== null && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid payload schema' }, { status: 400 });
    }
    console.error('[SourceMaps API] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

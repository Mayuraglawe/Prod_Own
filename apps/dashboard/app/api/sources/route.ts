import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@litetrace/db';

/**
 * GET /api/sources
 * Returns all configured ingest sources (projects) for the tenant.
 */
export async function GET() {
  try {
    const sources = await prisma.source.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        tenantId: true,
        externalId: true,
        name: true,
        apiKeyPrefix: true,
        createdAt: true,
        _count: {
          select: {
            events: true,
            issues: true,
          },
        },
      },
    });

    return NextResponse.json({ sources }, { status: 200 });
  } catch (err) {
    console.error('[Sources API] Error fetching sources:', err);
    return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 });
  }
}

/**
 * POST /api/sources
 * Creates a new project / ingest source and generates a secure API key.
 *
 * Body: { name: string, externalId?: string, tenantId?: string }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || '').trim();
    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findFirst();
    const tenantId = body.tenantId || tenant?.id || 'tenant-default';

    const externalId =
      String(body.externalId || '')
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-') ||
      name.toLowerCase().replace(/[^a-z0-9_-]/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

    // Generate random API key format: lt_live_<random_bytes_hex>
    const randomHex = crypto.randomBytes(16).toString('hex');
    const plainApiKey = `lt_live_${randomHex}`;
    const apiKeyHash = crypto.createHash('sha256').update(plainApiKey).digest('hex');
    const apiKeyPrefix = plainApiKey.substring(0, 15);

    const source = await prisma.source.create({
      data: {
        name,
        externalId,
        tenantId,
        apiKeyHash,
        apiKeyPrefix,
      },
    });

    return NextResponse.json(
      {
        message: 'Project created successfully',
        source: {
          id: source.id,
          name: source.name,
          externalId: source.externalId,
          tenantId: source.tenantId,
          apiKeyPrefix: source.apiKeyPrefix,
          createdAt: source.createdAt,
        },
        /** Plaintext API Key — returned ONLY ONCE upon creation! */
        apiKey: plainApiKey,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('[Sources API] Error creating project:', err);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

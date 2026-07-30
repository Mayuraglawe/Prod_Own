import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@litetrace/db';
import { auth } from '../../../auth';

/**
 * GET /api/workspaces
 * Returns list of all Workspaces current user is a member of (with SUPER_ADMIN / ADMIN / EMPLOYEE role),
 * along with each workspace's single dedicated project.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: session.user.id },
      include: {
        tenant: {
          include: {
            sources: {
              take: 1, // Exactly 1 project per workspace
              select: {
                id: true,
                name: true,
                externalId: true,
                apiKeyPrefix: true,
              },
            },
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const workspaces = memberships.map((m) => ({
      id: m.tenant.id,
      name: m.tenant.name,
      slug: m.tenant.slug,
      role: m.role,
      project: m.tenant.sources[0] || null,
      createdAt: m.tenant.createdAt,
    }));

    return NextResponse.json({ workspaces }, { status: 200 });
  } catch (err) {
    console.error('[Workspaces API] GET Error:', err);
    return NextResponse.json({ error: 'Failed to fetch workspaces' }, { status: 500 });
  }
}

/**
 * POST /api/workspaces
 * Creates a new Workspace (Tenant), automatically provisions its 1 dedicated Project (Source),
 * generates its DSN/API Key, and assigns creator role as SUPER_ADMIN.
 *
 * Body: { name: string }
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const name = String(body.name || '').trim();

    if (!name) {
      return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

    // 1. Create Workspace (Tenant)
    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
      },
    });

    // 1.5 Assign the creating user as SUPER_ADMIN of this workspace
    await prisma.workspaceMember.create({
      data: {
        userId: session.user.id,
        tenantId: tenant.id,
        role: 'SUPER_ADMIN'
      }
    });

    // 2. Automatically create the 1 single dedicated Project for this Workspace
    const projectName = `${name} Main Project`;
    const externalId = `${slug}-main`;
    const randomHex = crypto.randomBytes(16).toString('hex');
    const plainApiKey = `lt_live_${randomHex}`;
    const apiKeyHash = crypto.createHash('sha256').update(plainApiKey).digest('hex');
    const apiKeyPrefix = plainApiKey.substring(0, 15);

    const project = await prisma.source.create({
      data: {
        tenantId: tenant.id,
        name: projectName,
        externalId,
        apiKeyHash,
        apiKeyPrefix,
      },
    });

    return NextResponse.json(
      {
        message: 'Workspace and dedicated project created successfully',
        workspace: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          role: 'SUPER_ADMIN',
          project: {
            id: project.id,
            name: project.name,
            externalId: project.externalId,
            apiKeyPrefix: project.apiKeyPrefix,
          },
          apiKey: plainApiKey, // Returned once upon creation
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[Workspaces API] POST Error:', err);
    return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
  }
}

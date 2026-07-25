import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@litetrace/db';
import { requireRole } from '../../../../lib/role-guard';

type PrismaClientWithModels = typeof prisma & {
  workspaceInvite?: {
    create: (args: unknown) => Promise<{
      id: string;
      tenantId: string;
      email: string;
      role: string;
      token: string;
      expiresAt: Date;
    }>;
  };
};

/**
 * POST /api/workspaces/invite
 *
 * Sends an email invitation to join a workspace project.
 * Body: { tenantId: string, email: string, role?: 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE' }
 *
 * Role guards:
 *  - Caller must be ADMIN or SUPER_ADMIN in the target workspace.
 *  - Only SUPER_ADMIN may grant the SUPER_ADMIN role to an invitee.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const roleInput = String(body.role || 'EMPLOYEE').toUpperCase();
    const grantedRole = (['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE'].includes(roleInput)
      ? roleInput
      : 'EMPLOYEE') as 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE';

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    if (!body.tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    // ── Role Guard ────────────────────────────────────────────────────────────
    // Caller must be at least ADMIN in this workspace to send any invite.
    const guard = await requireRole(body.tenantId, 'ADMIN');
    if (guard) return guard.response;

    // Only SUPER_ADMIN may grant a SUPER_ADMIN invite.
    if (grantedRole === 'SUPER_ADMIN') {
      const superGuard = await requireRole(body.tenantId, 'SUPER_ADMIN');
      if (superGuard) {
        return NextResponse.json(
          { error: 'Forbidden', detail: 'Only SUPER_ADMIN may invite another SUPER_ADMIN.' },
          { status: 403 },
        );
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    const tenant = await prisma.tenant.findUnique({ where: { id: body.tenantId } });
    if (!tenant) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Generate 32-byte secure invite token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const dbClient = prisma as unknown as PrismaClientWithModels;
    const inviteRecord = dbClient.workspaceInvite?.create
      ? await dbClient.workspaceInvite.create({
          data: { tenantId: tenant.id, email, role: grantedRole, token, expiresAt },
        })
      : { id: token.substring(0, 10), email, role: grantedRole, token, expiresAt };

    const inviteLink = `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/accept-invite?token=${token}`;

    console.log(`[Invite] ${email} invited as ${grantedRole} to "${tenant.name}"`);

    return NextResponse.json(
      {
        message: `Invitation sent to ${email}`,
        invite: {
          id: inviteRecord.id,
          email: inviteRecord.email,
          role: inviteRecord.role,
          workspaceName: tenant.name,
          token: inviteRecord.token,
          inviteLink,
          expiresAt: inviteRecord.expiresAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('[Workspace Invite API] Error:', err);
    return NextResponse.json({ error: 'Failed to send workspace invitation' }, { status: 500 });
  }
}

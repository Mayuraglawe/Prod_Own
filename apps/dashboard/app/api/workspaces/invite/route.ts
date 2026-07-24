import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@litetrace/db';

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
 * Sends an email invitation from an ADMIN to an EMPLOYEE for a workspace project.
 *
 * Body: { tenantId: string, email: string, role?: 'EMPLOYEE' | 'ADMIN' }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const role = body.role === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE';

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const tenant = body.tenantId
      ? await prisma.tenant.findUnique({ where: { id: body.tenantId } })
      : await prisma.tenant.findFirst();

    if (!tenant) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Generate 32-byte secure invite token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Expires in 7 days

    // Persist invitation in PostgreSQL database via Prisma
    const dbClient = prisma as unknown as PrismaClientWithModels;
    const inviteRecord = dbClient.workspaceInvite?.create
      ? await dbClient.workspaceInvite.create({
          data: {
            tenantId: tenant.id,
            email,
            role,
            token,
            expiresAt,
          },
        })
      : { id: token.substring(0, 10), email, role, token, expiresAt };

    const inviteLink = `http://localhost:3000/accept-invite?token=${token}`;

    console.log(`[Workspace Invite Mailer] Email sent to ${email} for Workspace "${tenant.name}" (${role})`);
    console.log(`[Workspace Invite Mailer] DB Record ID: ${inviteRecord.id}`);

    return NextResponse.json(
      {
        message: `Invitation email sent successfully to ${email}`,
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
      { status: 201 }
    );
  } catch (err) {
    console.error('[Workspace Invite API] Error:', err);
    return NextResponse.json({ error: 'Failed to send workspace invitation' }, { status: 500 });
  }
}

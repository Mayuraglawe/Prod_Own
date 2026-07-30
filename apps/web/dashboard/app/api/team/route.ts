import { NextResponse } from 'next/server';
import { prisma } from '@litetrace/db';

type PrismaClientWithModels = typeof prisma & {
  workspaceMember?: {
    findMany: (args: unknown) => Promise<Array<{
      id: string;
      role: string;
      status: string;
      user: { id: string; name: string | null; email: string | null; image: string | null };
    }>>;
  };
  workspaceInvite?: {
    findMany: (args: unknown) => Promise<Array<{
      id: string;
      email: string;
      role: string;
    }>>;
  };
};

/**
 * GET /api/team
 * Dynamically fetches real team members and pending email invites from PostgreSQL DB via Prisma.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantIdParam = searchParams.get('tenantId');

    const tenant = tenantIdParam
      ? await prisma.tenant.findUnique({ where: { id: tenantIdParam } })
      : await prisma.tenant.findFirst();

    if (!tenant) {
      return NextResponse.json({ members: [], invites: [] }, { status: 200 });
    }

    // 1. Fetch real workspace members from DB
    const dbClient = prisma as unknown as PrismaClientWithModels;
    const membersData = await (dbClient.workspaceMember?.findMany ? dbClient.workspaceMember.findMany({
      where: { tenantId: tenant.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    }) : Promise.resolve([]));

    // 2. Fetch pending email invites from DB
    const invitesData = await (dbClient.workspaceInvite?.findMany ? dbClient.workspaceInvite.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: 'desc' },
    }) : Promise.resolve([]));

    // Helper to format role safely
    const formatRole = (rawRole: string): 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE' => {
      const upper = String(rawRole || '').toUpperCase();
      if (upper === 'SUPER_ADMIN' || upper === 'SUPERADMIN' || upper === 'OWNER') return 'SUPER_ADMIN';
      if (upper === 'ADMIN') return 'ADMIN';
      return 'ADMIN';
    };

    // If no members in join table yet, fallback to Users attached directly to Tenant
    type RawMember = { id: string; role: string; status?: string; user: { name: string | null; email: string | null } };
    let members = (membersData as RawMember[]).map((m) => ({
      id: m.id,
      name: m.user.name || m.user.email?.split('@')[0] || 'Member',
      email: m.user.email || '',
      role: formatRole(m.role),
      status: m.status === 'PENDING' ? 'Pending' : 'Active',
    }));

    if (members.length === 0) {
      const dbUsers = await prisma.user.findMany({
        where: { tenantId: tenant.id },
        select: { id: true, name: true, email: true, role: true },
      });

      members = dbUsers.map((u) => ({
        id: u.id,
        name: u.name || u.email?.split('@')[0] || 'Member',
        email: u.email || '',
        role: formatRole(u.role),
        status: 'Active' as const,
      }));
    }

    const invites = invitesData.map((inv: { id: string; email: string; role: string }) => ({
      id: inv.id,
      name: inv.email.split('@')[0] || 'Invited User',
      email: inv.email,
      role: formatRole(inv.role),
      status: 'Pending' as const,
    }));

    return NextResponse.json(
      {
        tenantId: tenant.id,
        tenantName: tenant.name,
        members,
        invites,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[Team API] Error fetching dynamic members from DB:', err);
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}

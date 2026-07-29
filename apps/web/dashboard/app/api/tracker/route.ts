import { NextResponse } from 'next/server';
import { prisma } from '@litetrace/db';

type PrismaClientWithModels = typeof prisma & {
  timeTracker?: {
    findUnique: (args: unknown) => Promise<{
      id: string;
      tenantId: string;
      status: string;
      elapsedSeconds: number;
      lastStartedAt: Date | null;
      updatedAt: Date;
    } | null>;
    create: (args: unknown) => Promise<{
      id: string;
      tenantId: string;
      status: string;
      elapsedSeconds: number;
      lastStartedAt: Date | null;
      updatedAt: Date;
    }>;
    update: (args: unknown) => Promise<{
      id: string;
      tenantId: string;
      status: string;
      elapsedSeconds: number;
      lastStartedAt: Date | null;
      updatedAt: Date;
    }>;
  };
};

/**
 * GET /api/tracker
 * Fetches time tracker state from PostgreSQL DB for the current workspace.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantIdParam = searchParams.get('tenantId');

    const tenant = tenantIdParam
      ? await prisma.tenant.findUnique({ where: { id: tenantIdParam } })
      : await prisma.tenant.findFirst();

    if (!tenant) {
      return NextResponse.json(
        { status: 'STOPPED', elapsedSeconds: 0, isRunning: false },
        { status: 200 }
      );
    }

    const dbClient = prisma as unknown as PrismaClientWithModels;
    let tracker = dbClient.timeTracker?.findUnique
      ? await dbClient.timeTracker.findUnique({ where: { tenantId: tenant.id } })
      : null;

    if (!tracker && dbClient.timeTracker?.create) {
      tracker = await dbClient.timeTracker.create({
        data: {
          tenantId: tenant.id,
          status: 'STOPPED',
          elapsedSeconds: 0,
        },
      });
    }

    let liveElapsed = tracker?.elapsedSeconds || 0;
    if (tracker?.status === 'RUNNING' && tracker?.lastStartedAt) {
      const diffSec = Math.floor((Date.now() - new Date(tracker.lastStartedAt).getTime()) / 1000);
      liveElapsed += Math.max(0, diffSec);
    }

    return NextResponse.json(
      {
        tenantId: tenant.id,
        status: tracker?.status || 'STOPPED',
        elapsedSeconds: liveElapsed,
        isRunning: tracker?.status === 'RUNNING',
        updatedAt: tracker?.updatedAt || new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[Tracker API] GET Error:', err);
    return NextResponse.json({ error: 'Failed to fetch tracker state' }, { status: 500 });
  }
}

/**
 * POST /api/tracker
 * Updates time tracker state in PostgreSQL DB.
 * Body: { action: 'start' | 'pause' | 'stop', tenantId?: string, elapsedSeconds?: number }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body.action || '').toLowerCase(); // 'start' | 'pause' | 'stop'

    const tenant = body.tenantId
      ? await prisma.tenant.findUnique({ where: { id: body.tenantId } })
      : await prisma.tenant.findFirst();

    if (!tenant) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const dbClient = prisma as unknown as PrismaClientWithModels;
    let tracker = dbClient.timeTracker?.findUnique
      ? await dbClient.timeTracker.findUnique({ where: { tenantId: tenant.id } })
      : null;

    const now = new Date();
    let newStatus = 'STOPPED';
    let newElapsed = typeof body.elapsedSeconds === 'number' ? body.elapsedSeconds : 0;
    let newStartedAt: Date | null = null;

    if (action === 'start') {
      newStatus = 'RUNNING';
      newStartedAt = now;
      newElapsed = tracker ? tracker.elapsedSeconds : 0;
    } else if (action === 'pause') {
      newStatus = 'PAUSED';
      if (tracker && tracker.status === 'RUNNING' && tracker.lastStartedAt) {
        const diffSec = Math.floor((now.getTime() - new Date(tracker.lastStartedAt).getTime()) / 1000);
        newElapsed = (tracker.elapsedSeconds || 0) + Math.max(0, diffSec);
      }
    } else if (action === 'stop') {
      newStatus = 'STOPPED';
      newElapsed = 0; // Reset tracking on stop
      newStartedAt = null;
    }

    if (!tracker && dbClient.timeTracker?.create) {
      tracker = await dbClient.timeTracker.create({
        data: {
          tenantId: tenant.id,
          status: newStatus,
          elapsedSeconds: newElapsed,
          lastStartedAt: newStartedAt,
        },
      });
    } else if (dbClient.timeTracker?.update) {
      tracker = await dbClient.timeTracker.update({
        where: { tenantId: tenant.id },
        data: {
          status: newStatus,
          elapsedSeconds: newElapsed,
          lastStartedAt: newStartedAt,
        },
      });
    } else {
      tracker = {
        id: tenant.id,
        tenantId: tenant.id,
        status: newStatus,
        elapsedSeconds: newElapsed,
        lastStartedAt: newStartedAt,
        updatedAt: now,
      };
    }

    const finalStatus = tracker?.status || newStatus;
    const finalElapsed = typeof tracker?.elapsedSeconds === 'number' ? tracker.elapsedSeconds : newElapsed;

    console.log(`[Time Tracker DB] Action: ${action} | Status: ${finalStatus} | Elapsed: ${finalElapsed}s`);

    return NextResponse.json(
      {
        message: `Tracker ${action}ed successfully`,
        status: finalStatus,
        elapsedSeconds: finalElapsed,
        isRunning: finalStatus === 'RUNNING',
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[Tracker API] POST Error:', err);
    return NextResponse.json({ error: 'Failed to update tracker state' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '../../../../../lib/role-guard';
// import { auditService } from '@repo/core/main/src/services/audit-service';

export async function PATCH(request: Request) {
  const guard = await requireSuperAdmin();
  if (guard) return guard.response; // 403 or 401

  try {
    const body = await request.json();
    const { flagKey, globalState } = body;

    // TODO: Update feature flag in Redis / Postgres

    // Immutable WORM Audit Logging
    // await auditService.logSuperadminAction({
    //   actorId: 'unknown',
    //   actorEmail: 'admin@example.com', 
    //   actionType: 'FEATURE_FLAG_TOGGLE',
    //   targetResourceId: flagKey,
    //   oldState: { enabled: !globalState },
    //   newState: { enabled: globalState, incidentReference },
    //   ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
    // });

    return NextResponse.json({
      success: true,
      data: {
        flagKey,
        globalState,
        message: "Feature flag toggled globally."
      }
    });
  } catch (error) {
    console.error('Failed to toggle feature flag:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

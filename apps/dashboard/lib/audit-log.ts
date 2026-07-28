import { prisma } from '@litetrace/db';
import crypto from 'crypto';

export type AuditAction =
  | 'tenant.suspend'
  | 'tenant.unsuspend'
  | 'tenant.delete'
  | 'tenant.updated'
  | 'member.role_changed'
  | 'member.removed'
  | 'invite.sent'
  | 'tenant.impersonate_start'
  | 'tenant.plan_override';

/**
 * Writes an immutable audit log entry for any Super Admin action.
 * Should be called immediately AFTER the primary DB operation succeeds.
 *
 * @param actorId  - User.id of the Super Admin performing the action
 * @param action   - Machine-readable action key (e.g. "tenant.suspend")
 * @param detail   - Human-readable description ("Tenant 'Acme Corp' suspended")
 * @param tenantId - Affected tenant ID (optional for platform-wide actions)
 * @param payload  - Any extra context to store for forensics (JSON)
 */
export async function writeAuditLog({
  actorId,
  action,
  detail,
  tenantId,
  payload,
}: {
  actorId: string;
  action: AuditAction;
  detail: string;
  tenantId?: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbClient = prisma as any;
    if (typeof dbClient.auditLog?.create === 'function') {
      await dbClient.auditLog.create({
        data: {
          id: crypto.randomUUID(),
          actorId,
          action,
          detail,
          tenantId: tenantId ?? null,
          payload: payload ?? null,
        },
      });
    } else {
      // Graceful degradation: log to stdout if model not yet available
      console.warn(`[AuditLog] Model unavailable — action: ${action} | detail: ${detail}`);
    }
  } catch (err) {
    // Audit log failure must NEVER block the primary operation
    console.error('[AuditLog] Failed to write audit log:', err);
  }
}

import { randomUUID } from 'crypto';

export type AuditActionType = 'SUSPEND_ORG' | 'TIER_UPGRADE' | 'USER_DELETE' | 'FEATURE_FLAG_TOGGLE';

export interface AuditLogPayload {
  actorId: string;
  actorEmail: string;
  actionType: AuditActionType;
  targetResourceId: string;
  oldState?: any;
  newState?: any;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Logs a superadmin action to the global audit log in ClickHouse.
   * This is a WORM (Write-Once-Read-Many) compliant log.
   */
  async logSuperadminAction(payload: AuditLogPayload): Promise<void> {
    // In a real implementation, this would use a ClickHouse client
    // e.g., import { clickhouse } from '@litetrace/infrastructure/db/clickhouse';
    
    const record = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      actor_id: payload.actorId,
      actor_email: payload.actorEmail,
      action_type: payload.actionType,
      target_resource_id: payload.targetResourceId,
      old_state: payload.oldState ? JSON.stringify(payload.oldState) : '{}',
      new_state: payload.newState ? JSON.stringify(payload.newState) : '{}',
      ip_address: payload.ipAddress || 'unknown',
      user_agent: payload.userAgent || 'unknown'
    };

    try {
      // Mocked ClickHouse Insert
      // await clickhouse.insert({
      //   table: 'global_audit_logs',
      //   values: [record],
      //   format: 'JSONEachRow'
      // });
      console.log('[AuditService] Logged WORM audit record:', record);
    } catch (error) {
      console.error('[AuditService] Critical Failure: Could not write audit log!', error);
      // Depending on strictness, we might want to throw here to fail the parent request
      // if the audit log cannot be written (fail-secure).
      throw new Error('Audit Logging Failed');
    }
  }
}

export const auditService = new AuditService();

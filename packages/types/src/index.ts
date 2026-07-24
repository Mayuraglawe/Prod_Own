/**
 * Unique identifier for a tenant/organization.
 * Used for RLS (Row Level Security) and project isolation.
 */
export type TenantId = string;

/**
 * Payload sent to the ingest system to process and generate an error fingerprint.
 */
export type FingerprintJobPayload = {
  /** The tenant to which this error event belongs */
  tenantId: TenantId;
  /** The external source ID (e.g. 'api-server', 'web-dashboard') */
  sourceId: string;
  /** The raw error message or stack trace content */
  content: string;
  /** Additional contextual info (e.g. browser, ip, url) */
  metadata?: Record<string, unknown>;
};

/**
 * Supported alert destination channels.
 */
export type AlertChannel = 'slack' | 'n8n';

/**
 * Event structure representing an alert triggered by fingerprint matching
 * and queued for dispatch.
 */
export type AlertEvent = {
  tenantId: TenantId;
  channel: AlertChannel;
  title: string;
  message: string;
  severity?: 'info' | 'warning' | 'critical';
};

/**
 * Payload representing incoming payment webhook events (e.g. subscription status changes).
 */
export type PaymentWebhookEvent = {
  tenantId: TenantId;
  provider: 'razorpay';
  event: string;
  payload: Record<string, unknown>;
};

/**
 * User roles in a Workspace project.
 */
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE';

/**
 * Representation of a Workspace (Organization/Tenant) containing exactly 1 project.
 */
export type Workspace = {
  id: string;
  slug: string;
  name: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

/**
 * Workspace membership record.
 */
export type WorkspaceMember = {
  id: string;
  userId: string;
  tenantId: string;
  role: UserRole;
  createdAt: Date | string;
};

/**
 * Email invitation to join a workspace project as EMPLOYEE, ADMIN, or SUPER_ADMIN.
 */
export type WorkspaceInvite = {
  id: string;
  tenantId: string;
  email: string;
  role: UserRole;
  token: string;
  expiresAt: Date | string;
  createdAt: Date | string;
};



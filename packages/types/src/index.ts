export type TenantId = string;

export type FingerprintJobPayload = {
  tenantId: TenantId;
  sourceId: string;
  content: string;
  metadata?: Record<string, unknown>;
};

export type AlertChannel = 'slack' | 'n8n';

export type AlertEvent = {
  tenantId: TenantId;
  channel: AlertChannel;
  title: string;
  message: string;
  severity?: 'info' | 'warning' | 'critical';
};

export type PaymentWebhookEvent = {
  tenantId: TenantId;
  provider: 'razorpay';
  event: string;
  payload: Record<string, unknown>;
};

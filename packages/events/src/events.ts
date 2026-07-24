export enum EventTopic {
  TELEMETRY_RECEIVED = 'telemetry.received',
  TELEMETRY_PROCESSED = 'telemetry.processed',
  ISSUE_GROUPED = 'issue.grouped',
  ALERT_TRIGGERED = 'alert.triggered',
  ATTACHMENT_UPLOADED = 'attachment.uploaded',
}

export interface BaseEvent<T = unknown> {
  eventId: string;
  topic: EventTopic;
  timestamp: string;
  tenantId: string;
  projectId: string;
  payload: T;
  correlationId?: string;
  retryCount?: number;
}

export interface TelemetryReceivedPayload {
  rawBody: string;
  headers: Record<string, string | undefined>;
  sdkName?: string;
  sdkVersion?: string;
  clientIp?: string;
}

export interface TelemetryProcessedPayload {
  eventId: string;
  type: 'error' | 'transaction' | 'metric';
  level: string;
  message: string;
  culprit?: string;
  exception?: {
    type: string;
    value: string;
    stacktrace?: Array<{
      filename: string;
      lineno: number;
      colno?: number;
      function?: string;
      in_app?: boolean;
    }>;
  };
  scrubbedPayload: Record<string, unknown>;
  s3BlobUri?: string;
  environment?: string;
  release?: string;
}

export interface IssueGroupedPayload {
  issueId: string;
  fingerprint: string;
  title: string;
  culprit?: string;
  level: string;
  isNew: boolean;
  occurrenceCount: number;
  lastSeen: string;
  eventId: string;
}

export interface AlertTriggeredPayload {
  alertId: string;
  ruleName: string;
  issueId: string;
  projectKey: string;
  issueTitle: string;
  occurrenceBurstCount: number;
  channels: Array<'slack' | 'webhook' | 'email'>;
  webhookUrl?: string;
  message: string;
}

export interface AttachmentUploadedPayload {
  attachmentId: string;
  s3Bucket: string;
  s3Key: string;
  sizeBytes: number;
  contentType: string;
}

export type EventPayloadMap = {
  [EventTopic.TELEMETRY_RECEIVED]: TelemetryReceivedPayload;
  [EventTopic.TELEMETRY_PROCESSED]: TelemetryProcessedPayload;
  [EventTopic.ISSUE_GROUPED]: IssueGroupedPayload;
  [EventTopic.ALERT_TRIGGERED]: AlertTriggeredPayload;
  [EventTopic.ATTACHMENT_UPLOADED]: AttachmentUploadedPayload;
};

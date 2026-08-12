/**
 * Defines the core messaging topics (Kafka/Redpanda topics) that drive the
 * asynchronous, decoupled microservices architecture of LiteTrace.
 */
export enum EventTopic {
  /** Emitted by Ingest API when raw telemetry is received. Consumed by Processing Service. */
  TELEMETRY_RECEIVED = 'telemetry.received',
  /** Emitted by Processing Service after PII scrubbing/parsing. Consumed by Grouping Service. */
  TELEMETRY_PROCESSED = 'telemetry.processed',
  /** Emitted by Grouping Service after deduplication. Consumed by Alerting Service. */
  ISSUE_GROUPED = 'issue.grouped',
  /** Emitted by Alerting Service when rules match. Consumed by Notification Service. */
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

/**
 * Payload produced by the Processing Service after successfully decoding
 * and sanitizing a raw telemetry payload. 
 */
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

/**
 * Payload produced by the Grouping Service.
 * Represents an error occurrence that has been fingerprinted and mapped to a specific Issue (either new or existing).
 */
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

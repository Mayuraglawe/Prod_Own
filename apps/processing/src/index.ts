import { IEventBus, EventTopic, BaseEvent, TelemetryReceivedPayload } from '@litetrace/events';

export interface S3BlobStore {
  uploadBlob(key: string, content: string): Promise<string>;
}

export class InMemoryS3BlobStore implements S3BlobStore {
  private blobs = new Map<string, string>();

  public async uploadBlob(key: string, content: string): Promise<string> {
    const s3Uri = `s3://litetrace-blobs/${key}`;
    this.blobs.set(s3Uri, content);
    return s3Uri;
  }
}

export interface ParsedTelemetry {
  level?: string;
  message?: string;
  culprit?: string;
  transaction?: string;
  environment?: string;
  release?: string;
  exception?: {
    values?: Array<{ value?: string }>;
  };
  [key: string]: unknown;
}

export class ProcessingService {
  constructor(
    private readonly eventBus: IEventBus,
    private readonly s3Store: S3BlobStore = new InMemoryS3BlobStore()
  ) {}

  public scrubPII(rawText: string): string {
    return rawText
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[SCRUBBED_EMAIL]')
      .replace(/(bearer\s+)[a-zA-Z0-9._~+/-]+=*/gi, '$1[SCRUBBED_TOKEN]')
      .replace(/(api_key=|apikey=)[a-zA-Z0-9_-]+/gi, '$1[SCRUBBED_KEY]');
  }

  public async handleTelemetryReceived(event: BaseEvent<TelemetryReceivedPayload>): Promise<void> {
    const scrubbedBody = this.scrubPII(event.payload.rawBody);
    let parsed: ParsedTelemetry = {};
    try {
      parsed = JSON.parse(scrubbedBody);
    } catch {
      parsed = { message: scrubbedBody };
    }

    const s3Uri = await this.s3Store.uploadBlob(`raw/${event.tenantId}/${event.eventId}.json`, scrubbedBody);

    await this.eventBus.publish(
      EventTopic.TELEMETRY_PROCESSED,
      {
        eventId: event.eventId,
        type: 'error',
        level: parsed.level || 'error',
        message: parsed.message || parsed.exception?.values?.[0]?.value || 'Unknown Error',
        culprit: parsed.culprit || parsed.transaction,
        scrubbedPayload: parsed,
        s3BlobUri: s3Uri,
        environment: parsed.environment || 'production',
        release: parsed.release,
      },
      {
        tenantId: event.tenantId,
        projectId: event.projectId,
      }
    );
  }
}

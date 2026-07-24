import { IEventBus, EventTopic } from '@litetrace/events';

export class IngestionService {
  constructor(private readonly eventBus: IEventBus) {}

  public async processIngestRequest(params: {
    rawBody: string;
    headers: Record<string, string | undefined>;
    tenantId: string;
    projectId: string;
  }): Promise<{ eventId: string; status: string }> {
    if (!params.rawBody || params.rawBody.trim().length === 0) {
      throw new Error('Payload Body Cannot Be Empty');
    }

    const event = await this.eventBus.publish(
      EventTopic.TELEMETRY_RECEIVED,
      {
        rawBody: params.rawBody,
        headers: params.headers,
        sdkName: params.headers['x-sdk-name'],
        sdkVersion: params.headers['x-sdk-version'],
      },
      {
        tenantId: params.tenantId,
        projectId: params.projectId,
      }
    );

    return {
      eventId: event.eventId,
      status: 'QUEUED',
    };
  }
}

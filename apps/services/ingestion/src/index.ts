import { IEventBus, EventTopic } from '@litetrace/events';

/**
 * The IngestionService is the high-throughput write API entry point for the LiteTrace platform.
 * 
 * Architecture Role:
 * It receives raw payload data from client SDKs, validates it, and immediately pushes it 
 * to the EventBus (backed by Kafka/Redpanda) on the `TELEMETRY_RECEIVED` topic. 
 * This design ensures that the API responds as fast as possible without blocking on 
 * database writes or heavy processing, enforcing CQRS principles.
 */
export class IngestionService {
  constructor(private readonly eventBus: IEventBus) {}

  /**
   * Processes a raw telemetry payload from an SDK and enqueues it for asynchronous processing.
   * 
   * @param params - The raw HTTP request parameters including the body and headers.
   * @returns An object containing the generated eventId and the queuing status.
   * @throws Error if the payload body is empty.
   */
  public async processIngestRequest(params: {
    rawBody: string;
    headers: Record<string, string | undefined>;
    tenantId: string;
    projectId: string;
  }): Promise<{ eventId: string; status: string }> {
    if (!params.rawBody || params.rawBody.trim().length === 0) {
      throw new Error('Payload Body Cannot Be Empty');
    }

    // Publish the raw event to the message broker.
    // The Processing Service will pick this up to scrub PII and parse the stacktrace.
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

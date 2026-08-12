import { IEventBus, EventTopic } from '@litetrace/events';
import { checkRateLimit, isDuplicate } from './rateLimiter';
import { IngestionPayloadSchema } from './schema';

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
    // 1. Hard Size Limit: Reject payloads > 5MB to protect Kafka and downstream workers
    const MAX_PAYLOAD_SIZE = 5 * 1024 * 1024; // 5MB
    const byteLength = Buffer.byteLength(params.rawBody || '', 'utf8');
    if (byteLength > MAX_PAYLOAD_SIZE) {
      throw new Error('413 Payload Too Large');
    }

    // 2. Structural Validation
    const validatedParams = IngestionPayloadSchema.parse(params);

    // Fast-path edge deduplication
    if (await isDuplicate(params.rawBody, params.tenantId)) {
      return { eventId: 'dropped_duplicate', status: 'DROPPED' };
    }

    // Token bucket rate limiting (1000 capacity, 100 tokens/sec refill)
    const allowed = await checkRateLimit(params.tenantId, 1000, 100);
    if (!allowed) {
      throw new Error('429 Too Many Requests');
    }

    // Publish the raw event to the message broker.
    // The Processing Service will pick this up to scrub PII and parse the stacktrace.
    const event = await this.eventBus.publish(
      EventTopic.TELEMETRY_RECEIVED,
      {
        rawBody: validatedParams.rawBody,
        headers: validatedParams.headers,
        sdkName: validatedParams.headers['x-sdk-name'],
        sdkVersion: validatedParams.headers['x-sdk-version'],
      },
      {
        tenantId: validatedParams.tenantId,
        projectId: validatedParams.projectId,
      }
    );

    return {
      eventId: event.eventId,
      status: 'QUEUED',
    };
  }
}

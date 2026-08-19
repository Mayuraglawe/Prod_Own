import { describe, it, expect, vi } from 'vitest';

// Mock alertCooldown to bypass Redis-backed cooldown in unit/integration tests
vi.mock('../../../../../apps/services/alerting/src/alertCooldown.js', () => ({
  shouldFireAlert: vi.fn().mockResolvedValue(true),
}));

import { IngestionService } from '../../../../../apps/services/ingestion/src/index.js';
import { ProcessingService } from '../../../../../apps/services/processing/src/index.js';
import { GroupingService } from '../../../../../apps/services/grouping/src/index.js';
import { AlertingService } from '../../../../../apps/services/alerting/src/index.js';
import { InMemoryEventBus, EventTopic } from '../../../events/src/index.js';

describe('LiteTrace End-to-End Event Pipeline', () => {
  it('successfully routes a telemetry event from Ingestion to Alerting', async () => {
    const bus = new InMemoryEventBus();

    // 1. Instantiate the services
    const ingestionService = new IngestionService(bus);
    const processingService = new ProcessingService(bus);
    const groupingService = new GroupingService(bus);
    const alertingService = new AlertingService(bus);

    // 2. Wire up the subscription pipeline to simulate actual microservice routing
    bus.subscribe(EventTopic.TELEMETRY_RECEIVED, (event) => 
      processingService.handleTelemetryReceived(event)
    );
    bus.subscribe(EventTopic.TELEMETRY_PROCESSED, (event) => 
      groupingService.handleTelemetryProcessed(event)
    );
    bus.subscribe(EventTopic.ISSUE_GROUPED, (event) => 
      alertingService.handleIssueGrouped(event)
    );

    // 3. Mock final destination subscriber (Alert Triggered)
    const alertHandler = vi.fn().mockResolvedValue(undefined);
    bus.subscribe(EventTopic.ALERT_TRIGGERED, alertHandler);

    // 4. Ingest a raw error payload containing PII that needs scrubbing
    const rawBody = JSON.stringify({
      level: 'error',
      message: 'Failed to authorize user customer.name@company.com with secret Bearer xyz123',
      environment: 'staging',
      release: 'v1.0.0',
    });

    const tenantId = '123e4567-e89b-12d3-a456-426614174000';
    const projectId = '987fcdeb-51a2-43d7-9012-345678901234';

    const result = await ingestionService.processIngestRequest({
      rawBody,
      headers: { 'x-sdk-name': 'sentry.javascript.nextjs', 'x-sdk-version': '1.0.0' },
      tenantId,
      projectId,
    });

    expect(result.status).toBe('QUEUED');
    expect(result.eventId).toBeDefined();

    // 5. Wait for the event to flow through the asynchronous pipeline stages:
    // Ingestion -> TELEMETRY_RECEIVED -> Processing (PII Scrubbing, S3 Mock)
    // -> TELEMETRY_PROCESSED -> Grouping (Batch Buffer, 500ms timeout flush)
    // -> ISSUE_GROUPED -> Alerting -> ALERT_TRIGGERED
    // We wait 750ms to exceed GroupingBatchWriter's 500ms maxWaitMs.
    await new Promise((resolve) => setTimeout(resolve, 750));

    // 6. Verify that the final Alert was triggered
    expect(alertHandler).toHaveBeenCalledTimes(1);

    const alertEvent = alertHandler.mock.calls[0]![0];
    expect(alertEvent.tenantId).toBe(tenantId);
    expect(alertEvent.projectId).toBe(projectId);
    
    const payload = alertEvent.payload;
    expect(payload.ruleName).toBe('New Error Detected');
    expect(payload.issueTitle).toBe(
      'Failed to authorize user [SCRUBBED_EMAIL] with secret Bearer [SCRUBBED_TOKEN]'
    );
  });
});

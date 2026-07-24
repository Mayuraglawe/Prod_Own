import os from 'os';

export interface InitOptions {
  /** The ingest API endpoint URL (e.g. http://localhost:3000/api/ingest) */
  endpoint: string;
  /** Optional tenant identifier */
  tenantId?: string;
  /** Legacy source identifier */
  sourceId?: string;
  /** API key for source authentication (passed in x-api-key header) */
  apiKey?: string;
  /** Deployment environment (defaults to NODE_ENV or 'development') */
  environment?: string;
  /** Release version/commit SHA */
  release?: string;
  /** Custom operational tags (e.g. { customerTier: 'enterprise' }) */
  tags?: Record<string, string>;
  /** Traces sampling rate between 0.0 and 1.0 (defaults to 1.0) */
  tracesSampleRate?: number;
  /** Hook to modify or discard event before sending to ingest */
  beforeSend?: (event: Record<string, unknown>) => Record<string, unknown> | null;
}

let isInitialized = false;

/** Reset function used exclusively in unit tests */
export function resetSdkForTesting() {
  isInitialized = false;
}

export function init(options: InitOptions) {
  if (isInitialized) {
    console.warn('@litetrace/sdk-node is already initialized.');
    return;
  }

  const {
    endpoint,
    tenantId = 'default',
    sourceId,
    apiKey,
    environment = process.env.NODE_ENV || 'development',
    release = process.env.RELEASE_VERSION || '1.0.0',
    tags = {},
    tracesSampleRate = 1.0,
    beforeSend,
  } = options;

  const sendError = async (error: Error, unhandledType: 'uncaughtException' | 'unhandledRejection') => {
    try {
      let payload: Record<string, unknown> = {
        tenantId,
        sourceId,
        environment,
        release,
        content: error.stack || error.message,
        metadata: {
          type: unhandledType,
          name: error.name,
          message: error.message,
          platform: os.platform(),
          release: os.release(),
          nodeVersion: process.version,
          timestamp: new Date().toISOString(),
          tags,
          tracesSampleRate,
        },
      };

      if (beforeSend) {
        const customPayload = beforeSend(payload);
        if (!customPayload) {
          return; // Event dropped by beforeSend hook
        }
        payload = customPayload;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }

      await fetch(`${endpoint.replace(/\/$/, '')}/ingest`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
    } catch (e) {
      // Intentionally swallow errors sending the payload to avoid recursive crashes
      console.error('[prod-own] Failed to send error event:', e);
    }
  };

  process.on('uncaughtException', (error) => {
    sendError(error, 'uncaughtException').finally(() => {
      // Exit process as standard uncaughtException behavior
      process.exit(1);
    });
  });

  process.on('unhandledRejection', (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    sendError(error, 'unhandledRejection');
  });

  isInitialized = true;
  console.info(`[prod-own] SDK initialized for environment: ${environment}, release: ${release}`);
}


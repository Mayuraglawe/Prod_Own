import os from 'os';

export interface InitOptions {
  endpoint: string;
  tenantId: string;
  sourceId: string;
}

let isInitialized = false;

export function init(options: InitOptions) {
  if (isInitialized) {
    console.warn('@prod-own/sdk-node is already initialized.');
    return;
  }

  const { endpoint, tenantId, sourceId } = options;

  const sendError = async (error: Error, unhandledType: 'uncaughtException' | 'unhandledRejection') => {
    try {
      const payload = {
        tenantId,
        sourceId,
        content: error.stack || error.message,
        metadata: {
          type: unhandledType,
          name: error.name,
          message: error.message,
          platform: os.platform(),
          release: os.release(),
          nodeVersion: process.version,
          timestamp: new Date().toISOString()
        }
      };

      await fetch(`${endpoint.replace(/\/$/, '')}/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
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
  console.info(`[prod-own] SDK initialized for tenant: ${tenantId}`);
}

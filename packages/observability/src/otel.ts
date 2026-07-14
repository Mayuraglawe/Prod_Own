import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NodeSDK } from '@opentelemetry/sdk-node';

import { env } from '@prod-own/config';

/**
 * Initializes and configures the OpenTelemetry Node SDK.
 * - Sets the internal diagnostic logger to WARN level to avoid log spamming.
 * - Conditionally sets up the OTLP trace exporter if the OTLP_ENDPOINT is configured.
 * - Names the monitored service with the env variable configuration (defaults to 'prod-own').
 */
export function createObservabilitySdk() {
  // Set up internal OTel diagnostics logging to output warnings and errors to console
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.WARN);

  // Instantiates the OTLP HTTP trace exporter if an endpoint is provided in env
  const exporter = env.OTEL_EXPORTER_OTLP_ENDPOINT
    ? new OTLPTraceExporter({
        url: env.OTEL_EXPORTER_OTLP_ENDPOINT
      })
    : undefined;

  // Build the main OpenTelemetry SDK config shell
  return new NodeSDK({
    traceExporter: exporter,
    serviceName: env.OTEL_SERVICE_NAME
  });
}


import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NodeSDK } from '@opentelemetry/sdk-node';

import { env } from '@prod-own/config';

export function createObservabilitySdk() {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.WARN);

  const exporter = env.OTEL_EXPORTER_OTLP_ENDPOINT
    ? new OTLPTraceExporter({
        url: env.OTEL_EXPORTER_OTLP_ENDPOINT
      })
    : undefined;

  return new NodeSDK({
    traceExporter: exporter,
    serviceName: env.OTEL_SERVICE_NAME
  });
}

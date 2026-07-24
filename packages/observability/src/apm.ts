import { z } from 'zod';

export const traceSpanSchema = z.object({
  traceId: z.string().min(1),
  spanId: z.string().min(1),
  parentSpanId: z.string().optional(),
  name: z.string().min(1), // e.g. "GET /api/users"
  kind: z.enum(['SERVER', 'CLIENT', 'PRODUCER', 'CONSUMER', 'INTERNAL']).default('SERVER'),
  startTimeMs: z.number(),
  durationMs: z.number().nonnegative(),
  statusCode: z.enum(['OK', 'ERROR', 'UNSET']).default('OK'),
  statusMessage: z.string().optional(),
  attributes: z.record(z.unknown()).optional(),
});

export type TraceSpan = z.infer<typeof traceSpanSchema>;

export const apmTracePayloadSchema = z.object({
  service: z.string().min(1),
  environment: z.string().default('production'),
  release: z.string().optional(),
  spans: z.array(traceSpanSchema),
});

export type APMTracePayload = z.infer<typeof apmTracePayloadSchema>;

export interface EndpointRollup {
  route: string;
  totalRequests: number;
  errorCount: number;
  errorRate: number; // percentage 0-100
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
}

/**
 * Head + Tail sampling rules:
 * - 100% of errored traces (statusCode === 'ERROR')
 * - 100% of slow traces (durationMs >= slowThresholdMs, default 500ms)
 * - Head sampling rate (default 10%) for normal fast traces
 */
export function shouldSampleTrace(
  span: TraceSpan,
  sampleRate = 0.1,
  slowThresholdMs = 500
): boolean {
  if (span.statusCode === 'ERROR') {
    return true; // Always sample errors
  }
  if (span.durationMs >= slowThresholdMs) {
    return true; // Always sample slow traces
  }
  // Deterministic or pseudo-random head sampling
  const traceHash = Array.from(span.traceId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (traceHash % 100) < sampleRate * 100;
}

/**
 * Computes exact percentile values (p50, p95, p99) from an array of numbers.
 */
export function computePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  const clampedIndex = Math.max(0, Math.min(sorted.length - 1, index));
  return sorted[clampedIndex] ?? 0;
}

/**
 * Aggregates a batch of trace spans into per-endpoint latency rollup metrics (p50, p95, p99).
 */
export function calculateRollupMetrics(spans: TraceSpan[]): EndpointRollup[] {
  const grouped = new Map<string, TraceSpan[]>();

  for (const span of spans) {
    const route = span.name;
    const list = grouped.get(route) ?? [];
    list.push(span);
    grouped.set(route, list);
  }

  const rollups: EndpointRollup[] = [];

  for (const [route, routeSpans] of grouped.entries()) {
    const durations = routeSpans.map((s) => s.durationMs);
    const totalRequests = routeSpans.length;
    const errorCount = routeSpans.filter((s) => s.statusCode === 'ERROR').length;
    const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;

    rollups.push({
      route,
      totalRequests,
      errorCount,
      errorRate: Math.round(errorRate * 100) / 100,
      p50Ms: Math.round(computePercentile(durations, 50)),
      p95Ms: Math.round(computePercentile(durations, 95)),
      p99Ms: Math.round(computePercentile(durations, 99)),
    });
  }

  return rollups;
}

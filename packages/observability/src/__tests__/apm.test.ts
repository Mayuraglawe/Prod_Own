import { describe, it, expect } from 'vitest';
import {
  TraceSpan,
  shouldSampleTrace,
  computePercentile,
  calculateRollupMetrics,
} from '../apm';

describe('APM Tracing & Latency Engine', () => {
  it('computes exact percentiles correctly', () => {
    const durations = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    expect(computePercentile(durations, 50)).toBe(50);
    expect(computePercentile(durations, 95)).toBe(100);
    expect(computePercentile(durations, 99)).toBe(100);
  });

  it('samples 100% of errored traces regardless of duration', () => {
    const errorSpan: TraceSpan = {
      traceId: 'trace_1',
      spanId: 'span_1',
      name: 'POST /api/checkout',
      kind: 'SERVER',
      startTimeMs: Date.now(),
      durationMs: 15, // Fast duration
      statusCode: 'ERROR',
    };
    expect(shouldSampleTrace(errorSpan)).toBe(true);
  });

  it('samples 100% of slow traces (>500ms)', () => {
    const slowSpan: TraceSpan = {
      traceId: 'trace_2',
      spanId: 'span_2',
      name: 'GET /api/reports',
      kind: 'SERVER',
      startTimeMs: Date.now(),
      durationMs: 1200, // >500ms
      statusCode: 'OK',
    };
    expect(shouldSampleTrace(slowSpan)).toBe(true);
  });

  it('calculates route rollups with error rates and p50/p95/p99 values', () => {
    const spans: TraceSpan[] = [
      {
        traceId: 't1',
        spanId: 's1',
        name: 'GET /api/items',
        kind: 'SERVER',
        startTimeMs: 1000,
        durationMs: 50,
        statusCode: 'OK',
      },
      {
        traceId: 't2',
        spanId: 's2',
        name: 'GET /api/items',
        kind: 'SERVER',
        startTimeMs: 1050,
        durationMs: 150,
        statusCode: 'OK',
      },
      {
        traceId: 't3',
        spanId: 's3',
        name: 'GET /api/items',
        kind: 'SERVER',
        startTimeMs: 1100,
        durationMs: 500,
        statusCode: 'ERROR',
      },
    ];

    const rollups = calculateRollupMetrics(spans);
    expect(rollups).toHaveLength(1);
    const itemRollup = rollups[0];
    expect(itemRollup.route).toBe('GET /api/items');
    expect(itemRollup.totalRequests).toBe(3);
    expect(itemRollup.errorCount).toBe(1);
    expect(itemRollup.errorRate).toBe(33.33);
    expect(itemRollup.p50Ms).toBe(150);
    expect(itemRollup.p95Ms).toBe(500);
    expect(itemRollup.p99Ms).toBe(500);
  });
});

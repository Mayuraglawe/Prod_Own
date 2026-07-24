'use client';

import React from 'react';

/**
 * Analytics page — ingestion throughput and performance metrics.
 * TODO: Replace static fixtures with real metrics from the DB / OTEL collector.
 */
export default function AnalyticsPage() {
  const metrics = [
    { label: 'Avg Ingest Latency', value: '14.2 ms' },
    { label: 'Peak Throughput',    value: '8,420 req/m' },
    { label: 'Scrubbed Secrets',   value: '1,240 tokens' },
  ];

  return (
    <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-bold text-[#13221C]">Ingestion Analytics &amp; Performance</h3>
        <p className="text-xs text-[#687870]">Real-time telemetry event throughput and latency breakdown</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="p-5 rounded-2xl border border-[#E2E8E4] bg-emerald-50/50">
            <span className="text-xs font-bold text-[#687870]">{m.label}</span>
            <div className="text-2xl font-extrabold text-[#0B4F3A] mt-1">{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

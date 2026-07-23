'use client';

import React, { useState } from 'react';
import { Plus, Copy, Check } from 'lucide-react';
import { MOCK_SOURCES, type IngestSource } from '../../../lib/mock-data';

/**
 * Sources page — lists ingest sources and their SDK credentials.
 * TODO: Replace MOCK_SOURCES with a real server component fetching from sourcesRepository.
 */
export default function SourcesPage() {
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#13221C]">Ingest Sources &amp; SDK Credentials</h3>
          <p className="text-xs text-[#687870]">Manage client API keys and HTTP telemetry endpoints</p>
        </div>
        <button className="flex items-center gap-1 px-4 py-2 bg-[#0B4F3A] text-white rounded-full font-bold text-xs">
          <Plus className="w-3.5 h-3.5" /> Register Source
        </button>
      </div>

      <div className="space-y-4">
        {MOCK_SOURCES.map((src: IngestSource) => (
          <div
            key={src.id}
            className="p-4 rounded-2xl border border-[#E2E8E4] flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0B4F3A] font-bold text-[10px] border border-emerald-200">
                  {src.type}
                </span>
                <h4 className="text-sm font-bold text-[#13221C]">{src.name}</h4>
              </div>
              <p className="text-xs text-[#687870]">
                Tenant: {src.tenantId} &bull; Events: {src.eventsCount.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <code className="px-3 py-1 rounded-lg bg-[#F3F5F4] text-xs font-mono text-[#0B4F3A] border border-[#E2E8E4]">
                {src.apiKey}
              </code>
              <button
                onClick={() => handleCopy(src.id, src.apiKey)}
                className="p-2 rounded-full bg-[#F3F5F4] hover:bg-[#E6F7F0] text-[#0B4F3A] transition-all"
                aria-label="Copy API key"
              >
                {copiedKeyId === src.id
                  ? <Check className="w-4 h-4 text-emerald-600" />
                  : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

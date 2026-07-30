'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function HelpPage() {
  return (
    <>
          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#13221C]">Documentation & Help Center</h3>
              <p className="text-xs text-[#687870]">Guides for SDK installation, RLS security, and fingerprint deduplication</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-[#E2E8E4] bg-[#F3F5F4] space-y-2">
                <h4 className="text-sm font-bold text-[#13221C]">PostgreSQL RLS Architecture</h4>
                <p className="text-xs text-[#687870]">Learn how Row-Level Security policies isolate tenant multi-tenancy data in Postgres.</p>
                <a href="/PROJECT_GOVERNANCE_AND_DEVELOPMENT_GUIDELINES.md" className="inline-flex items-center gap-1 text-xs font-bold text-[#52b788]">
                  Read Guidelines <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-5 rounded-2xl border border-[#E2E8E4] bg-[#F3F5F4] space-y-2">
                <h4 className="text-sm font-bold text-[#13221C]">Fastify Ingest Endpoint Specs</h4>
                <p className="text-xs text-[#687870]">POST /ingest specs for sending raw telemetry payloads to BullMQ queues.</p>
                <a href="/apps/api/AGENTS.md" className="inline-flex items-center gap-1 text-xs font-bold text-[#52b788]">
                  View API Specs <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
    </>
  );
}

'use client';

import React from 'react';

interface Integration {
  title: string;
  description: string;
  action: React.ReactNode;
}

const INTEGRATIONS: Integration[] = [
  {
    title: 'Slack Webhook Integration',
    description: 'Dispatch critical error alerts directly to #incidents channel',
    action: (
      <button className="px-4 py-2 bg-[#0B4F3A] text-white font-bold text-xs rounded-full">
        Test Slack Alert
      </button>
    ),
  },
  {
    title: 'n8n Workflow Webhook',
    description: 'Trigger custom n8n automation pipelines on error events',
    action: (
      <button className="px-4 py-2 bg-[#0B4F3A] text-white font-bold text-xs rounded-full">
        Test n8n Alert
      </button>
    ),
  },
  {
    title: 'Razorpay Webhook Endpoint',
    description: 'Enqueued to BullMQ billing queue for async processing',
    action: (
      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
        Active (202 Accepted)
      </span>
    ),
  },
];

/**
 * Settings page — alert hooks and Razorpay billing configuration.
 * TODO: Make integrations dynamic, connected to env vars or DB config.
 */
export default function SettingsPage() {
  return (
    <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-bold text-[#13221C]">Alert Hooks &amp; Razorpay Billing</h3>
        <p className="text-xs text-[#687870]">
          Configure Slack webhooks, n8n integrations, and Razorpay subscription webhooks
        </p>
      </div>

      <div className="space-y-4">
        {INTEGRATIONS.map((integration) => (
          <div
            key={integration.title}
            className="p-4 rounded-2xl border border-[#E2E8E4] flex items-center justify-between"
          >
            <div>
              <h4 className="text-sm font-bold text-[#13221C]">{integration.title}</h4>
              <p className="text-xs text-[#687870]">{integration.description}</p>
            </div>
            {integration.action}
          </div>
        ))}
      </div>
    </div>
  );
}

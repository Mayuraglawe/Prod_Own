'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Copy, Check, ShieldCheck, Key, Code2, X } from 'lucide-react';

interface SourceItem {
  id: string;
  name: string;
  externalId: string;
  tenantId: string;
  apiKeyPrefix: string;
  createdAt: string;
  _count?: {
    events: number;
    issues: number;
  };
}

export default function SourcesPage() {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSources = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sources');
      if (res.ok) {
        const data = await res.json();
        setSources(data.sources || []);
      }
    } catch (e) {
      console.error('Failed to fetch projects:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projectName.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedKey(data.apiKey);
        fetchSources();
      }
    } catch (e) {
      console.error('Failed to create project:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#52b788] to-[#13221C] p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold">Projects &amp; Ingest Sources</h2>
          </div>
          <p className="text-xs text-emerald-100/80">
            Organize deploy boundaries, manage API keys, and connect SDK monitoring for each service.
          </p>
        </div>
        <button
          onClick={() => {
            setCreatedKey(null);
            setProjectName('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" /> Create New Project
        </button>
      </div>

      {/* Projects List */}
      <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8E4] pb-4">
          <h3 className="text-sm font-bold text-[#13221C]">Active Projects ({sources.length})</h3>
          <span className="text-xs text-[#687870]">Postgres RLS Tenant Isolation Active</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#687870]">Loading projects...</div>
        ) : sources.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-sm font-medium text-[#13221C]">No projects created yet.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#52b788] text-white text-xs font-bold rounded-full"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sources.map((src) => (
              <div
                key={src.id}
                className="p-5 rounded-2xl border border-[#E2E8E4] bg-[#FAFBFB] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-300 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#52b788] font-bold text-[10px]">
                      Node.js / Express
                    </span>
                    <h4 className="text-base font-bold text-[#13221C]">{src.name}</h4>
                  </div>
                  <p className="text-xs text-[#687870]">
                    Project ID: <code className="font-mono text-[#52b788]">{src.externalId}</code> &bull; Created: {new Date(src.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E2E8E4]">
                    <Key className="w-3.5 h-3.5 text-[#52b788]" />
                    <code className="text-xs font-mono text-[#13221C]">{src.apiKeyPrefix}...</code>
                  </div>
                  <button
                    onClick={() => handleCopy(src.id, src.apiKeyPrefix)}
                    className="p-2 rounded-full bg-white hover:bg-emerald-50 text-[#52b788] border border-[#E2E8E4] transition-all"
                    title="Copy API key prefix"
                  >
                    {copiedId === src.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Create Project & Show Key */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E2E8E4] shadow-2xl max-w-lg w-full p-6 space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E2E8E4] pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#52b788]" />
                <h3 className="text-base font-bold text-[#13221C]">
                  {createdKey ? 'Project Created Successfully!' : 'Create New Project'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!createdKey ? (
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#13221C] mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Payment Gateway Service"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8E4] text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788]"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[#FAFBFB] border border-[#E2E8E4] text-xs text-[#687870] space-y-1">
                  <p className="font-bold text-[#13221C]">What happens next?</p>
                  <p>A new project boundary and hashed API Key will be generated for your application.</p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#52b788] hover:bg-[#40916c] text-white text-xs font-bold rounded-full disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Generate API Key'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <p className="text-xs font-bold text-[#52b788]">
                    ⚠️ Store your API Key securely. It will not be shown again!
                  </p>
                  <div className="flex items-center justify-between gap-2 p-3 bg-white rounded-xl border border-emerald-300">
                    <code className="text-xs font-mono font-bold text-[#13221C] break-all">
                      {createdKey}
                    </code>
                    <button
                      onClick={() => handleCopy('modal_key', createdKey)}
                      className="p-2 bg-emerald-100 hover:bg-emerald-200 rounded-lg text-[#52b788] shrink-0"
                    >
                      {copiedId === 'modal_key' ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#13221C]">
                    <Code2 className="w-4 h-4 text-[#52b788]" />
                    <span>SDK Initialization Code</span>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 text-xs font-mono overflow-x-auto">
{`import { init } from '@litetrace/sdk-node';

init({
  endpoint: 'http://localhost:3000/api/ingest',
  apiKey: '${createdKey}',
  environment: process.env.NODE_ENV || 'production',
  release: '1.0.0'
});`}
                  </pre>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2 bg-[#52b788] text-white text-xs font-bold rounded-full"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

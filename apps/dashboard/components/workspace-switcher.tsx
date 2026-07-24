'use client';

import React, { useState, useEffect } from 'react';
import { Building2, ChevronDown, Plus, Shield, UserCheck, X, Check } from 'lucide-react';

interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  role: 'ADMIN' | 'EMPLOYEE';
  project?: {
    id: string;
    name: string;
    apiKeyPrefix: string;
  };
  apiKey?: string;
}

export function WorkspaceSwitcher() {
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdWorkspaceKey, setCreatedWorkspaceKey] = useState<string | null>(null);

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch('/api/workspaces');
      if (res.ok) {
        const data = await res.json();
        const list: WorkspaceItem[] = data.workspaces || [];
        setWorkspaces(list);
        if (list.length > 0 && !activeWorkspace) {
          setActiveWorkspace(list[0] || null);
        }
      }
    } catch (e) {
      console.error('Failed to load workspaces:', e);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWorkspaceName.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        const created: WorkspaceItem = data.workspace;
        setWorkspaces((prev) => [created, ...prev]);
        setActiveWorkspace(created);
        if (created.apiKey) {
          setCreatedWorkspaceKey(created.apiKey);
        } else {
          setIsModalOpen(false);
        }
      }
    } catch (e) {
      console.error('Failed to create workspace:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* Active Workspace Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#F3F5F4] hover:bg-[#E6F7F0] border border-[#E2E8E4] transition-all text-xs font-bold text-[#13221C]"
      >
        <Building2 className="w-4 h-4 text-[#0B4F3A]" />
        <span>{activeWorkspace ? activeWorkspace.name : 'Select Workspace'}</span>
        {activeWorkspace && (
          <span className="px-2 py-0.5 rounded-full bg-[#0B4F3A] text-white text-[9px] font-bold">
            {activeWorkspace.role}
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-[#687870]" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl border border-[#E2E8E4] shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#687870]">
            Your Workspaces
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  setActiveWorkspace(ws);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeWorkspace?.id === ws.id
                    ? 'bg-[#E6F7F0] text-[#0B4F3A]'
                    : 'hover:bg-[#FAFBFB] text-[#13221C]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{ws.name}</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                  {ws.role}
                </span>
              </button>
            ))}
          </div>

          <div className="border-t border-[#E2E8E4] pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                setCreatedWorkspaceKey(null);
                setNewWorkspaceName('');
                setIsModalOpen(true);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#0B4F3A] hover:bg-emerald-50 transition-all"
            >
              <Plus className="w-4 h-4" /> Create New Workspace
            </button>
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E2E8E4] shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8E4] pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#0B4F3A]" />
                <h3 className="text-base font-bold text-[#13221C]">
                  {createdWorkspaceKey ? 'Workspace & Project Ready!' : 'Create Workspace (Admin)'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!createdWorkspaceKey ? (
              <form onSubmit={handleCreateWorkspace} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#13221C] mb-1">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corp Operations"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8E4] text-sm focus:outline-none focus:ring-2 focus:ring-[#0B4F3A]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#FAFBFB] border border-[#E2E8E4] text-xs text-[#687870] space-y-1">
                  <p className="font-bold text-[#13221C]">1 Workspace = 1 Dedicated Project</p>
                  <p>Creating this workspace automatically initializes your single dedicated project and admin credentials.</p>
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
                    className="px-5 py-2 bg-[#0B4F3A] hover:bg-[#083B2B] text-white text-xs font-bold rounded-full disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Workspace'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <p className="text-xs font-bold text-[#0B4F3A]">
                    Workspace &amp; Project API Key generated:
                  </p>
                  <code className="block p-3 bg-white rounded-xl border border-emerald-300 text-xs font-mono font-bold text-[#13221C] break-all">
                    {createdWorkspaceKey}
                  </code>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2 bg-[#0B4F3A] text-white text-xs font-bold rounded-full"
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

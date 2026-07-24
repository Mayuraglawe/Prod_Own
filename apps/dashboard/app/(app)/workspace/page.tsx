'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Mail,
  Shield,
  Key,
  Copy,
  Check,
  Code2,
  X,
  ChevronRight
} from 'lucide-react';

interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE';
  createdAt: string;
  project?: {
    id: string;
    name: string;
    externalId: string;
    apiKeyPrefix: string;
  };
}

interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE';
  status: 'Active' | 'Pending';
}

export default function WorkspacePage() {
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [activeWs, setActiveWs] = useState<WorkspaceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modals state
  const [isWsModalOpen, setIsWsModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE'>('EMPLOYEE');
  const [inviteResult, setInviteResult] = useState<{ email: string; inviteLink: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [members, setMembers] = useState<MemberItem[]>([]);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/workspaces');
      if (res.ok) {
        const data = await res.json();
        const list: WorkspaceItem[] = data.workspaces || [];
        setWorkspaces(list);
        if (list.length > 0 && !activeWs) {
          setActiveWs(list[0] || null);
        }
      }
    } catch (e) {
      console.error('Failed to fetch workspaces:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembersForWorkspace = async (tenantId?: string) => {
    try {
      const url = tenantId ? `/api/team?tenantId=${tenantId}` : '/api/team';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const activeMembers: MemberItem[] = data.members || [];
        const pendingInvites: MemberItem[] = data.invites || [];
        setMembers([...activeMembers, ...pendingInvites]);
      }
    } catch (e) {
      console.error('Failed to fetch team members:', e);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (activeWs?.id) {
      fetchMembersForWorkspace(activeWs.id);
    }
  }, [activeWs?.id]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWsName.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        const created: WorkspaceItem = data.workspace;
        setWorkspaces((prev) => [created, ...prev]);
        setActiveWs(created);
        if (created.project?.apiKeyPrefix) {
          setCreatedApiKey(data.workspace.apiKey || created.project.apiKeyPrefix);
        } else {
          setIsWsModalOpen(false);
        }
      }
    } catch (e) {
      console.error('Failed to create workspace:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/workspaces/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: activeWs?.id,
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setInviteResult({
          email: data.invite.email,
          inviteLink: data.invite.inviteLink,
        });
        setMembers((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            name: inviteEmail.split('@')[0] || 'Employee',
            email: inviteEmail.trim(),
            role: inviteRole,
            status: 'Pending',
          },
        ]);
      }
    } catch (e) {
      console.error('Failed to send invitation:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0B4F3A] via-[#13221C] to-[#083B2B] p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-bold">Dedicated Workspace Dashboard</h1>
            <span className="ml-2 px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold rounded-full">
              SUPER_ADMIN CONTROLLED
            </span>
          </div>
          <p className="text-xs text-emerald-100/80">
            Manage organization workspaces, 1-to-1 dedicated projects, SDK credentials, system architecture, and user access roles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setCreatedApiKey(null);
              setNewWsName('');
              setIsWsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full font-bold text-xs transition-all shadow-md"
          >
            <Plus className="w-4 h-4" /> Create Workspace
          </button>
          <button
            onClick={() => {
              setInviteResult(null);
              setInviteEmail('');
              setIsInviteModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-xs transition-all border border-white/20"
          >
            <Mail className="w-4 h-4 text-emerald-400" /> Invite Employee
          </button>
        </div>
      </div>

      {/* Main Grid: Workspace Details & Workspace Switcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Workspace Details & Project Credentials */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Workspace Card */}
          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8E4] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#0B4F3A] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Active Workspace
                </span>
                <h2 className="text-xl font-bold text-[#13221C] mt-1">
                  {activeWs ? activeWs.name : 'Loading Workspace...'}
                </h2>
              </div>
              {activeWs && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#0B4F3A] text-white font-bold text-xs rounded-full">
                    Role: {activeWs.role}
                  </span>
                </div>
              )}
            </div>

            {activeWs ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAFBFB] border border-[#E2E8E4]">
                  <p className="text-[10px] font-bold text-[#687870] uppercase">Workspace ID</p>
                  <code className="text-xs font-mono font-bold text-[#13221C] block truncate mt-1">
                    {activeWs.id}
                  </code>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAFBFB] border border-[#E2E8E4]">
                  <p className="text-[10px] font-bold text-[#687870] uppercase">Workspace Slug</p>
                  <code className="text-xs font-mono font-bold text-[#0B4F3A] block truncate mt-1">
                    {activeWs.slug}
                  </code>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAFBFB] border border-[#E2E8E4]">
                  <p className="text-[10px] font-bold text-[#687870] uppercase">Isolation Model</p>
                  <p className="text-xs font-bold text-emerald-700 block mt-1">Postgres RLS Active</p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#687870]">
                {loading ? 'Loading workspace details...' : 'No active workspace selected.'}
              </div>
            )}
          </div>

          {/* Dedicated Project & SDK Section */}
          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8E4] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#13221C]">
                  Dedicated Project &amp; SDK DSN
                </h3>
                <p className="text-xs text-[#687870]">Each workspace contains exactly 1 dedicated monitoring project.</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0B4F3A] font-bold text-[10px]">
                1 Workspace = 1 Project
              </span>
            </div>

            {activeWs?.project ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#FAFBFB] border border-[#E2E8E4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-[#13221C]">{activeWs.project.name}</h4>
                    <p className="text-xs text-[#687870]">
                      External ID: <code className="font-mono text-[#0B4F3A]">{activeWs.project.externalId}</code>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E2E8E4] flex items-center gap-2">
                      <Key className="w-3.5 h-3.5 text-[#0B4F3A]" />
                      <code className="text-xs font-mono text-[#13221C]">
                        {activeWs.project.apiKeyPrefix}...
                      </code>
                    </div>
                    <button
                      onClick={() => handleCopy('project_key', activeWs.project!.apiKeyPrefix)}
                      className="p-2 rounded-full bg-white hover:bg-emerald-50 text-[#0B4F3A] border border-[#E2E8E4]"
                      title="Copy key prefix"
                    >
                      {copiedKey === 'project_key' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Integration Code */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#13221C]">
                    <Code2 className="w-4 h-4 text-[#0B4F3A]" />
                    <span>Quick SDK Initialization Code</span>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 text-xs font-mono overflow-x-auto">
{`import { init } from '@litetrace/sdk-node';

init({
  endpoint: 'http://localhost:3000/api/ingest',
  apiKey: '${activeWs.project.apiKeyPrefix}...', // Your Workspace Project API Key
  environment: process.env.NODE_ENV || 'production',
  release: 'v1.0.0'
});`}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#687870]">
                No dedicated project found for this workspace.
              </div>
            )}
          </div>

          {/* Full Workspace Team & Access Control Section */}
          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8E4] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#13221C]">
                  Workspace Team &amp; Member Roles ({members.length})
                </h3>
                <p className="text-xs text-[#687870]">ADMINs can manage team access and invite employees via email.</p>
              </div>
              <button
                onClick={() => {
                  setInviteResult(null);
                  setInviteEmail('');
                  setIsInviteModalOpen(true);
                }}
                className="flex items-center gap-1 px-4 py-2 bg-[#0B4F3A] hover:bg-[#083B2B] text-white rounded-full font-bold text-xs shadow-sm transition-all"
              >
                <Mail className="w-3.5 h-3.5" /> Invite Member
              </button>
            </div>

            <div className="divide-y divide-[#E2E8E4]">
              {members.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#687870]">No members added yet.</div>
              ) : (
                members.map((m) => (
                  <div key={m.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#E6F7F0] flex items-center justify-center text-[#0B4F3A] font-bold text-xs shrink-0">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#13221C]">{m.name}</h4>
                        <p className="text-[10px] text-[#687870]">{m.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                          m.role === 'SUPER_ADMIN'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : m.role === 'ADMIN'
                            ? 'bg-emerald-100 text-[#0B4F3A] border-emerald-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {m.role}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                          m.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Workspaces Selector List */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-white border border-[#E2E8E4] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8E4] pb-3">
              <h3 className="text-sm font-bold text-[#13221C]">Your Workspaces ({workspaces.length})</h3>
              <button
                onClick={() => {
                  setCreatedApiKey(null);
                  setNewWsName('');
                  setIsWsModalOpen(true);
                }}
                className="text-xs font-bold text-[#0B4F3A] hover:underline"
              >
                + New
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => setActiveWs(ws)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    activeWs?.id === ws.id
                      ? 'bg-[#E6F7F0] border-emerald-300 shadow-sm'
                      : 'bg-[#FAFBFB] border-[#E2E8E4] hover:border-slate-300'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-[#13221C] truncate">{ws.name}</p>
                    <p className="text-[10px] text-[#687870]">Role: {ws.role}</p>
                  </div>
                  {activeWs?.id === ws.id && <ChevronRight className="w-4 h-4 text-[#0B4F3A] shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Workspace Modal */}
      {isWsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E2E8E4] shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8E4] pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#0B4F3A]" />
                <h3 className="text-base font-bold text-[#13221C]">
                  {createdApiKey ? 'Workspace & Dedicated Project Provisioned!' : 'Create New Workspace (Admin)'}
                </h3>
              </div>
              <button onClick={() => setIsWsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!createdApiKey ? (
              <form onSubmit={handleCreateWorkspace} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#13221C] mb-1">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Microservices Org"
                    value={newWsName}
                    onChange={(e) => setNewWsName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8E4] text-sm focus:outline-none focus:ring-2 focus:ring-[#0B4F3A]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#FAFBFB] border border-[#E2E8E4] text-xs text-[#687870] space-y-1">
                  <p className="font-bold text-[#13221C]">Automatic 1-to-1 Project Setup</p>
                  <p>A dedicated project, RLS tenant boundary, and secret DSN API Key will be generated.</p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#0B4F3A] hover:bg-[#083B2B] text-white text-xs font-bold rounded-full disabled:opacity-50"
                  >
                    {isSubmitting ? 'Provisioning...' : 'Create Workspace'}
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
                    {createdApiKey}
                  </code>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setIsWsModalOpen(false)}
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

      {/* Invite Employee Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E2E8E4] shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8E4] pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#0B4F3A]" />
                <h3 className="text-base font-bold text-[#13221C]">
                  {inviteResult ? 'Email Invitation Sent!' : 'Invite Employee to Workspace'}
                </h3>
              </div>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!inviteResult ? (
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#13221C] mb-1">
                    Employee Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="employee@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8E4] text-sm focus:outline-none focus:ring-2 focus:ring-[#0B4F3A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#13221C] mb-1">
                    Assign Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE')}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8E4] text-sm focus:outline-none focus:ring-2 focus:ring-[#0B4F3A]"
                  >
                    <option value="EMPLOYEE">EMPLOYEE (Access project metrics &amp; issues)</option>
                    <option value="ADMIN">ADMIN (Workspace &amp; team management)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Full system &amp; organization admin)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#0B4F3A] hover:bg-[#083B2B] text-white text-xs font-bold rounded-full disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending Email...' : 'Send Invitation Email'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <p className="text-xs font-bold text-[#0B4F3A]">
                    Invitation email sent to {inviteResult.email}! Direct token link:
                  </p>
                  <div className="flex items-center justify-between gap-2 p-3 bg-white rounded-xl border border-emerald-300">
                    <code className="text-xs font-mono font-bold text-[#13221C] break-all">
                      {inviteResult.inviteLink}
                    </code>
                    <button
                      onClick={() => handleCopy('invite_link', inviteResult.inviteLink)}
                      className="p-2 bg-emerald-100 hover:bg-emerald-200 rounded-lg text-[#0B4F3A] shrink-0"
                    >
                      {copiedKey === 'invite_link' ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setIsInviteModalOpen(false)}
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

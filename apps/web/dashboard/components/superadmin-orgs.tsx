'use client';

import React, { useState, useEffect } from 'react';
import { 
  Server, Power, PowerOff,
  Search, ExternalLink, Activity, Ban, Trash2, Edit
} from 'lucide-react';
import { LoadingSpinner } from './loading-spinner';

type Tenant = {
  id: string;
  name: string;
  slug: string;
  planTier: string;
  customEventQuota: number | null;
  customRetentionDays: number | null;
  suspended: boolean;
  suspendedAt: string | null;
  suspendedReason: string | null;
  createdAt: string;
  _count: {
    sources: number;
    issues: number;
    members: number;
  };
};

export function SuperAdminOrgs() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/admin/tenants');
      const data = await res.json();
      if (data.tenants) setTenants(data.tenants);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (tenantId: string, currentSuspended: boolean) => {
    const isSuspending = !currentSuspended;
    const reason = isSuspending ? prompt('Reason for suspension:') : null;
    if (isSuspending && !reason) return;

    try {
      await fetch(`/api/admin/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended: isSuspending, reason }),
      });
      fetchTenants();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (tenantId: string, name: string) => {
    if (!confirm(`DANGER: Are you sure you want to permanently delete "${name}"? This cascades to all events and cannot be undone.`)) return;
    try {
      await fetch(`/api/admin/tenants/${tenantId}`, { method: 'DELETE' });
      fetchTenants();
    } catch (err) {
      console.error(err);
    }
  };

  const handleImpersonate = async (tenantId: string) => {
    try {
      await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });
      // Redirect to dashboard top level so it picks up the cookie
      window.location.href = '/dashboard';
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditPlan = async (tenant: Tenant) => {
    const planTier = prompt('New Plan Tier (STARTUP, BUSINESS, ENTERPRISE):', tenant.planTier) || tenant.planTier;
    try {
      await fetch(`/api/admin/tenants/${tenant.id}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planTier }),
      });
      fetchTenants();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Tenant Management</h2>
          <p className="text-sm text-slate-500">Cross-tenant visibility and plan controls</p>
        </div>
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col h-64 items-center justify-center space-y-6">
            <LoadingSpinner />
            <div className="text-slate-400 font-mono text-xs uppercase tracking-widest animate-pulse">Loading Tenants...</div>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-600">Organization</th>
                <th className="p-4 font-semibold text-slate-600">Plan</th>
                <th className="p-4 font-semibold text-slate-600">Usage Stats</th>
                <th className="p-4 font-semibold text-slate-600">Status</th>
                <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.slug}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                      {t.planTier}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1"><Server className="w-3.5 h-3.5" /> {t._count.sources}</span>
                      <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5" /> {t._count.issues}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {t.suspended ? (
                      <span className="flex items-center gap-1 text-red-600 font-bold text-xs bg-red-50 px-2.5 py-1 rounded-full w-fit">
                        <Ban className="w-3.5 h-3.5" /> Suspended
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-full w-fit">
                        <Power className="w-3.5 h-3.5" /> Active
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => handleImpersonate(t.id)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Impersonate"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEditPlan(t)}
                      className="p-1.5 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      title="Edit Plan"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleSuspend(t.id, t.suspended)}
                      className={`p-1.5 rounded-lg transition-colors ${t.suspended ? 'text-emerald-500 hover:bg-emerald-50' : 'text-yellow-500 hover:bg-yellow-50'}`}
                      title={t.suspended ? 'Reactivate' : 'Suspend'}
                    >
                      {t.suspended ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => handleDelete(t.id, t.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

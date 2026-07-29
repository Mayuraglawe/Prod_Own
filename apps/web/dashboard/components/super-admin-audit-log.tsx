'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, User, AlignLeft, Target } from 'lucide-react';

type AuditLog = {
  id: string;
  actorId: string;
  tenantId: string | null;
  action: string;
  detail: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
  createdAt: string;
  actor: { name: string | null; email: string | null };
  tenant: { name: string; slug: string } | null;
};

export function SuperAdminAuditLog() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-log');
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" /> Platform Audit Log
        </h2>
        <p className="text-sm text-slate-500 mt-1">Immutable trail of all super admin actions (cross-tenant)</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading audit trail...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-600"><div className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/> Timestamp</div></th>
                <th className="p-4 font-semibold text-slate-600"><div className="flex items-center gap-1.5"><User className="w-4 h-4"/> Actor</div></th>
                <th className="p-4 font-semibold text-slate-600"><div className="flex items-center gap-1.5"><Target className="w-4 h-4"/> Action</div></th>
                <th className="p-4 font-semibold text-slate-600">Target Tenant</th>
                <th className="p-4 font-semibold text-slate-600"><div className="flex items-center gap-1.5"><AlignLeft className="w-4 h-4"/> Detail</div></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-xs text-slate-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{log.actor?.name || 'Unknown User'}</div>
                    <div className="text-xs text-slate-500">{log.actor?.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4">
                    {log.tenant ? (
                      <div>
                        <div className="font-bold text-slate-900">{log.tenant.name}</div>
                        <div className="text-xs text-slate-500">{log.tenant.slug}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Global</span>
                    )}
                  </td>
                  <td className="p-4 text-xs text-slate-600">
                    {log.detail}
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

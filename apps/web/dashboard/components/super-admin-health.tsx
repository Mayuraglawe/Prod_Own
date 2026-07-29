'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Database, Server, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

type HealthData = {
  streamLag: number;
  queues: {
    fingerprints: { waiting: number; active: number; failed: number; delayed: number };
    alerts: { waiting: number; active: number; failed: number; delayed: number };
  };
};

export function SuperAdminHealth() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/platform/health');
      const data = await res.json();
      if (data.health) setHealth(data.health);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading && !health) {
    return <div className="p-8 text-center text-slate-500">Loading infrastructure health...</div>;
  }

  if (!health) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Platform Ops & Infra Monitoring</h2>
          <p className="text-sm text-slate-500">Real-time Kafka/Redis stream and Asynq/BullMQ worker health</p>
        </div>
        <button 
          onClick={fetchHealth}
          disabled={refreshing}
          className={`px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50`}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Redis Streams Lag */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Ingest Pipeline Health</div>
              <div className="text-xs text-slate-500">Redis Streams \`litetrace:events\`</div>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{health.streamLag}</span>
            <span className="text-sm font-bold text-slate-500">pending events</span>
          </div>
          {health.streamLag > 5000 ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 p-2 rounded-lg">
              <AlertTriangle className="w-4 h-4" /> High consumer lag detected
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 p-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4" /> Healthy throughput
            </div>
          )}
        </div>

        {/* Fingerprint Queue */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Fingerprint Worker</div>
              <div className="text-xs text-slate-500">BullMQ \`fingerprints\` Queue</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{health.queues.fingerprints.waiting}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Waiting</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-red-600">{health.queues.fingerprints.failed}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Failed</div>
            </div>
          </div>
        </div>

        {/* Alerts Queue */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Alerts Dispatcher</div>
              <div className="text-xs text-slate-500">BullMQ \`alerts\` Queue</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{health.queues.alerts.waiting}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Waiting</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-red-600">{health.queues.alerts.failed}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Failed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

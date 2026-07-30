'use client';

import React from 'react';
import {
  CheckCircle2,
  Zap,
  TrendingUp,
  Receipt,
  MoreVertical,
  ShieldCheck,
  Coins,
  History,
  Rocket
} from 'lucide-react';

export function AdminPayments() {
  const invoices = [
    { id: 'INV-2026-004', date: 'Jul 01, 2026', amount: '₹99.00', credits: '+30 Credits', status: 'Paid' },
    { id: 'INV-2026-003', date: 'Jun 01, 2026', amount: '₹99.00', credits: '+30 Credits', status: 'Paid' },
    { id: 'INV-2026-002', date: 'May 01, 2026', amount: '₹99.00', credits: '+30 Credits', status: 'Paid' },
    { id: 'INV-2026-001', date: 'Apr 01, 2026', amount: '₹99.00', credits: '+30 Credits', status: 'Paid' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#13221C]">Billing & Credits</h1>
          <p className="text-[#687870] mt-1">Manage your workspace credits, subscription plans, and billing history.</p>
        </div>
        <button className="px-6 py-3 bg-[#02042B] text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 border border-[#02042B]/20">
          <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.5 3L11.5 11H18L11.5 21L12.5 13H6L12.5 3Z"/>
          </svg>
          Buy Credits via Razorpay
        </button>
      </div>

      {/* Credit Balance Alert/Card */}
      <div className="bg-gradient-to-br from-[#0B4F3A] to-[#127054] rounded-3xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Coins className="w-32 h-32 text-white" />
        </div>
        <div className="flex items-center gap-4 relative z-10 text-white">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
            <Coins className="w-7 h-7 text-[#20C997]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Available Balance</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black">45</span>
              <span className="text-lg font-medium text-white/80">Credits</span>
            </div>
            <p className="text-sm text-white/70 mt-1">1 Credit is consumed per day. Your workspace will remain active for <strong className="text-white">45 days</strong>.</p>
          </div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 min-w-[200px]">
           <span className="text-xs text-white/80 uppercase tracking-widest font-bold mb-1">Status</span>
           <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-[#20C997]/20 text-[#20C997] border border-[#20C997]/30">
              <CheckCircle2 className="w-4 h-4" />
              Active Workspace
           </span>
        </div>
      </div>

      {/* Plan Tiers */}
      <div>
        <h3 className="text-xl font-bold text-[#13221C] mb-6 flex items-center gap-2">
          <Rocket className="w-6 h-6 text-[#0B4F3A]" />
          Credit Packages & Plans
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 99 INR Plan */}
          <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl border-2 border-transparent hover:border-[#20C997] transition-all rounded-3xl p-8 shadow-sm flex flex-col h-full group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck className="w-24 h-24 text-[#0B4F3A]" />
            </div>
            <div className="relative z-10 flex-1">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-2xl font-black text-[#13221C]">Starter Plan</h4>
                <span className="px-3 py-1 bg-slate-100 text-[#687870] text-xs font-bold uppercase tracking-wider rounded-full">Most Popular</span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-[#13221C]">₹99</span>
                <span className="text-[#687870] font-medium"> / month</span>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#E6F7F0] to-white border border-[#20C997]/20 mb-6">
                <div className="flex items-center gap-3">
                  <Coins className="w-5 h-5 text-[#20C997]" />
                  <span className="font-bold text-[#0B4F3A]">Includes 30 Credits</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-[#3E5248]">
                  <CheckCircle2 className="w-5 h-5 text-[#20C997]" /> 
                  <span className="font-semibold">100,000</span> Log Events per month
                </div>
                <div className="flex items-center gap-3 text-sm text-[#3E5248]">
                  <CheckCircle2 className="w-5 h-5 text-[#20C997]" /> 
                  <span className="font-semibold">7 Days</span> Data Retention
                </div>
                <div className="flex items-center gap-3 text-sm text-[#3E5248]">
                  <CheckCircle2 className="w-5 h-5 text-[#20C997]" /> 
                  <span className="font-semibold">Up to 3</span> Team Members
                </div>
                <div className="flex items-center gap-3 text-sm text-[#3E5248]">
                  <CheckCircle2 className="w-5 h-5 text-[#20C997]" /> 
                  Community Support
                </div>
              </div>
            </div>
            <button className="w-full py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8E4] text-[#13221C] font-bold hover:bg-[#E6F7F0] hover:text-[#0B4F3A] hover:border-[#20C997] transition-all">
              Current Plan
            </button>
          </div>

          {/* 499 INR Plan */}
          <div className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50/50 backdrop-blur-xl border border-[#E2E8E4] hover:border-[#02042B] transition-all rounded-3xl p-8 shadow-sm flex flex-col h-full group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap className="w-24 h-24 text-[#02042B]" />
            </div>
            <div className="relative z-10 flex-1">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-2xl font-black text-[#13221C]">Pro Plan</h4>
                <span className="px-3 py-1 bg-[#02042B] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">Premium</span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-[#13221C]">₹499</span>
                <span className="text-[#687870] font-medium"> / month</span>
              </div>
              
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 mb-6">
                <div className="flex items-center gap-3">
                  <Coins className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-[#02042B]">Includes 180 Credits (6 Months)</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-[#3E5248]">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" /> 
                  <span className="font-semibold">1 Million</span> Log Events per month
                </div>
                <div className="flex items-center gap-3 text-sm text-[#3E5248]">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" /> 
                  <span className="font-semibold">30 Days</span> Data Retention
                </div>
                <div className="flex items-center gap-3 text-sm text-[#3E5248]">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" /> 
                  <span className="font-semibold">Unlimited</span> Team Members
                </div>
                <div className="flex items-center gap-3 text-sm text-[#3E5248]">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" /> 
                  <span className="font-semibold">Advanced Webhook Alerts</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#3E5248]">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" /> 
                  <span className="font-semibold">Priority Processing</span>
                </div>
              </div>
            </div>
            <button className="w-full py-3 rounded-xl bg-[#02042B] text-white font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md">
              Upgrade to Pro
            </button>
          </div>

        </div>
      </div>

      {/* Usage Analytics Overview */}
      <div className="bg-white border border-[#E2E8E4] rounded-3xl p-8 shadow-sm">
        <h3 className="text-lg font-bold text-[#13221C] mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#0B4F3A]" />
          Current Usage
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-[#3E5248]">Log Events</span>
              <span className="text-[#13221C]">64.2K <span className="text-[#687870] font-normal">/ 100K</span></span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#20C997] to-[#0B4F3A] w-[64%] rounded-full shadow-[0_0_10px_rgba(32,201,151,0.5)]"></div>
            </div>
            <p className="text-xs text-[#687870]">You have used 64% of your monthly event quota.</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-[#3E5248]">Storage Used</span>
              <span className="text-[#13221C]">1.4 GB <span className="text-[#687870] font-normal">/ 5 GB</span></span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 w-[28%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
            </div>
            <p className="text-xs text-[#687870]">Well within your 5 GB storage limit.</p>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white border border-[#E2E8E4] rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E2E8E4] flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-[#13221C] flex items-center gap-2">
            <History className="w-5 h-5 text-[#0B4F3A]" />
            Purchase History
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-[#687870] font-bold border-b border-[#E2E8E4]">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Credits Added</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E4]/60">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 font-mono text-sm text-[#13221C] font-medium">
                    {inv.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#687870]">
                    {inv.date}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#13221C]">
                    {inv.amount}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-[#20C997]">
                    {inv.credits}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E6F7F0] text-[#0B4F3A] border border-[#20C997]/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-lg text-[#687870] hover:bg-white hover:shadow-sm border border-transparent hover:border-[#E2E8E4] transition-all" title="Download Receipt">
                      <Receipt className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg text-[#687870] hover:bg-white hover:shadow-sm border border-transparent hover:border-[#E2E8E4] transition-all ml-1" title="More options">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

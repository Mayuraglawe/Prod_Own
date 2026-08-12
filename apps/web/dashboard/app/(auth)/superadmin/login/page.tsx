import { ShieldCheck, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { ClientLoginForm } from "./client-form"

export const metadata = {
  title: "Super Admin Login | ProdOwn",
}

export default function SuperAdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f2fe] via-[#ecfdf5] to-[#f0fdf4] flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Left Pane - System Status & Branding */}
      <div className="hidden md:flex md:w-1/2 relative p-12 flex-col justify-between overflow-hidden bg-white/40 backdrop-blur-md border-r border-emerald-100">
        <Link href="/" className="relative z-10 flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#0F766E] flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#0F766E]">
            Global Command Center
          </span>
        </Link>

        <div className="relative z-10 space-y-6 max-w-md">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
            Administrative Access
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed font-medium">
            Strict isolation bounds are bypassed here. You are entering the global infrastructure control plane.
          </p>
          
          <div className="space-y-4 pt-8">
            <div className="flex items-center gap-4 text-slate-700 bg-white p-5 rounded-3xl shadow-sm border border-emerald-50">
              <div className="w-12 h-12 rounded-xl bg-[#bbf7d0] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-[#064e3b]" />
              </div>
              <div>
                <span className="block font-bold text-xs uppercase tracking-wider text-[#0F766E]">Zero-Trust Enforcement</span>
                <span className="text-xs text-slate-500 font-medium leading-snug block mt-1">MFA token required for all write operations.</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-700 bg-white p-5 rounded-3xl shadow-sm border border-amber-50">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <span className="block font-bold text-xs uppercase tracking-wider text-amber-700">WORM Audit Logging Active</span>
                <span className="text-xs text-slate-500 font-medium leading-snug block mt-1">All mutations are permanently logged.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          RESTRICTED ACCESS ONLY
        </div>
      </div>

      {/* Right Pane - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md space-y-8 relative z-10 bg-white p-10 rounded-[2rem] shadow-xl border border-emerald-50">
          <div className="space-y-2 text-center md:text-left border-b border-slate-100 pb-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Authenticate</h2>
            <p className="text-slate-500 text-sm font-medium">Please verify your identity to continue.</p>
          </div>

          <div className="pt-2 space-y-6">
            <ClientLoginForm />
          </div>

          <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-8 pt-6 border-t border-slate-100">
            Emergency Access requires YubiKey
          </div>
        </div>
      </div>
    </div>
  )
}

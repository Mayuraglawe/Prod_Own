import Link from 'next/link';
import { ShieldCheck, Activity, Zap, ArrowRight, Github } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-transparent font-sans text-neutral-100 overflow-x-hidden selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-neutral-800/50 bg-neutral-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-100 to-neutral-400">
              ProdOwn
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login"
              className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/register"
              className="group relative inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all duration-200 overflow-hidden"
            >
              <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                <div className="relative h-full w-8 bg-white/20" />
              </div>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-indigo-900/10 to-transparent blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-400 mb-4">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            Self-hosted APM & Error Tracking
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto text-transparent bg-clip-text bg-gradient-to-br from-white via-neutral-200 to-neutral-500">
            Uncover the truth behind every exception.
          </h1>
          
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            ProdOwn is the modern, modular monolith for monitoring your application's health. 
            Built strictly for speed, self-hosting, and complete data ownership.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/register"
              className="group flex items-center gap-2 px-8 py-4 bg-white hover:bg-neutral-100 text-neutral-900 text-base font-semibold rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] active:scale-[0.98]"
            >
              Start Tracking Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="https://github.com/your-org/prodown"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-8 py-4 bg-neutral-900 hover:bg-neutral-800 text-white text-base font-medium rounded-xl border border-neutral-800 transition-colors"
            >
              <Github className="w-5 h-5" />
              View on GitHub
            </a>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="max-w-7xl mx-auto px-6 pt-32 grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800/50 backdrop-blur-sm hover:bg-neutral-900/80 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Multi-Tenant by Design</h3>
            <p className="text-neutral-400 leading-relaxed">
              Strict data isolation enforced directly at the database level using Postgres Row-Level Security (RLS).
            </p>
          </div>
          
          <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800/50 backdrop-blur-sm hover:bg-neutral-900/80 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Modular Monolith</h3>
            <p className="text-neutral-400 leading-relaxed">
              Simplified architecture. Next.js handles everything from API ingestion to frontend dashboards, backed by BullMQ.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800/50 backdrop-blur-sm hover:bg-neutral-900/80 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Real-time Insights</h3>
            <p className="text-neutral-400 leading-relaxed">
              Instantly group identical errors using smart fingerprinting and route alerts directly to Slack.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

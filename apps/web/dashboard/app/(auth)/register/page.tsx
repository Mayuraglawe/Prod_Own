import { signIn } from "../../../auth"
import { Activity, KeyRound, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { ClientRegisterForm } from "./client-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen font-sans text-neutral-100 overflow-hidden landing-page-wrapper flex flex-col md:flex-row relative">
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --bg-page: #0B0C0E;
          --glass-border: rgba(255, 255, 255, 0.08);
          --glass-surface: rgba(255, 255, 255, 0.03);
        }
        .landing-page-wrapper {
          background: var(--bg-page);
          color: #EDEDED;
        }
        .landing-page-wrapper::before {
          content: '';
          position: fixed;
          inset: 0;
          background: url('https://grainy-gradients.vercel.app/noise.svg');
          opacity: 0.2;
          pointer-events: none;
          z-index: 0;
        }
        .bg-grid {
          position: absolute;
          inset: 0;
          background-size: 40px 40px;
          background-image:
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
          mask-image: radial-gradient(circle at center, black 60%, transparent 100%);
          -webkit-mask-image: radial-gradient(circle at center, black 60%, transparent 100%);
          pointer-events: none;
          z-index: 0;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
        .shine-button {
          position: relative;
          overflow: hidden;
        }
        .shine-button::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          transition: 0.5s;
        }
        .shine-button:hover::after { left: 100%; }
      `}} />

      <div className="bg-grid"></div>

      {/* Left Pane - Branding & Value Prop */}
      <div className="hidden md:flex md:w-1/2 relative p-12 flex-col justify-between overflow-hidden z-10 border-r border-white/[0.05]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#F97316]/10 via-transparent to-transparent blur-[80px] pointer-events-none" />
        
        <Link href="/" className="relative z-10 flex items-center gap-2 hover:opacity-80 transition-opacity w-fit">
          <div className="w-8 h-8 rounded-lg bg-[#F97316] flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            ProdOwn
          </span>
        </Link>

        <div className="relative z-10 space-y-6 max-w-md">
          <h1 className="text-4xl lg:text-5xl font-medium tracking-tight leading-[1.1] text-white">
            Join the Next-Generation Error Tracking
          </h1>
          <p className="text-white/50 text-lg font-light leading-relaxed">
            Start gaining unparalleled visibility into your application's health today. Self-hosted, modular, and built for complete data ownership.
          </p>
          
          <div className="space-y-4 pt-8">
            <div className="flex items-center gap-4 text-white/70">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-orange-400" />
              </div>
              <span className="font-light text-[15px]">Strict Tenant Isolation via Postgres RLS</span>
            </div>
            <div className="flex items-center gap-4 text-white/70">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-orange-400" />
              </div>
              <span className="font-light text-[15px]">Secure Session OAuth 2.0</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[13px] text-white/30 font-light">
          © {new Date().getFullYear()} ProdOwn Inc.
        </div>
      </div>

      {/* Right Pane - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-transparent blur-3xl pointer-events-none" />
        
        <div className="w-full max-w-sm space-y-8 relative z-10">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-medium tracking-tight text-white">Create an account</h2>
            <p className="text-white/50 font-light text-[14px]">Sign up to get started with ProdOwn</p>
          </div>

          <div className="pt-6 space-y-6 glass-card p-8 rounded-2xl">
            <ClientRegisterForm />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-transparent text-white/40" style={{ background: '#0B0C0E' }}>Or continue with</span>
              </div>
            </div>

            <form
              action={async () => {
                "use server"
                await signIn("google")
              }}
            >
              <button
                type="submit"
                className="shine-button group relative w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#EBEBEB] text-[#0B0C0E] text-[14px] font-medium rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign up with Google
              </button>
            </form>
          </div>

          <div className="text-center text-[13px] text-white/40 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:text-[#F97316] transition-colors font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

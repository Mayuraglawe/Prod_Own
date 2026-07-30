import { signIn } from "../../../auth"
import { Monitor, KeyRound, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { ClientRegisterForm } from "./client-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row font-sans text-neutral-100 overflow-hidden">
      {/* Left Pane - Branding & Value Prop */}
      <div className="hidden md:flex md:w-1/2 relative bg-transparent p-12 flex-col justify-between overflow-hidden">
        {/* Decorative Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[140%] h-[140%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-neutral-900 to-neutral-950 blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Monitor className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-100 to-neutral-400">
            ProdOwn
          </span>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white via-neutral-200 to-neutral-500">
            Join the Next-Generation Error Tracking
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed">
            Start gaining unparalleled visibility into your application's health today. Self-hosted, modular, and built for speed.
          </p>
          
          <div className="space-y-4 pt-8">
            <div className="flex items-center gap-4 text-neutral-300">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <span className="font-medium">Strict Tenant Isolation</span>
            </div>
            <div className="flex items-center gap-4 text-neutral-300">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-purple-400" />
              </div>
              <span className="font-medium">Secure Session OAuth 2.0</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-neutral-500 font-medium">
          © {new Date().getFullYear()} ProdOwn Inc.
        </div>
      </div>

      {/* Right Pane - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent blur-3xl pointer-events-none" />
        
        <div className="w-full max-w-sm space-y-8 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-white">Create an account</h2>
            <p className="text-neutral-400 text-sm">Sign up to get started with ProdOwn</p>
          </div>

          <div className="pt-6 space-y-6">
            <ClientRegisterForm />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-neutral-950 text-neutral-500">Or continue with</span>
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
                className="group relative w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white text-sm font-semibold rounded-xl transition-all duration-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
            </form>
          </div>

          <div className="text-center text-sm text-neutral-400 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500 hover:text-blue-400 font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

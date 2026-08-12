"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export function ClientLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [totp, setTotp] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // We pass TOTP for superadmin login if required
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      totp
    })

    if (res?.error) {
      setError("Invalid credentials or MFA token")
      setLoading(false)
    } else {
      router.push("/superadmin/dashboard")
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="email">
          Administrator Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-colors shadow-sm font-medium"
          placeholder="admin@prodown.io"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-colors shadow-sm font-medium"
          placeholder="••••••••"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="totp">
          MFA Token (Hardware Key)
        </label>
        <input
          id="totp"
          type="text"
          value={totp}
          onChange={(e) => setTotp(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-colors shadow-sm font-medium"
          placeholder="000000"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-6 py-3.5 bg-[#0F766E] hover:bg-[#0d615b] text-white text-sm font-extrabold uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 shadow-md"
      >
        {loading ? "Authenticating..." : "Authorize Access"}
      </button>
    </form>
  )
}

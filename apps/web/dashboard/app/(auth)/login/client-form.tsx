"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export function ClientLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })

    if (res?.error) {
      setError("Invalid email or password")
      setLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-white/60" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-colors text-sm"
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-medium text-white/60" htmlFor="password">
            Password
          </label>
        </div>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-colors text-sm"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="shine-button relative w-full py-3.5 bg-transparent border border-white/10 hover:border-[#F97316]/50 text-white text-[14px] font-medium rounded-xl transition-all duration-200 hover:shadow-[0_0_15px_rgba(249,115,22,0.2)] disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign In with Email"}
      </button>
    </form>
  )
}

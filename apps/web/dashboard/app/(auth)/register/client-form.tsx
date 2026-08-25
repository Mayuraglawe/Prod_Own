"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerUser } from "./actions"

export function ClientRegisterForm() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const res = await registerUser(formData)

    if (res.error) {
      setError(res.error)
      setLoading(false)
    } else {
      router.push("/login")
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
          name="email"
          type="email"
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
          name="password"
          type="password"
          required
          className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-colors text-sm"
          placeholder="••••••••"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-medium text-white/60" htmlFor="confirmPassword">
            Confirm Password
          </label>
        </div>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
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
        {loading ? "Creating account..." : "Sign Up"}
      </button>
    </form>
  )
}

import { createWorkspace } from '../../../../lib/actions/tenants';

/**
 * Onboarding page shown to authenticated users who do not yet have a workspace.
 * Replaces the old hardcoded test-tenant auto-assignment in dashboard/page.tsx.
 */
export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-[#F3F5F4] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E2E8E4] shadow-sm p-8 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-[#52b788] flex items-center justify-center mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#13221C]">Create your workspace</h1>
          <p className="text-sm text-[#687870]">
            Give your error tracking workspace a name. You can invite team members after setup.
          </p>
        </div>

        {/* Form */}
        <form action={createWorkspace} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-xs font-bold text-[#13221C]">
              Workspace name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={60}
              placeholder="e.g. Acme Corp"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8E4] bg-[#F3F5F4] text-sm text-[#13221C] placeholder:text-[#A0ABA4] focus:outline-none focus:ring-2 focus:ring-[#52b788]/30 focus:border-[#52b788]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#52b788] text-white font-bold text-sm rounded-xl hover:bg-[#0a3f2f] transition-colors"
          >
            Create workspace
          </button>
        </form>
      </div>
    </div>
  );
}

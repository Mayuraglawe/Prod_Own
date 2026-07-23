import { auth } from '../../../auth';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { issuesRepository } from '../../../lib/repositories/issues';
import { tenantsRepository } from '../../../lib/repositories/tenants';
import { DashboardOverview } from '../../../components/dashboard-overview';

/**
 * Main dashboard view for authenticated users.
 *
 * If the user does not yet have a tenant assigned, they are redirected to
 * the onboarding flow to create their workspace. The hardcoded test-tenant
 * fallback has been intentionally removed — all tenants must be created
 * through the proper onboarding path.
 */
export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await tenantsRepository.getUserByEmail(session.user.email);

  if (!user) {
    redirect('/login');
  }

  // New users without a workspace must go through onboarding
  if (!user.tenantId) {
    redirect('/onboarding' as Route);
  }

  const issues = await issuesRepository.findByTenant(user.tenantId);

  const totalIssues = issues.length;
  const resolvedIssues = issues.filter((i) => i.status === 'RESOLVED').length;
  const totalEvents = issues.reduce((acc, curr) => acc + curr.eventCount, 0);

  const stats = { totalIssues, totalEvents, resolvedIssues };
  const activeIssues = issues.slice(0, 5);

  return <DashboardOverview stats={stats} activeIssues={activeIssues} />;
}

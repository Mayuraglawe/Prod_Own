import { DashboardOverview } from '../../../components/dashboard-overview';
import { auth } from '../../../auth';
import { redirect } from 'next/navigation';
import { prisma } from '@prod-own/db';

/**
 * Main dashboard view for authenticated users.
 */
export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  return <DashboardOverview />;
}

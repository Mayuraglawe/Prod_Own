import { auth } from '../../../../auth';
import { redirect } from 'next/navigation';
import { prisma } from '@litetrace/db';
import ProfileClient from './profile-client';

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenant: true }
  });

  if (!user) {
    redirect('/login');
  }

  // Convert dates to string so they can be passed as props to Client Component
  const serializableUser = {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    emailVerified: user.emailVerified?.toISOString() || null,
    tenant: user.tenant ? {
      ...user.tenant,
      createdAt: user.tenant.createdAt.toISOString(),
      updatedAt: user.tenant.updatedAt.toISOString(),
    } : null
  };

  return <ProfileClient user={serializableUser} />;
}

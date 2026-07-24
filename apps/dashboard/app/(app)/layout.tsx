import React from 'react';
import { Sidebar } from '../../components/sidebar';
import { Header } from '../../components/header';
import { auth } from '../../auth';
import { prisma } from '@litetrace/db';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  let user = undefined;
  if (session?.user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    user = dbUser || undefined;
  }

  return (
    <div className="flex min-h-screen bg-[#F3F5F4] text-[#13221C] font-sans antialiased">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto space-y-6">
        <Header user={user} />
        {children}
      </main>
    </div>
  );
}

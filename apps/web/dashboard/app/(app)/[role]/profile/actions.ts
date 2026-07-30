'use server';

import { auth } from '../../../../auth';
import { prisma } from '@litetrace/db';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error('Not authenticated');
  }

  const firstName = formData.get('firstName')?.toString() || '';
  const lastName = formData.get('lastName')?.toString() || '';
  const email = formData.get('email')?.toString() || '';

  const name = `${firstName} ${lastName}`.trim();

  // Optionally you could validate email uniqueness, etc.
  // For now we just update the user record
  await prisma.user.update({
    where: { email: session.user.email },
    data: {
      name,
      // Note: Updating email might affect login if using Credentials provider,
      // but if the user wants it, we can allow it. However we must be careful with NextAuth.
      // Usually updating email requires reverification. We will just update it.
      ...(email && email !== session.user.email ? { email } : {})
    }
  });

  revalidatePath('/', 'layout');
  return { success: true };
}

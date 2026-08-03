import type { NextAuthConfig } from 'next-auth';
import { prisma } from '@litetrace/db';

/**
 * Resolves the effective role for a user from the database.
 *
 * Priority order (most specific wins):
 *   1. WorkspaceMember.role  — per-workspace RBAC, most authoritative
 *   2. User.role             — platform-level fallback
 *
 * This runs at most once per login (when the JWT is first minted), so it
 * does NOT add a DB query on every request.
 */
async function resolveRoleFromDb(userId: string): Promise<{
  role: string | null;
  tenantId: string | null;
}> {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      tenantId: true,
      memberships: {
        where: { status: 'ACTIVE' },
        select: { role: true },
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!dbUser) return { role: null, tenantId: null };

  // WorkspaceMember.role is the authoritative source; fall back to User.role
  const effectiveRole = dbUser.memberships?.[0]?.role ?? dbUser.role ?? null;

  return { role: effectiveRole, tenantId: dbUser.tenantId };
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On initial sign-in, `user` is populated by the provider / PrismaAdapter.
      // Copy whatever fields are present; we'll fill in missing ones below.
      if (user) {
        token.id = user.id;
        // @ts-expect-error - appending role
        token.role = user.role;
        // @ts-expect-error - appending tenantId
        token.tenantId = user.tenantId;
      }

      // Hydrate role + tenantId from DB when they are absent in the token.
      // This happens for OAuth (Google) sign-ins because the NextAuth `User`
      // type doesn't surface custom Prisma fields, leaving token.role undefined.
      // Also always prefer WorkspaceMember.role over User.role.
      if (token.id && !token.role) {
        try {
          const { role, tenantId } = await resolveRoleFromDb(token.id as string);
          if (role) token.role = role;
          if (tenantId && !token.tenantId) token.tenantId = tenantId;
        } catch {
          // Non-fatal: middleware + layout both default to 'employee' if role is absent.
        }
      }

      // Handle session.update() calls (e.g. after onboarding creates a workspace).
      if (trigger === 'update' && session?.user) {
        if (session.user.tenantId !== undefined) {
          token.tenantId = session.user.tenantId;
        }
        // Allow callers to update the role too (e.g. after a role change).
        if (session.user.role !== undefined) {
          token.role = session.user.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        // @ts-expect-error - appending role
        session.user.role = token.role as string;
        // @ts-expect-error - appending tenantId
        session.user.tenantId = token.tenantId as string | null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

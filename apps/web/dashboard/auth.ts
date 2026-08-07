import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@litetrace/db"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

/**
 * Resolves the effective role for a user from the database.
 *
 * Priority order (most specific wins):
 *   1. WorkspaceMember.role  — per-workspace RBAC, most authoritative
 *   2. User.role             — platform-level fallback
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

  const effectiveRole = dbUser.memberships?.[0]?.role ?? dbUser.role ?? null;
  return { role: effectiveRole, tenantId: dbUser.tenantId };
}
export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string }
          })
          
          console.log("== AUTH DEBUG ==");
          console.log("Looking for email:", credentials.email);
          console.log("Found user:", user?.email, "Has password:", !!user?.password);
          
          if (!user || !user.password) {
            console.log("Rejecting: User not found or missing password in DB");
            return null
          }
          
          const passwordsMatch = await bcrypt.compare(
            credentials.password as string,
            user.password
          )
          
          console.log("Password matched:", passwordsMatch);
          
          if (passwordsMatch) {
            return user
          }
          
          return null
        } catch (error) {
          console.error("AUTHORIZE ERROR:", error);
          throw error;
        }
      }
    })



  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      // On initial sign-in from the provider, merge the user data
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        // @ts-expect-error - appending role
        token.role = user.role;
        // @ts-expect-error - appending tenantId
        token.tenantId = user.tenantId;
      }

      // Hydrate custom fields from the DB if they are missing
      if (token.id && !token.role) {
        try {
          const { role, tenantId } = await resolveRoleFromDb(token.id as string);
          if (role) token.role = role;
          if (tenantId && !token.tenantId) token.tenantId = tenantId;
        } catch {
          // fallback gracefully
        }
      }

      // Handle explicit session.update() calls
      if (trigger === 'update' && session?.user) {
        if (session.user.tenantId !== undefined) token.tenantId = session.user.tenantId;
        if (session.user.role !== undefined) token.role = session.user.role;
      }

      return token;
    },
  }
})

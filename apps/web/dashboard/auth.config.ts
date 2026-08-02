import type { NextAuthConfig } from 'next-auth';

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
      if (user) {
        token.id = user.id;
        // @ts-expect-error - appending role
        token.role = user.role;
        // @ts-expect-error - appending tenantId
        token.tenantId = user.tenantId;
      }
      
      // Handle session updates
      if (trigger === "update") {
        console.log("== JWT UPDATE TRIGGERED ==");
        console.log("Session payload:", session);
        if (session?.user?.tenantId !== undefined) {
          token.tenantId = session.user.tenantId;
        }
        if (session?.user?.role !== undefined) {
          token.role = session.user.role;
        }
        console.log("Updated token:", token);
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
  events: {
    async createUser({ user }) {
      if (user.id && user.email) {
        // Auto-provision a workspace for OAuth users
        const { autoProvisionWorkspace } = await import('./lib/services/workspace-provisioner');
        await autoProvisionWorkspace(user.id, user.email);
      }
    }
  }
} satisfies NextAuthConfig;

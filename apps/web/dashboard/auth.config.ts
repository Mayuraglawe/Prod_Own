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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-expect-error - appending role
        token.role = user.role;
        // @ts-expect-error - appending tenantId
        token.tenantId = user.tenantId;
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

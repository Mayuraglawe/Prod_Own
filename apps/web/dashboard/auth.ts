import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@litetrace/db"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

// @ts-expect-error - update is not in the type definition but it works
export const { handlers, signIn, signOut, auth, update } = NextAuth({
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


  ]
})

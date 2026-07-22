import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@prod-own/db"
import bcrypt from "bcrypt"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
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
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        const user = await prisma.user.findUnique({
          // @ts-expect-error - The IDE TS Server is using a stale cache of the Prisma client.
          where: { email: credentials.email as string }
        })
        
        // @ts-expect-error - The IDE TS Server is using a stale cache of the Prisma client.
        if (!user || !user.password) {
          return null
        }
        
        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          // @ts-expect-error - The IDE TS Server is using a stale cache of the Prisma client.
          user.password
        )
        
        if (passwordsMatch) {
          return user
        }
        
        return null
      }
    })


  ]
})

"use server"

import { prisma } from "@litetrace/db"
import bcrypt from "bcryptjs"

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  
  if (!email || !password || !confirmPassword) {
    return { error: "Email and passwords are required" }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { error: "User already exists" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      }
    })

    // Auto-provision a workspace for the new user so they don't need onboarding
    const { autoProvisionWorkspace } = await import('../../../lib/services/workspace-provisioner')
    await autoProvisionWorkspace(user.id, user.email!)

    return { success: true }
  } catch (e: unknown) {
    console.error("Registration error:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return { error: "Database error: " + msg };
  }
}

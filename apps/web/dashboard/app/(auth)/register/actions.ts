"use server"

import { prisma } from "@litetrace/db"
import bcrypt from "bcryptjs"
import crypto from "crypto"

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

    await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
        }
      });

      // 2. Auto-create default Workspace
      const name = "My Workspace";
      const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const slug = `${baseSlug}-${user.id.slice(0, 6)}`;

      const tenant = await tx.tenant.create({
        data: { slug, name },
      });

      // 3. Assign User to Tenant
      await tx.user.update({
        where: { id: user.id },
        data: { tenantId: tenant.id },
      });

      // 4. Create WorkspaceMember role
      await tx.workspaceMember.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          role: 'SUPER_ADMIN'
        }
      });
      
      // 5. Create Dedicated Project
      const projectName = `${name} Main Project`;
      const externalId = `${slug}-main`;
      const randomHex = crypto.randomBytes(16).toString('hex');
      const plainApiKey = `lt_live_${randomHex}`;
      const apiKeyHash = crypto.createHash('sha256').update(plainApiKey).digest('hex');
      const apiKeyPrefix = plainApiKey.substring(0, 15);

      await tx.source.create({
        data: {
          tenantId: tenant.id,
          name: projectName,
          externalId,
          apiKeyHash,
          apiKeyPrefix,
        },
      });
    });

    return { success: true }
  } catch (e: unknown) {
    console.error("Registration error:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return { error: "Database error: " + msg };
  }
}

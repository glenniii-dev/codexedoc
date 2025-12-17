// server/mutations/updateUser.ts
"use server";

import { db } from "@/server/db/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { uploadImage } from "@/lib/r2";
import { getCurrentUser } from "@/utils/getCurrentUser";
import { revalidatePath } from "next/cache";

export async function updateUser(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const name = (formData.get("name") as string)?.trim();
  const bio = (formData.get("bio") as string)?.trim();

  const password = formData.get("password") as string | null;
  const confirmPassword = formData.get("confirmPassword") as string | null;

  const securityAnswerOne = (formData.get("securityAnswerOne") as string)?.trim();
  const securityAnswerTwo = (formData.get("securityAnswerTwo") as string)?.trim();

  const errors: Record<string, string> = {};

  if (!name) errors.name = "Name is required";
  if (password && password.length < 8) errors.password = "Password must be at least 8 characters";
  if (password && password !== confirmPassword)
    errors.confirmPassword = "Passwords do not match";

  if (Object.keys(errors).length > 0) {
    throw new Error(JSON.stringify(errors));
  }

  let image = user.image;
  const file = formData.get("image") as File | null;
  if (file) {
    image = await uploadImage(file, "users");
  }

  const updateData: Partial<typeof users.$inferInsert> = {
    name: name.toLowerCase(),
    bio,
    image,
  };

  if (password) updateData.password = await bcrypt.hash(password, 12);
  if (securityAnswerOne)
    updateData.securityAnswerOne = await bcrypt.hash(securityAnswerOne, 12);
  if (securityAnswerTwo)
    updateData.securityAnswerTwo = await bcrypt.hash(securityAnswerTwo, 12);

  await db.update(users).set(updateData).where(eq(users.id, user.id));

  revalidatePath("/settings");
  return { success: true };
}
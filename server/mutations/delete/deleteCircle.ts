"use server";

import { getCurrentUser } from "@/utils/getCurrentUser";
import { db } from "../../db/db";
import { circles, circleMembers, circleCodex } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function deleteCircle(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error(JSON.stringify({ general: "Unauthorized" }));

  const circleId = formData.get("circleId") as string;
  const confirmationName = (formData.get("confirmationName") as string)?.trim();

  if (!circleId || !confirmationName) {
    throw new Error(JSON.stringify({ confirmationName: "Circle name required for deletion" }));
  }

  const [circle] = await db
    .select({ name: circles.name })
    .from(circles)
    .where(and(eq(circles.id, circleId), eq(circles.ownerId, user.id)))
    .limit(1);

  if (!circle) {
    throw new Error(JSON.stringify({ general: "Circle not found or you are not the owner" }));
  }

  if (circle.name !== confirmationName.toLowerCase()) {
    throw new Error(JSON.stringify({ confirmationName: "Circle name does not match" }));
  }

  // Delete in correct order to respect foreign keys
  await db.delete(circleCodex).where(eq(circleCodex.circleId, circleId));
  await db.delete(circleMembers).where(eq(circleMembers.circleId, circleId));
  await db.delete(circles).where(eq(circles.id, circleId));

  revalidatePath("/settings");
  revalidatePath("/hub");
}
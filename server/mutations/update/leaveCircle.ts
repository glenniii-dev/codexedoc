"use server";

import { getCurrentUser } from "@/utils/getCurrentUser";
import { db } from "../../db/db";
import { circleMembers } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function leaveCircle(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error(JSON.stringify({ general: "Unauthorized" }));

  const circleId = formData.get("circleId") as string;
  if (!circleId) throw new Error(JSON.stringify({ general: "Circle ID required" }));

  // Prevent owner from leaving (they must delete or transfer ownership)
  const membership = await db
    .select({ role: circleMembers.role })
    .from(circleMembers)
    .where(and(eq(circleMembers.circleId, circleId), eq(circleMembers.userId, user.id)))
    .limit(1);

  if (!membership.length) {
    throw new Error(JSON.stringify({ general: "You are not a member of this circle" }));
  }

  if (membership[0].role === "owner") {
    throw new Error(JSON.stringify({ general: "Owner cannot leave. Delete the circle instead." }));
  }

  await db
    .delete(circleMembers)
    .where(and(eq(circleMembers.circleId, circleId), eq(circleMembers.userId, user.id)));

  revalidatePath("/settings");
}
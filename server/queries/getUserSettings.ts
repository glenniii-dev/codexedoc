// server/queries/getUserSettings.ts
"use server";

import { db } from "@/server/db/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/utils/getCurrentUser";

export async function getUserSettings() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      bio: users.bio,
      image: users.image,
      securityQuestionOne: users.securityQuestionOne,
      securityQuestionTwo: users.securityQuestionTwo,
    })
    .from(users)
    .where(eq(users.id, currentUser.id))
    .limit(1);

  return user ?? null;
}
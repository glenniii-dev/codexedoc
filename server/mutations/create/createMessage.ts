"use server";

import { db } from "@/server/db/db";
import { messages, threads } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/utils/getCurrentUser";

export async function createMessage(threadId: string, content: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const [msg] = await db
    .insert(messages)
    .values({
      userId: user.id,
      message: content,
    })
    .returning();

  const thread = (
    await db.select().from(threads).where(eq(threads.id, threadId))
  )[0];

  await db
    .update(threads)
    .set({
      messageIds: [...thread.messageIds, msg.id],
    })
    .where(eq(threads.id, threadId));

  return {
    id: msg.id,
    userId: msg.userId,
    message: msg.message,
    timestamp: msg.timestamp,
  };
}

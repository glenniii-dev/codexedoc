"use server";

import { db } from "@/server/db/db";
import { threads, circles, domains } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function createThread(domainId: string, threadName: string, circleId: string) {
  const newThread = await db
    .insert(threads)
    .values({
      name: threadName,
      messageIds: [],
    })
    .returning();

  // Update domain
  await db
    .update(domains)
    .set({
      threadIds: [...(await db.select({ threadIds: domains.threadIds }).from(domains).where(eq(domains.id, domainId)).then(r => r[0]?.threadIds || [])), newThread[0].id],
    })
    .where(eq(domains.id, domainId));

  // Update circle (threadIds)
  await db
    .update(circles)
    .set({
      threadIds: [...(await db.select({ threadIds: circles.threadIds }).from(circles).where(eq(circles.id, circleId)).then(r => r[0]?.threadIds || [])), newThread[0].id],
    })
    .where(eq(circles.id, circleId));

  return newThread[0];
}

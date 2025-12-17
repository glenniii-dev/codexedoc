"use server";

import { db } from "@/server/db/db";
import { threads, domains, circles } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function deleteThread(circleId: string, domainId: string, threadId: string) {
  await db.delete(threads).where(eq(threads.id, threadId));

  // Remove from domain
  const domain = await db.select().from(domains).where(eq(domains.id, domainId)).then(r => r[0]);
  await db.update(domains).set({
    threadIds: domain.threadIds.filter(id => id !== threadId),
  }).where(eq(domains.id, domainId));

  // Remove from circle
  const circle = await db.select().from(circles).where(eq(circles.id, circleId)).then(r => r[0]);
  await db.update(circles).set({
    threadIds: circle.threadIds.filter(id => id !== threadId),
  }).where(eq(circles.id, circleId));
}

"use server";

import { db } from "@/server/db/db";
import { domains, threads, circles } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function deleteDomain(circleId: string, domainId: string) {
  const domain = await db.select().from(domains).where(eq(domains.id, domainId)).then(r => r[0]);
  if (!domain) return;

  // Delete threads
  if (domain.threadIds.length) {
    await db.delete(threads).where(eq(threads.id, domain.threadIds[0]));
  }

  // Delete domain
  await db.delete(domains).where(eq(domains.id, domainId));

  // Remove domain from circle
  const circle = await db.select().from(circles).where(eq(circles.id, circleId)).then(r => r[0]);
  await db.update(circles).set({
    domainIds: circle.domainIds.filter(id => id !== domainId),
  }).where(eq(circles.id, circleId));
}

"use server";

import { db } from "@/server/db/db";
import { domains, circles } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function createDomain(circleId: string, domainName: string) {
  const newDomain = await db
    .insert(domains)
    .values({
      name: domainName,
      threadIds: [],
    })
    .returning();

  // Update circle to include the new domain
  await db
    .update(circles)
    .set({
      domainIds: [...(await db.select({ domainIds: circles.domainIds }).from(circles).where(eq(circles.id, circleId)).then(r => r[0]?.domainIds || [])), newDomain[0].id],
    })
    .where(eq(circles.id, circleId));

  return newDomain[0];
}

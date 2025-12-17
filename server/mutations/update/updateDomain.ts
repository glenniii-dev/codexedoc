"use server";

import { db } from "@/server/db/db";
import { circles, domains } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function renameDomain(domainId: string, name: string) {
  await db.update(domains).set({ name }).where(eq(domains.id, domainId));
}

export async function reorderDomains(circleId: string, domainIds: string[]) {
  await db.update(circles).set({ domainIds }).where(eq(circles.id, circleId));
}

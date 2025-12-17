"use server";

import { db } from "@/server/db/db";
import { domains, threads } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function renameThread(threadId: string, name: string) {
  await db.update(threads).set({ name }).where(eq(threads.id, threadId));
}

export async function reorderThreads(domainId: string, threadIds: string[]) {
  await db.update(domains).set({ threadIds }).where(eq(domains.id, domainId));
}

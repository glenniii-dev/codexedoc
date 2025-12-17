import { db } from "@/server/db/db";
import { circles, circleMembers, users, domains, threads, messages } from "@/server/db/schema";
import Circle from "@/types/Circle";
import { eq, inArray } from "drizzle-orm";

export async function getCircleData(circleId: string): Promise<Circle | null> {
  const circleRow = (await db.select().from(circles).where(eq(circles.id, circleId)).limit(1))[0];
  if (!circleRow || !circleRow.circleCodexId) return null;

  // Fetch members with user info
  const memberRows = await db
    .select({
      user: users,
      circle_member: circleMembers,
    })
    .from(circleMembers)
    .leftJoin(users, eq(users.id, circleMembers.userId))
    .where(eq(circleMembers.circleId, circleId));

  const members = memberRows
    .filter(m => m.user !== null) // skip null users from left join
    .map(m => ({
      id: m.user!.id,
      username: m.user!.username,
      name: m.user!.name,
      image: m.user!.image,
      role: m.circle_member.role,
    }));

  // Fetch domains
  const domainRows = circleRow.domainIds.length
    ? await db.select().from(domains).where(inArray(domains.id, circleRow.domainIds))
    : [];

  const domainsWithThreads = await Promise.all(
    domainRows.map(async (domain): Promise<{ id: string; name: string; threadIds: string[] }> => {
      const threadRows = domain.threadIds.length
        ? await db.select().from(threads).where(inArray(threads.id, domain.threadIds))
        : [];
      return {
        id: domain.id,
        name: domain.name,
        threadIds: threadRows.map(t => t.id),
      };
    })
  );

  // Fetch threads
  const threadRows = circleRow.threadIds.length
    ? await db.select().from(threads).where(inArray(threads.id, circleRow.threadIds))
    : [];

  const threadsWithMessages = await Promise.all(
    threadRows.map(async (t): Promise<{ id: string; name: string; messageIds: string[] }> => {
      const messageRows = t.messageIds.length
        ? await db.select().from(messages).where(inArray(messages.id, t.messageIds))
        : [];
      return {
        id: t.id,
        name: t.name,
        messageIds: messageRows.map(m => m.id),
      };
    })
  );

  // Fetch all messages for circle
  const allMessageIds = threadsWithMessages.flatMap(t => t.messageIds);
  const messageRows = allMessageIds.length
    ? await db.select().from(messages).where(inArray(messages.id, allMessageIds))
    : [];

  const messagesMapped = messageRows.map(m => ({
    id: m.id,
    userId: m.userId,
    message: m.message,
    timestamp: m.timestamp,
  }));

  return {
    id: circleRow.id,
    name: circleRow.name,
    description: circleRow.description,
    image: circleRow.image,
    tags: circleRow.tags,
    ownerId: circleRow.ownerId,
    domainIds: circleRow.domainIds,
    threadIds: circleRow.threadIds,
    brainstormIds: circleRow.brainstormIds,
    circleCodexId: circleRow.circleCodexId,
    members,
    domains: domainsWithThreads,
    threads: threadsWithMessages,
    messages: messagesMapped,
  } as Circle;
}

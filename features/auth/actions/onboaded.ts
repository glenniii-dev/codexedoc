import { db } from "@/server/db/db";

export default async function onboarded(userId: string) {
  if (!userId) return false;

  const user = await db.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
  });

  return user?.onboarded ?? false;
}

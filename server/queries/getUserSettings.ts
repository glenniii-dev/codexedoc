// // server/queries/getUserSettings.ts
// "use server";

// import { db } from "@/server/db/db";
// import { users } from "@/server/db/schema";
// import { eq } from "drizzle-orm";
// import { getCurrentUser } from "@/utils/getCurrentUser";

// export async function getUserSettings() {
//   const currentUser = await getCurrentUser();
//   if (!currentUser) return null;

//   const [user] = await db
//     .select({
//       id: users.id,
//       name: users.name,
//       bio: users.bio,
//       image: users.image,
//       securityQuestionOne: users.securityQuestionOne,
//       securityQuestionTwo: users.securityQuestionTwo,
//     })
//     .from(users)
//     .where(eq(users.id, currentUser.id))
//     .limit(1);

//   return user ?? null;
// }
import { db } from "../db/db";
import { users, circles, circleMembers } from "../db/schema";
import { eq } from "drizzle-orm";
import { and, sql } from "drizzle-orm";
import { getCurrentUser } from "@/utils/getCurrentUser";

export async function getUserSettings() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [dbUser] = await db
    .select({
      id: users.id,
      name: users.name,
      bio: users.bio,
      image: users.image,
      securityQuestionOne: users.securityQuestionOne,
      securityQuestionTwo: users.securityQuestionTwo,
    })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!dbUser) return null;

  // Owned circles
  const ownedCircles = await db
    .select({
      id: circles.id,
      name: circles.name,
      image: circles.image,
      description: circles.description,
      tags: circles.tags,
      role: sql<string>`'owner'`,
    })
    .from(circles)
    .where(eq(circles.ownerId, user.id));

  // Joined circles (non-owner)
  const joinedCircles = await db
    .select({
      id: circles.id,
      name: circles.name,
      image: circles.image,
      description: circles.description,
      tags: circles.tags,
      role: circleMembers.role,
    })
    .from(circleMembers)
    .innerJoin(circles, eq(circles.id, circleMembers.circleId))
    .where(and(eq(circleMembers.userId, user.id), eq(circleMembers.role, "member")));

  const allCircles = [...ownedCircles, ...joinedCircles];

  return {
    ...dbUser,
    circles: allCircles,
  };
}
import { db } from "../db/db";
import { circleMembers, circles } from "../db/schema";
import { eq } from "drizzle-orm";

export async function getUserCircles(userId: string) {
  // Select circles by joining circleMembers
  const userCircles = await db
    .select({
      circle: circles, // we only want the circle data
    })
    .from(circleMembers)
    .innerJoin(circles, eq(circleMembers.circleId, circles.id))
    .where(eq(circleMembers.userId, userId));

  // This is now an array of circle objects
  return userCircles.map((row) => row.circle);
}


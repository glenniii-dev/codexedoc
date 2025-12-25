"use server";

import { getCurrentUser } from "@/utils/getCurrentUser";
import { uploadImage } from "@/lib/r2";
import { db } from "../../db/db";
import { circles } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateCircle(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error(JSON.stringify({ general: "Unauthorized" }));

  const circleId = formData.get("circleId") as string;
  if (!circleId) throw new Error(JSON.stringify({ general: "Circle ID required" }));

  // Verify ownership
  const [circle] = await db
    .select()
    .from(circles)
    .where(and(eq(circles.id, circleId), eq(circles.ownerId, user.id)))
    .limit(1);

  if (!circle) throw new Error(JSON.stringify({ general: "Not authorized or circle not found" }));

  let image = circle.image;
  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    image = await uploadImage(file, "circles");
  }

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const tagsRaw = formData.getAll("tags") as string[];
  const tags = tagsRaw.map((t) => t.trim().toLowerCase()).filter(Boolean);

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Name is required";
  if (!description) errors.description = "Description is required";
  if (tags.length < 3) errors.tags = "At least 3 tags required";
  if (tags.length > 12) errors.tags = "Maximum 12 tags allowed";

  if (Object.keys(errors).length > 0) {
    throw new Error(JSON.stringify(errors));
  }

  await db
    .update(circles)
    .set({
      name,
      image,
      description,
      tags,
    })
    .where(eq(circles.id, circleId));

  revalidatePath("/settings");
}
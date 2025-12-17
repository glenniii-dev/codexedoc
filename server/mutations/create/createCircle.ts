"use server";

import { getCurrentUser } from "@/utils/getCurrentUser";
import { uploadImage } from "@/lib/r2";
import { db } from "../../db/db";
import { circles, circleMembers, circleCodex } from "../../db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

export async function createCircle(formData: FormData) {
  let createdCircleId;

  const user = await getCurrentUser();
  if (!user) {
    revalidatePath("/sign-in");
    return;
  }

  let image = "";
  const file = formData.get("image") as File | null;

  if (file) {
    image = await uploadImage(file, "circles");
  }

  const name = (formData.get("name") as string)?.trim().toLowerCase();
  const description = (formData.get("description") as string)?.trim();
  const tags = formData
    .getAll("tags")
    .map((t) => t.toString().trim().toLowerCase())
    .filter(Boolean);

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Name is required";
  if (!image) errors.image = "Image is required";
  if (!description) errors.description = "Description is required";
  if (tags.length < 3) errors.tags = "You must have at least 3 tags";
  if (tags.length > 12) errors.tags = "You can add up to 12 tags";

  if (Object.keys(errors).length > 0) throw new Error(JSON.stringify(errors));

  try {
    // 1️⃣ Create the circle
    const [circle] = await db
      .insert(circles)
      .values({
        name,
        image,
        description,
        tags,
        ownerId: user.id,
      })
      .returning();

    if (!circle) throw new Error("Failed to create circle");

    // 2️⃣ Create the codex
    const [codex] = await db
      .insert(circleCodex)
      .values({ circleId: circle.id })
      .returning();

    if (!codex) throw new Error("Failed to create circle codex");

    // 3️⃣ Update circle to link codex
    await db
      .update(circles)
      .set({ circleCodexId: codex.id })
      .where(eq(circles.id, circle.id));

    // 4️⃣ Add user as owner
    await db.insert(circleMembers).values({
      circleId: circle.id,
      userId: user.id,
      role: "owner",
    });

    createdCircleId = circle.id;

  } catch (err) {
    console.error("CreateCircle Error:", err);
    throw new Error(
      JSON.stringify({ general: "An unexpected error occurred. Please try again." })
    );
  }

  redirect(`/hub/circle/${createdCircleId}`);
}
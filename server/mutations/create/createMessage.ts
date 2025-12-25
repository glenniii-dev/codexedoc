"use server";

import { db } from "@/server/db/db";
import { messages, threads } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { getCurrentUser } from "@/utils/getCurrentUser";
import { uploadImage } from "@/lib/r2";
import { revalidatePath } from "next/cache";

export async function createMessage(threadId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const text = (formData.get("text") as string)?.trim() ?? "";
  const file = formData.get("image") as File | null;
  const circleId = formData.get("circleId") as string;

  let imageUrl = "";

  if (file && file.size > 0) {
    try {
      imageUrl = await uploadImage(file, "messages");
    } catch (error) {
      console.error("Image upload failed:", error);
      throw new Error("Failed to upload image");
    }
  }
  // Require at least text or image
  if (!text && !imageUrl) {
    throw new Error("Message must contain text or an image");
  }

  const [msg] = await db
    .insert(messages)
    .values({
      userId: user.id,
      message: text,
      image: imageUrl || null,
    })
    .returning();

  if (!msg) throw new Error("Failed to create message");

  // Append message ID to thread's messageIds array
  await db
    .update(threads)
    .set({
      messageIds: sql`${threads.messageIds} || ARRAY[${msg.id}]::uuid[]`,
    })
    .where(eq(threads.id, threadId));

  revalidatePath(`/circles/${circleId}`);

  return {
    id: msg.id,
    userId: msg.userId,
    message: msg.message,
    image: msg.image,
    timestamp: msg.timestamp,
  };
}
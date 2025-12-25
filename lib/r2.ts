"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// R2 client
const client = new S3Client({
  endpoint: process.env.R2_ENDPOINT,
  region: "auto",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/**
 * Uploads an image to R2 and returns its public URL
 */
export async function uploadImage(file: File | Blob, folder: string) {
  // Ensure the file has a valid name
  const originalName = (file as File).name || "image.png";
  const fileExtension = originalName.split(".").pop()?.toLowerCase() || "png";

  // Correct MIME type
  const mimeType =
    file.type || (fileExtension === "jpg" ? "image/jpeg" : `image/${fileExtension}`);

  // Generate key using proper extension
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

  // Upload to R2
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    ACL: "public-read",
  });

  try {
    await client.send(command);
    return `${process.env.R2_PUBLIC_URL}/${key}`;
  } catch (error) {
    console.error("R2 upload failed:", error);
    throw error; // Important: re-throw so createMessage catches it
  }

}
"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { db } from "@/server/db/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET is missing");

export async function getCurrentUser() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      username: string;
    };

    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!result.length) return null;

    const {
      password,
      securityQuestionOne,
      securityAnswerOne,
      securityQuestionTwo,
      securityAnswerTwo,
      securityCode,
      ...user
    } = result[0];

    return user;
  } catch {
    redirect("/sign-in");
  }
}


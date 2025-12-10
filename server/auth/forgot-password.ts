"use server";

import { db } from "../db/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in your environment variables");

export async function forgotPassword(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const username = (formData.get("username") as string)?.trim();
  const securityCode = (formData.get("securityCode") as string)?.trim();
  const securityQuestionOne = formData.get("securityQuestionOne") as string;
  const securityAnswerOne = (formData.get("securityAnswerOne") as string)?.trim();
  const securityQuestionTwo = formData.get("securityQuestionTwo") as string;
  const securityAnswerTwo = (formData.get("securityAnswerTwo") as string)?.trim();

  const errors: Record<string, string> = {};

  // Validate inputs
  if (!name) errors.name = "Name is required";
  if (!username) errors.username = "Username is required";
  if (!securityCode) errors.securityCode = "Security code is required";
  if (!securityAnswerOne) errors.securityAnswerOne = "Answer 1 is required";
  if (!securityAnswerTwo) errors.securityAnswerTwo = "Answer 2 is required";

  if (Object.keys(errors).length > 0) {
    throw new Error(JSON.stringify(errors));
  }

  // Find user
  const user = await db.select().from(users).where(eq(users.username, username.toLowerCase())).limit(1);
  if (!user || user.length === 0) {
    throw new Error(JSON.stringify({ username: "Username not found" }));
  }

  const dbUser = user[0];

  // Check name
  if (name.toLowerCase() !== dbUser.name) {
    throw new Error(JSON.stringify({ name: "Name does not match our records" }));
  }

  // Check security code
  const securityCodeMatch = await bcrypt.compare(securityCode, dbUser.securityCode);
  if (!securityCodeMatch) {
    throw new Error(JSON.stringify({ securityCode: "Invalid security code" }));
  }

  // Check security answers
  const answerOneMatch = await bcrypt.compare(securityAnswerOne, dbUser.securityAnswerOne);
  const securityQuestionOneMatch = securityQuestionOne === dbUser.securityQuestionOne;
  if (!answerOneMatch || !securityQuestionOneMatch) {
    errors.securityAnswerOne = "Incorrect question or answer";
  }

  const answerTwoMatch = await bcrypt.compare(securityAnswerTwo, dbUser.securityAnswerTwo);
  const securityQuestionTwoMatch = securityQuestionTwo === dbUser.securityQuestionTwo;
  if (!answerTwoMatch || !securityQuestionTwoMatch) {
    errors.securityAnswerTwo = "Incorrect question or answer";
  }

  if (Object.keys(errors).length > 0) {
    throw new Error(JSON.stringify(errors));
  }

  // Create signed JWT token
  const token = jwt.sign(
    { userId: dbUser.id, username: dbUser.username },
    JWT_SECRET!,
    { expiresIn: "7d" } // token valid for 7 days
  );

  // Set HTTP-only cookie
  const cookiesPromise = cookies();
  const cookiesObject = await cookiesPromise; // Await the Promise and get the resolved value
  cookiesObject.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  });

  return { success: true, userId: dbUser.id };
}
"use server";

import { db } from "../db/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function signUp(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const securityQuestionOne = formData.get("securityQuestionOne") as string;
  const securityAnswerOne = (formData.get("securityAnswerOne") as string)?.trim();
  const securityQuestionTwo = formData.get("securityQuestionTwo") as string;
  const securityAnswerTwo = (formData.get("securityAnswerTwo") as string)?.trim();

  const securityCode = (formData.get("securityCode") as string)?.trim();

  // Collect errors
  const errors: Record<string, string> = {};

  if (!name || name.length < 1) {
    errors.name = "Name is required";
  }

  if (!username || username.length < 3) {
    errors.username = "Username must be at least 3 characters";
  }

  if (!password || password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (!securityAnswerOne || securityAnswerOne.length < 2) {
    errors.securityAnswerOne = "Answer for question 1 is required";
  }

  if (!securityAnswerTwo || securityAnswerTwo.length < 2) {
    errors.securityAnswerTwo = "Answer for question 2 is required";
  }

  if (!securityCode || securityCode.length < 12) {
    errors.securityCode = "Security code must be at least 12 characters";
  }

  // If there are any validation errors, throw them
  if (Object.keys(errors).length > 0) {
    throw new Error(JSON.stringify(errors));
  }

  // Check if username is taken
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.username, username.toLowerCase()))
    .limit(1);

  if (existing.length > 0) {
    throw new Error(JSON.stringify({ username: "Username is already taken" }));
  }

  // Hash everything securely
  const hashedPassword = await bcrypt.hash(password, 12);
  const hashedAnswerOne = await bcrypt.hash(securityAnswerOne, 12);
  const hashedAnswerTwo = await bcrypt.hash(securityAnswerTwo, 12);
  const hashedSecurityCode = await bcrypt.hash(securityCode, 12);

  // Insert new user into the database
  try {
    await db.insert(users).values({
      name: name.toLowerCase(),
      username: username.toLowerCase(),
      password: hashedPassword,
      securityQuestionOne,
      securityAnswerOne: hashedAnswerOne,
      securityQuestionTwo,
      securityAnswerTwo: hashedAnswerTwo,
      securityCode: hashedSecurityCode,
    });

    revalidatePath("/sign-in");
    return { success: true, message: "Account created successfully. You can now sign in" };
  } catch (error) {
    throw new Error(JSON.stringify({ general: "An unexpected error occurred. Please try again." }));
  }
}
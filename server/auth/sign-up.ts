"use server";

import { db } from "../db/db";
import { users, userCodex } from "../db/schema";
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

  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Collect errors
  const errors: Record<string, string> = {};

  if (!name || name.length < 1) errors.name = "Name is required";
  if (!username || username.length < 3) errors.username = "Username must be at least 3 characters";
  else if (username.length > 20) errors.username = "Username must be less than 20 characters";
  else if (!usernameRegex.test(username)) errors.username = "Only letters, numbers, hyphens and underscores allowed";

  if (!password || password.length < 8) errors.password = "Password must be at least 8 characters";
  else if (!passwordRegex.test(password)) errors.password = "Password must contain uppercase, lowercase, number & symbol";
  if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";

  if (!securityAnswerOne || securityAnswerOne.length < 2) errors.securityAnswerOne = "Answer for question 1 is required";
  if (!securityAnswerTwo || securityAnswerTwo.length < 2) errors.securityAnswerTwo = "Answer for question 2 is required";

  if (!securityCode || securityCode.length < 12) errors.securityCode = "Security code must be at least 12 characters";

  if (Object.keys(errors).length > 0) throw new Error(JSON.stringify(errors));

  // Check if username is taken
  const existing = await db.select().from(users).where(eq(users.username, username.toLowerCase())).limit(1);
  if (existing.length > 0) throw new Error(JSON.stringify({ username: "Username is already taken" }));

  // Hash everything
  const hashedPassword = await bcrypt.hash(password, 12);
  const hashedAnswerOne = await bcrypt.hash(securityAnswerOne, 12);
  const hashedAnswerTwo = await bcrypt.hash(securityAnswerTwo, 12);
  const hashedSecurityCode = await bcrypt.hash(securityCode, 12);

  try {
    // Insert new user and get the inserted ID
    const [newUser] = await db.insert(users).values({
      name: name.toLowerCase(),
      username: username.toLowerCase(),
      password: hashedPassword,
      securityQuestionOne,
      securityAnswerOne: hashedAnswerOne,
      securityQuestionTwo,
      securityAnswerTwo: hashedAnswerTwo,
      securityCode: hashedSecurityCode,
    }).returning({ id: users.id }); // <-- returning inserted ID

    // Create a codex for the new user
    await db.insert(userCodex).values({
      userId: newUser.id,
      pages: [], // start with empty pages
    });

    revalidatePath("/sign-in");
    return { success: true, message: "Account created successfully. You can now sign in" };
  } catch (error) {
    throw new Error(JSON.stringify({ general: "An unexpected error occurred. Please try again." }));
  }
}
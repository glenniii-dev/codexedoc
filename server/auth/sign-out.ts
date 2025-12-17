// app/actions/signOut.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signOut() {
  const cookiesStore = await cookies();

  // Delete the auth_token cookie
  cookiesStore.set({
    name: "auth_token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0, // expire immediately
  });

  // Redirect to the current page (refresh)
  redirect("/");
}

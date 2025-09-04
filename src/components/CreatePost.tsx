"use client";

import { useUser } from "@clerk/nextjs";

export default function CreatePost() {
  const {user} = useUser();
  return (
    <div>CreatePost</div>
  )
}

// TIME 1:50:23

"use client"

import { useState } from "react";
import { toggleFollow } from "@/actions/user.action";
import { toast } from "react-hot-toast";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";

export default function FollowButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    setIsLoading(true);

    try {
      await toggleFollow(userId)
      toast.success("User follow successfully");
    } catch (error) {
      toast.error("Failed to follow user");
    }
  }

  return (
    <Button
    size={"sm"}
    variant={"secondary"}
    onClick={handleFollow}
    disabled={isLoading}
    className="w-20"
    >
      {isLoading ? <Loader2Icon className="size-4 animate-spin" /> : "Follow"}
    </Button>
  )
}
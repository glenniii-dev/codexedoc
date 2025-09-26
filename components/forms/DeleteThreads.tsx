"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";

import { deleteThread } from "@/lib/actions/thread.actions";

interface Props {
  threadId: string;
  currentUserId: string;
  authorId: string;
  parentId: string | null;
  isComment?: boolean;
}

function DeleteThread({
  threadId,
  currentUserId,
  authorId,
  parentId,
  isComment,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  if (currentUserId !== authorId || pathname === "/") return null;

  async function handleDelete() {
    try {
      setLoading(true);
      await deleteThread(JSON.parse(threadId), pathname);
      // After deletion, navigate home if this wasn't a comment within a parent
      if (!parentId || !isComment) {
        router.push("/");
      }
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  return (
    <div className="relative inline-flex items-center">
      <Image
        src="/assets/delete.svg"
        alt="delete"
        width={18}
        height={18}
        className="cursor-pointer object-contain ml-3"
        onClick={() => setConfirming(true)}
      />

      {confirming && (
        <div className="absolute z-10 right-0 mt-8 w-48 bg-white border rounded-md shadow-md p-2">
          <p className="text-sm text-gray-700 mb-2">Are you sure you want to delete?</p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-2 py-1 text-sm text-gray-700 rounded hover:bg-gray-100"
              onClick={() => setConfirming(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-2 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeleteThread;
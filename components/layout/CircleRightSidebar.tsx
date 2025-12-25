"use client";

import { FaHashtag, FaArrowLeft, FaCircleUser, FaPaperPlane, FaImage } from "react-icons/fa6";
import Image from "next/image";
import Circle from "@/types/Circle";
import { useRef, useState } from "react";
import { createMessage } from "@/server/mutations/create/createMessage";
import imageCompression from "browser-image-compression";
import { useRouter } from "next/navigation";

interface RightThreadProps {
  circleData: Circle;
  setCircleData: React.Dispatch<React.SetStateAction<Circle>>;
  selectedThreadId: string | null;
  setSelectedThreadId: (id: string | null) => void;
  currentUserId?: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function RightThread({
  circleData,
  setCircleData,
  selectedThreadId,
  setSelectedThreadId,
  currentUserId,
  messagesEndRef,
}: RightThreadProps) {
  const [messageText, setMessageText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [compressedImageFile, setCompressedImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const activeThread = circleData.threads.find((t) => t.id === selectedThreadId);
  const activeMessages = activeThread
    ? circleData.messages.filter((m) => activeThread.messageIds.includes(m.id))
    : [];

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedBlob = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
      });

      const compressedFile = new File([compressedBlob], file.name, {
        type: file.type,
      });

      setCompressedImageFile(compressedFile);
      setImagePreview(URL.createObjectURL(compressedFile));
    } catch (error) {
      console.error("Image compression failed:", error);
      setCompressedImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (formData: FormData) => {
    if (!selectedThreadId) return;

    formData.append("text", messageText);
    formData.append("circleId", circleData.id);

    if (compressedImageFile) {
      formData.append("image", compressedImageFile);
    }

    try {
      const newMsg = await createMessage(selectedThreadId, formData);

      // Optimistic update — now with proper typing
      setCircleData((prev: Circle) => ({
        ...prev,
        messages: [...prev.messages, newMsg],
        threads: prev.threads.map((t) =>
          t.id === selectedThreadId
            ? { ...t, messageIds: [...t.messageIds, newMsg.id] }
            : t
        ),
      }));

      console.log("Message sent:", newMsg);

      // Reset form
      setMessageText("");
      setImagePreview(null);
      setCompressedImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } catch (error) {
      console.error("Failed to send message:", error);
      // You could add a toast notification here
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setCompressedImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main
      className={`
        md:border-t md:border-b md:border-white/20 md:flex-1 md:relative
        absolute inset-0 z-10 flex flex-col bg-background/30
        transition-transform duration-300 ease-in-out
        ${
          selectedThreadId !== null
            ? "translate-x-0"
            : "translate-x-full opacity-0 invisible w-0 md:translate-x-0 md:opacity-100 md:visible md:w-auto"
        }
      `}
    >
      {/* MOBILE HEADER */}
      <div className="p-4 border-b border-white/20 flex items-center gap-3 md:hidden">
        <button
          onClick={() => setSelectedThreadId(null)}
          className="p-1 rounded-lg hover:bg-background/40"
        >
          <FaArrowLeft className="text-lg" />
        </button>
        <FaHashtag />
        <h2 className="font-bold">{activeThread?.name || "Select a thread"}</h2>
      </div>

      {/* DESKTOP HEADER */}
      <div className="px-6 py-5 border-b border-white/20 items-center gap-2 hidden md:flex">
        <FaHashtag />
        <h2 className="font-bold">{activeThread?.name || "Select a thread"}</h2>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeMessages.map((m) => {
          const user = circleData.members.find((u) => u.id === m.userId);
          if (!user) return null;

          const isMe = m.userId === currentUserId;
          const timestamp = new Date(m.timestamp);
          const formatted = new Intl.DateTimeFormat("en-US", {
            dateStyle: "short",
            timeStyle: "short",
          }).format(timestamp);

          return (
            <div
              key={m.id}
              className="max-w-xl flex flex-row items-start gap-3"
            >
              {/* Avatar */}
              {user.image ? (
                <Image
                  width={40}
                  height={40}
                  src={user.image}
                  alt={user.name}
                  className="shrink-0 w-10 h-10 rounded-full border border-white/20 mr-3 p-1"
                  unoptimized
                />
              ) : (
                <FaCircleUser
                  size={40}
                  className="shrink-0 mr-3 text-primary"
                />
              )}

              {/* Message Content */}
              <div className="flex flex-col min-w-0 max-w-full">
                <div className="text-xs opacity-70 mb-1 capitalize flex flex-row gap-2 items-center">
                  <p>{user.name || "User"}</p>
                  <p className="text-xs opacity-50">{formatted}</p>
                </div>

                <div
                  className="
                    inline-block
                    w-fit
                    max-w-md
                    rounded-2xl
                    overflow-hidden
                    bg-transparent
                    border
                    border-white/20
                  "
                >
                  {/* Text */}
                  {m.message && (
                    <p className="px-3 py-2 text-white whitespace-pre-wrap wrap-break-words">
                      {m.message}
                    </p>
                  )}

                  {/* Image */}
                  {m.image && (
                    <Image
                      src={m.image}
                      alt={m.message || "Message Image"}
                      width={800}
                      height={600}
                      className="w-full max-h-96 object-contain"
                      unoptimized
                    />
                  )}

                  {/* Fallback */}
                  {!m.message && !m.image && (
                    <p className="px-4 py-3 text-white/50 italic">Empty message</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* COMPOSER */}
      {selectedThreadId && (
        <div className="p-4 border-t border-white/20 bg-background/50">
          <form action={handleSubmit}>
            {/* Preview */}
            {imagePreview && (
              <div className="mb-4 relative inline-block max-w-sm">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={400}
                  height={400}
                  className="rounded-xl max-h-64 object-contain border border-white/20"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition"
                >
                  ×
                </button>
              </div>
            )}

            <div className="flex gap-3 items-center">
              <label className="cursor-pointer bg-white/10 hover:bg-white/20 rounded-xl p-3.5 transition">
                <input
                  ref={fileInputRef}
                  type="file"
                  name="image"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <FaImage size={20} />
              </label>

              <textarea
                name="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Message..."
                rows={1}
                className="flex-1 resize-none bg-transparent border border-white/20 rounded-xl px-4 py-3 outline-none text-white placeholder-gray-400 min-h-12 max-h-40 overflow-y-auto"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if ((messageText.trim() || imagePreview) && e.currentTarget.form) {
                      e.currentTarget.form.requestSubmit();
                    }
                  }
                }}
              />

              <button
                type="submit"
                disabled={!messageText.trim() && !imagePreview}
                className="bg-gradient hover:opacity-90 disabled:opacity-50 rounded-xl p-3.5 transition"
              >
                <FaPaperPlane className="text-lg" />
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
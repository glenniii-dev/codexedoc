"use client";
import Circle from "@/types/Circle";
import { useState, useRef, useEffect } from "react";
import {
  FaBook,
  FaHashtag,
  FaUsers,
  FaPlus,
  FaPen,
  FaTrash,
  FaPaperPlane,
  FaCircleUser,
  FaArrowLeft,
} from "react-icons/fa6";
import { FaArrowsAlt, FaArrowUp, FaArrowDown } from "react-icons/fa";
/* SERVER ACTIONS */
import { createDomain } from "@/server/mutations/create/createDomain";
import { createThread } from "@/server/mutations/create/createThread";
import { deleteDomain } from "@/server/mutations/delete/deleteDomain";
import { deleteThread } from "@/server/mutations/delete/deleteThread";
import { renameDomain } from "@/server/mutations/update/updateDomain";
import { renameThread } from "@/server/mutations/update/updateThread";
import { reorderDomains } from "@/server/mutations/update/updateDomain";
import { reorderThreads } from "@/server/mutations/update/updateThread";
import { createMessage } from "@/server/mutations/create/createMessage";
import Image from "next/image";

interface CircleClientProps {
  circle: Circle;
  currentUserId?: string;
}

type OwnerMode = "add" | "delete" | "edit" | "rearrange" | null;
type ModalType = "add" | "delete" | "edit";

export default function CircleClient({ circle, currentUserId }: CircleClientProps) {
  const [circleData, setCircleData] = useState(circle);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [activeOwnerMode, setActiveOwnerMode] = useState<OwnerMode>(null);
  const [messageText, setMessageText] = useState("");
  const [modal, setModal] = useState<{
    type: ModalType;
    payload: any;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isOwner = circle.ownerId === currentUserId;

  /* ================= SAVE REORDER ================= */
  useEffect(() => {
    if (activeOwnerMode !== "rearrange") {
      reorderDomains(circle.id, circleData.domains.map(d => d.id));
      circleData.domains.forEach(d =>
        reorderThreads(d.id, d.threadIds)
      );
    }
  }, [activeOwnerMode]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [circleData.messages, selectedThreadId]);

  /* ================= ADD ================= */
  const confirmAdd = async (name: string) => {
    if (!modal) return;
    if (modal.payload.type === "domain") {
      const domain = await createDomain(circle.id, name);
      setCircleData(prev => ({
        ...prev,
        domains: [...prev.domains, domain],
      }));
    }
    if (modal.payload.type === "thread") {
      const { domainId } = modal.payload;
      const thread = await createThread(domainId, name, circle.id);
      setCircleData(prev => ({
        ...prev,
        threads: [...prev.threads, thread],
        domains: prev.domains.map(d =>
          d.id === domainId
            ? { ...d, threadIds: [...d.threadIds, thread.id] }
            : d
        ),
      }));
    }
    setModal(null);
  };

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    if (!modal) return;
    if (modal.payload.type === "domain") {
      await deleteDomain(circle.id, modal.payload.domainId);
      setCircleData(prev => ({
        ...prev,
        domains: prev.domains.filter(d => d.id !== modal.payload.domainId),
      }));
    }
    if (modal.payload.type === "thread") {
      const { domainId, threadId } = modal.payload;
      await deleteThread(circle.id, domainId, threadId);
      setCircleData(prev => ({
        ...prev,
        threads: prev.threads.filter(t => t.id !== threadId),
        domains: prev.domains.map(d =>
          d.id === domainId
            ? { ...d, threadIds: d.threadIds.filter(id => id !== threadId) }
            : d
        ),
      }));
    }
    setModal(null);
  };

  /* ================= EDIT ================= */
  const confirmEdit = async (name: string) => {
    if (!modal) return;
    if (modal.payload.type === "domain") {
      await renameDomain(modal.payload.domainId, name);
      setCircleData(prev => ({
        ...prev,
        domains: prev.domains.map(d =>
          d.id === modal.payload.domainId ? { ...d, name } : d
        ),
      }));
    }
    if (modal.payload.type === "thread") {
      await renameThread(modal.payload.threadId, name);
      setCircleData(prev => ({
        ...prev,
        threads: prev.threads.map(t =>
          t.id === modal.payload.threadId ? { ...t, name } : t
        ),
      }));
    }
    setModal(null);
  };

  /* ================= REORDER ================= */
  const moveDomain = (index: number, dir: -1 | 1) => {
    const next = [...circleData.domains];
    const target = next[index];
    next.splice(index, 1);
    next.splice(index + dir, 0, target);
    setCircleData({ ...circleData, domains: next });
  };

  const moveThread = (domainId: string, index: number, dir: -1 | 1) => {
    setCircleData(prev => ({
      ...prev,
      domains: prev.domains.map(d => {
        if (d.id !== domainId) return d;
        const ids = [...d.threadIds];
        const t = ids[index];
        ids.splice(index, 1);
        ids.splice(index + dir, 0, t);
        return { ...d, threadIds: ids };
      }),
    }));
  };

  /* ================= MESSAGES ================= */
  const sendMessage = async () => {
    if (!messageText.trim() || !selectedThreadId) return;
    const msg = await createMessage(selectedThreadId, messageText);
    setCircleData(prev => ({
      ...prev,
      messages: [...prev.messages, msg],
      threads: prev.threads.map(t =>
        t.id === selectedThreadId
          ? { ...t, messageIds: [...t.messageIds, msg.id] }
          : t
      ),
    }));
    setMessageText("");
  };

  const activeThread = circleData.threads.find(t => t.id === selectedThreadId);
  const activeMessages = activeThread
    ? circleData.messages.filter(m =>
        activeThread.messageIds.includes(m.id)
      )
    : [];

  /* ================= UI ================= */
  return (
    <section className="flex h-[calc(100vh-40px)] relative">
      {/* ================= MOBILE: LEFT SIDEBAR (domains/threads) ================= */}
      <aside
        className={`
          md:rounded-l-2xl md:border md:border-white/20 md:w-80 md:relative md:translate-x-0
          absolute inset-0 z-20 w-full bg-background/50
          transition-transform duration-300 ease-in-out
          ${selectedThreadId ? "-translate-x-full" : "translate-x-0"}
          overflow-y-auto border-r border-white/20 md:border-r
        `}
      >
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-white/20 flex justify-between">
          <span className="font-bold uppercase">{circleData.name}</span>
          <div className="flex gap-3 opacity-70">
            <FaUsers />
            <FaBook />
          </div>
        </div>

        {/* OWNER BAR */}
        {isOwner && (
          <div className="flex justify-around py-3 border-b border-white/20">
            {(["add", "delete", "edit", "rearrange"] as OwnerMode[]).map(m => (
              <button
                key={m}
                onClick={() =>
                  setActiveOwnerMode(activeOwnerMode === m ? null : m)
                }
                className={`p-2 rounded-lg ${
                  activeOwnerMode === m
                    ? "bg-gradient"
                    : "hover:bg-background/40"
                }`}
              >
                {m === "add" && <FaPlus />}
                {m === "delete" && <FaTrash />}
                {m === "edit" && <FaPen />}
                {m === "rearrange" && <FaArrowsAlt />}
              </button>
            ))}
          </div>
        )}

        {/* DOMAINS */}
        <div className="p-4 space-y-4">
          {circleData.domains.map((domain, dIndex) => (
            <div key={domain.id}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold opacity-70">{domain.name}</span>
                {activeOwnerMode === "edit" && (
                  <FaPen
                    className="cursor-pointer"
                    onClick={() =>
                      setModal({
                        type: "edit",
                        payload: { type: "domain", domainId: domain.id },
                      })
                    }
                  />
                )}
                {activeOwnerMode === "delete" && (
                  <FaTrash
                    className="text-red-400 cursor-pointer"
                    onClick={() =>
                      setModal({
                        type: "delete",
                        payload: { type: "domain", domainId: domain.id },
                      })
                    }
                  />
                )}
                {activeOwnerMode === "rearrange" && (
                  <div className="flex gap-1">
                    {dIndex > 0 && (
                      <FaArrowUp onClick={() => moveDomain(dIndex, -1)} />
                    )}
                    {dIndex < circleData.domains.length - 1 && (
                      <FaArrowDown onClick={() => moveDomain(dIndex, 1)} />
                    )}
                  </div>
                )}
              </div>

              {/* THREADS */}
              <div className="space-y-1">
                {domain.threadIds.map((tid, tIndex) => {
                  const thread = circleData.threads.find(t => t.id === tid);
                  if (!thread) return null;
                  return (
                    <div
                      key={tid}
                      className={`flex justify-between items-center px-3 py-2 rounded-lg
                        ${
                          selectedThreadId === tid
                            ? "bg-gradient font-bold"
                            : "hover:bg-background/40"
                        }`}
                    >
                      <span
                        onClick={() => setSelectedThreadId(tid)}
                        className="flex-1 cursor-pointer"
                      >
                        <FaHashtag className="inline mr-2 opacity-60" />
                        {thread.name}
                      </span>
                      {activeOwnerMode === "edit" && (
                        <FaPen
                          onClick={() =>
                            setModal({
                              type: "edit",
                              payload: { type: "thread", threadId: tid },
                            })
                          }
                        />
                      )}
                      {activeOwnerMode === "delete" && (
                        <FaTrash
                          className="text-red-400"
                          onClick={() =>
                            setModal({
                              type: "delete",
                              payload: {
                                type: "thread",
                                domainId: domain.id,
                                threadId: tid,
                              },
                            })
                          }
                        />
                      )}
                      {activeOwnerMode === "rearrange" && (
                        <div className="flex gap-1">
                          {tIndex > 0 && (
                            <FaArrowUp
                              onClick={() =>
                                moveThread(domain.id, tIndex, -1)
                              }
                            />
                          )}
                          {tIndex < domain.threadIds.length - 1 && (
                            <FaArrowDown
                              onClick={() =>
                                moveThread(domain.id, tIndex, 1)
                              }
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {activeOwnerMode === "add" && (
                  <FaPlus
                    className="ml-3 mt-1 cursor-pointer opacity-70"
                    onClick={() =>
                      setModal({
                        type: "add",
                        payload: { type: "thread", domainId: domain.id },
                      })
                    }
                  />
                )}
              </div>
            </div>
          ))}
          {activeOwnerMode === "add" && (
            <FaPlus
              className="mx-auto cursor-pointer opacity-70"
              onClick={() =>
                setModal({ type: "add", payload: { type: "domain" } })
              }
            />
          )}
        </div>
      </aside>

      {/* ================= MAIN (thread view) ================= */}
      <main
        className={`
          md:border-t md:border-b md:border-white/20 md:flex-1 md:relative
          absolute inset-0 z-10 flex flex-col bg-background/30
          transition-transform duration-300 ease-in-out
          ${selectedThreadId ? "translate-x-0" : "translate-x-full md:translate-x-0"}
        `}
      >
        {/* MOBILE HEADER WITH BACK ARROW */}
        <div className="p-4 border-b border-white/20 flex items-center gap-3 md:hidden">
          <button
            onClick={() => setSelectedThreadId(null)}
            className="p-1 rounded-lg hover:bg-background/40"
          >
            <FaArrowLeft className="text-lg" />
          </button>
          <FaHashtag />
          <h2 className="font-bold">
            {activeThread?.name || "Select a thread"}
          </h2>
        </div>

        {/* DESKTOP HEADER */}
        <div className="px-6 py-5 border-b border-white/20 items-center gap-2 hidden md:flex">
          <FaHashtag />
          <h2 className="font-bold">
            {activeThread?.name || "Select a thread"}
          </h2>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeMessages.map(m => {
            const user = circleData.members.find(u => u.id === m.userId);
            if (!user) return null;
            const isMe = m.userId === currentUserId;
            const timestamp = new Date(m.timestamp);
            const formatted = new Intl.DateTimeFormat("en-US", {
              dateStyle: "short",
              timeStyle: "short",
            }).format(timestamp)
            return (
              <div
                key={m.id}
                className={`max-w-xl flex flex-row items-top ${isMe ? "ml-auto text-right flex-row-reverse" : ""}`}
              >
                {user?.image ? (
                  <Image
                    width={1000}
                    height={1000}
                    src={user?.image}
                    alt={user?.name}
                    className={`shrink-0 w-10 h-10 rounded-full border border-white/20 p-1 ${isMe ? "ml-3" : "mr-3"}`}
                  />
                ) : (
                  <FaCircleUser
                    size={40}
                    className={`shrink-0 border border-white/20 ${isMe ? "ml-3 text-secondary" : "mr-3 text-primary"}`}
                  />
                )}
                <div className="flex flex-col min-w-0">
                  <div className="text-xs mb-1 capitalize">
                    {user?.name || "User"}
                  </div>
                  <div
                    className={`
                      px-4 py-2 rounded-2xl text-white! text-left sm:max-w-100 md:max-w-80 break-words overflow-wrap-anywhere whitespace-pre-wrap
                      ${
                        isMe
                          ? "bg-gradient ml-auto"
                          : "bg-transparent border border-white/20"
                      }
                    `}
                  >
                    {m.message}
                  </div>
                  <div className="text-xs opacity-60 mt-1">
                    {formatted}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* COMPOSER */}
        {selectedThreadId && (
          <div className="p-4 border-t border-white/20 bg-background/50 max-h-40 h-auto">
            <div className="flex gap-3">
              <textarea
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Message..."
                rows={1}
                className="flex-1 resize-none input outline-none break-words overflow-wrap-anywhere whitespace-pre-wrap overflow-y-auto max-h-40 h-auto"
              />
              <button
                onClick={sendMessage}
                className="rounded-lg bg-gradient px-4"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL ================= */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-background/90 p-6 rounded-2xl w-80">
            {(modal.type === "add" || modal.type === "edit") && (
              <>
                <input
                  ref={inputRef}
                  autoFocus
                  className="input w-full mb-4"
                />
                <button
                  className="w-full bg-gradient rounded-lg py-2 font-bold"
                  onClick={() =>
                    inputRef.current &&
                    (modal.type === "add"
                      ? confirmAdd(inputRef.current.value)
                      : confirmEdit(inputRef.current.value))
                  }
                >
                  Confirm
                </button>
              </>
            )}
            {modal.type === "delete" && (
              <>
                <p className="mb-4 text-red-400 text-center">
                  Confirm delete?
                </p>
                <button
                  className="w-full bg-red-500 rounded-lg py-2 font-bold"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
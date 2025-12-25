"use client";
import Circle from "@/types/Circle";
import { useState, useRef, useEffect } from "react";

import { createDomain } from "@/server/mutations/create/createDomain";
import { createThread } from "@/server/mutations/create/createThread";
import { deleteDomain } from "@/server/mutations/delete/deleteDomain";
import { deleteThread } from "@/server/mutations/delete/deleteThread";
import { renameDomain } from "@/server/mutations/update/updateDomain";
import { renameThread } from "@/server/mutations/update/updateThread";
import { reorderDomains } from "@/server/mutations/update/updateDomain";
import { reorderThreads } from "@/server/mutations/update/updateThread";

import LeftSidebar from "../layout/CircleLeftSidebar";
import RightThread from "../layout/CircleRightSidebar";

interface CircleClientProps {
  circle: Circle;
  currentUserId?: string;
}

/* ================= SHARED TYPES ================= */
type OwnerMode = "add" | "delete" | "edit" | "rearrange" | null;
export type ModalType = "add" | "delete" | "edit";

export type ModalPayload =
  | { type: "domain"; domainId?: string }
  | { type: "thread"; domainId: string; threadId?: string };

export default function CircleClient({ circle, currentUserId }: CircleClientProps) {
  const [circleData, setCircleData] = useState(circle);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [activeOwnerMode, setActiveOwnerMode] = useState<OwnerMode>(null);
  const [modal, setModal] = useState<{
    type: ModalType;
    payload: ModalPayload;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const prevOwnerModeRef = useRef<OwnerMode>(null);

  const isOwner = circle.ownerId === currentUserId;

  /* ================= SAVE REORDER ONLY ON EXIT ================= */
  useEffect(() => {
    if (prevOwnerModeRef.current === "rearrange" && activeOwnerMode !== "rearrange") {
      reorderDomains(circle.id, circleData.domains.map((d) => d.id));
      circleData.domains.forEach((d) =>
        reorderThreads(d.id, d.threadIds)
      );
    }
    prevOwnerModeRef.current = activeOwnerMode;
  }, [activeOwnerMode, circle.id, circleData.domains]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [circleData.messages, selectedThreadId]);

  /* ================= ADD ================= */
  const confirmAdd = async (name: string) => {
    if (!modal || !name.trim()) {
      setModal(null);
      return;
    }

    if (modal.payload.type === "domain") {
      const domain = await createDomain(circle.id, name);
      setCircleData((prev) => ({
        ...prev,
        domains: [...prev.domains, domain],
      }));
    } else if (modal.payload.type === "thread") {
      // TypeScript now knows domainId is required on thread
      const { domainId } = modal.payload;
      const thread = await createThread(domainId, name, circle.id);
      setCircleData((prev) => ({
        ...prev,
        threads: [...prev.threads, thread],
        domains: prev.domains.map((d) =>
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

    const { payload } = modal;

    // Domain deletion
    if (payload.type === "domain") {
      if (!payload.domainId) {
        setModal(null);
        return;
      }
      await deleteDomain(circle.id, payload.domainId);
      setCircleData((prev) => ({
        ...prev,
        domains: prev.domains.filter((d) => d.id !== payload.domainId),
      }));
      setModal(null);
      return;
    }

    // Thread deletion — TypeScript now fully narrows to thread branch
    if (payload.type === "thread") {
      if (!payload.domainId || !payload.threadId) {
        setModal(null);
        return;
      }
      await deleteThread(circle.id, payload.domainId, payload.threadId);
      setCircleData((prev) => ({
        ...prev,
        threads: prev.threads.filter((t) => t.id !== payload.threadId),
        domains: prev.domains.map((d) =>
          d.id === payload.domainId
            ? { ...d, threadIds: d.threadIds.filter((id) => id !== payload.threadId) }
            : d
        ),
      }));
      setModal(null);
    }
  };

  /* ================= EDIT ================= */
  const confirmEdit = async (name: string) => {
    if (!modal || !name.trim()) {
      setModal(null);
      return;
    }

    const { payload } = modal;

    // Domain rename
    if (payload.type === "domain") {
      if (!payload.domainId) {
        setModal(null);
        return;
      }
      await renameDomain(payload.domainId, name);
      setCircleData((prev) => ({
        ...prev,
        domains: prev.domains.map((d) =>
          d.id === payload.domainId ? { ...d, name } : d
        ),
      }));
      setModal(null);
      return;
    }

    // Thread rename
    if (payload.type === "thread") {
      if (!payload.threadId) {
        setModal(null);
        return;
      }
      await renameThread(payload.threadId, name);
      setCircleData((prev) => ({
        ...prev,
        threads: prev.threads.map((t) =>
          t.id === payload.threadId ? { ...t, name } : t
        ),
      }));
      setModal(null);
    }
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
    setCircleData((prev) => ({
      ...prev,
      domains: prev.domains.map((d) => {
        if (d.id !== domainId) return d;
        const ids = [...d.threadIds];
        const t = ids[index];
        ids.splice(index, 1);
        ids.splice(index + dir, 0, t);
        return { ...d, threadIds: ids };
      }),
    }));
  };

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="flex h-[calc(100vh-40px)] relative">
      <LeftSidebar
        circleData={circleData}
        isOwner={isOwner}
        activeOwnerMode={activeOwnerMode}
        setActiveOwnerMode={setActiveOwnerMode}
        setModal={setModal}
        moveDomain={moveDomain}
        moveThread={moveThread}
        setSelectedThreadId={setSelectedThreadId}
        selectedThreadId={selectedThreadId}
      />

      <RightThread
        circleData={circleData}
        setCircleData={setCircleData}
        selectedThreadId={selectedThreadId}
        setSelectedThreadId={setSelectedThreadId}
        currentUserId={currentUserId}
        messagesEndRef={messagesEndRef}
      />

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-background/90 p-6 rounded-2xl w-80">
            {(() => {
              const payload = modal.payload;

              return (
                <>
                  {(modal.type === "add" || modal.type === "edit") && (
                    <>
                      <p className="mb-4 text-center capitalize">
                        {modal.type === "add"
                          ? `Enter New ${payload.type}`
                          : `Rename ${payload.type}`}
                      </p>
                      <input
                        ref={inputRef}
                        type="text"
                        autoFocus
                        className="input w-full mb-4 p-2"
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
                      <p className="mb-4 text-red-400 text-center capitalize">
                        Confirm {payload.type} deletion?
                      </p>
                      <p className="mb-4 text-white text-center pb-2 border-b border-red-400">
                        <span className="text-red-500">*</span>THIS ACTION CANNOT BE UNDONE
                        <span className="text-red-500">*</span>
                      </p>
                      <button
                        className="w-full bg-red-500 rounded-lg py-2 font-bold mb-2"
                        onClick={confirmDelete}
                      >
                        Delete
                      </button>
                      <button
                        className="w-full bg-transparent border border-white rounded-lg py-2 font-bold"
                        onClick={() => setModal(null)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </section>
  );
}
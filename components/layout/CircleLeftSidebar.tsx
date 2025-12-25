"use client";
import Circle from "@/types/Circle";
import { FaBook, FaHashtag, FaUsers, FaPlus, FaPen, FaTrash, FaArrowUp, FaArrowDown } from "react-icons/fa6";
import { FaArrowsAlt } from "react-icons/fa";
import type { ModalPayload, ModalType } from "../page/CircleClient";  // Import shared types

type OwnerMode = "add" | "delete" | "edit" | "rearrange" | null;

interface LeftSidebarProps {
  circleData: Circle;
  isOwner: boolean;
  activeOwnerMode: OwnerMode;
  setActiveOwnerMode: (mode: OwnerMode) => void;
  setModal: (modal: { type: ModalType; payload: ModalPayload } | null) => void;
  moveDomain: (index: number, dir: -1 | 1) => void;
  moveThread: (domainId: string, index: number, dir: -1 | 1) => void;
  setSelectedThreadId: (id: string | null) => void;
  selectedThreadId: string | null;
}

export default function LeftSidebar({
  circleData,
  isOwner,
  activeOwnerMode,
  setActiveOwnerMode,
  setModal,
  moveDomain,
  moveThread,
  setSelectedThreadId,
  selectedThreadId,
}: LeftSidebarProps) {
  // ... rest of your component exactly as before (no changes needed below this)
  return (
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

      {/* DOMAINS & THREADS – unchanged */}
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
                        className="cursor-pointer"
                        onClick={() =>
                          setModal({
                            type: "edit",
                            payload: { type: "thread", domainId: domain.id, threadId: tid },
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
  );
}
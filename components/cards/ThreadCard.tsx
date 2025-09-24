"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import DeleteThread from "../forms/DeleteThreads";

interface Props {
  id: string;
  currentUserId?: string | null;
  parentId?: string | null;
  content: string;
  author: {
    name: string;
    image: string;
    id: string;
  };
  community?: {
    id: string;
    name: string;
    image: string;
  } | null;
  createdAt?: string;
  comments?: {
    author: {
      image: string;
    };
  }[];
  isComment?: boolean;
}

export default function ThreadCard(props: Props) {
  const {
    id,
    currentUserId,
    parentId,
    content,
    author,
    createdAt,
    comments = [],
    isComment = false,
  } = props;

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number | null>(null);

  // small helper to format createdAt into a compact relative string
  function timeAgo(iso?: string) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const diff = Date.now() - d.getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `${sec}s`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${day}d`;
    return d.toLocaleDateString();
  }

  const formattedTime = timeAgo(createdAt);

  useEffect(() => {
    let mounted = true;

    async function fetchLikeInfo() {
      try {
        const res = await fetch(`/api/threads/${id}/like`);
        if (!res.ok) return;
        const json = await res.json();
        if (!mounted) return;
        setLikeCount(json.likeCount ?? 0);
        if (json.likedBy && currentUserId) {
          const isLiked = json.likedBy.some((u: any) => (u.id || u._id)?.toString() === currentUserId?.toString());
          setLiked(isLiked);
        }
      } catch (e) {
        // ignore
      }
    }

    fetchLikeInfo();
    return () => { mounted = false; };
  }, [id, currentUserId]);

  const handleLike = async () => {
    const optimisticLiked = !liked;
    setLiked(optimisticLiked);
    setLikeCount((c) => (c ?? 0) + (optimisticLiked ? 1 : -1));

    try {
      const res = await fetch(`/api/threads/${id}/like`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to toggle like');
      const json = await res.json();
      setLikeCount(json.likeCount ?? 0);
      setLiked(!!json.liked);
    } catch (err) {
      setLiked(!optimisticLiked);
      setLikeCount((c) => (c ?? 0) + (optimisticLiked ? -1 : 1));
      console.error('Like toggle failed', err);
    }
  };

  return (
    <article className={`flex w-full flex-col rounded-xl ${isComment ? 'mb-5 px-0 xs:px-7' : 'bg-neutral-950 p-7'}`}>
      <div className="flex items-start justify-between">
        <div className="flex w-full flex-1 flex-row gap-4">
          <div className="flex flex-col items-center">
            <Link href={`/profile/${author?.id}`} className="relative h-11 w-11">
              <Image src={author?.image} alt="profile image" fill className="cursor-pointer rounded-full" unoptimized />
            </Link>
            <div className="relative mt-2 w-0.5 grow rounded-full bg-neutral-900" />
          </div>

          <div className="flex w-full flex-col">
            <Link href={`/profile/${author?.id}`} className="w-fit">
              <h4 className="cursor-pointer text-base font-semibold text-white">
                {author?.name}
              </h4>
            </Link>

            <p className="mt-2 text-sm text-neutral-200">
              <Link href={`/thread/${id}`} className="flex flex-row gap-1">{content}</Link>
            </p>

            <div className={`${isComment ? 'mb-8' : ''} mt-5 flex flex-row gap-3 `}>
              <div className="flex gap-3.5 flex-row text-white items-center">
                <button className="flex flex-row gap-1 items-center" onClick={handleLike}>
                  <Image src={liked ? "/assets/heart-filled.svg" : "/assets/heart-gray.svg"} alt="heart" width={24} height={24} className="cursor-pointer" />
                  <span className="ml-1">{likeCount ?? 0}</span>
                </button>
                <Link href={`/thread/${id}`} className="flex flex-row gap-1">
                  <Image src="/assets/reply.svg" alt="reply" width={24} height={24} className="cursor-pointer" />Reply
                </Link>
              </div>
            </div>

            {isComment && (comments?.length ?? 0) > 0 && (
              <Link href={`/thread/${id}`}>
                <p className="mt-1 text-xs text-neutral-400 font-medium">
                  {comments?.length} repl{(comments?.length ?? 0) > 1 ? "ies" : "y"}
                </p>
              </Link>
            )}
          </div>
          {formattedTime ? (
              <span className="ml-2 text-xs text-neutral-400" title={createdAt}>{formattedTime}</span>
            ) : null}
        </div>

        <DeleteThread
          threadId={JSON.stringify(id)}
          currentUserId={currentUserId ?? ''}
          authorId={author?.id}
          parentId={parentId ?? null}
          isComment={isComment}
        />
      </div>

      {!isComment && (comments?.length ?? 0) > 0 && (
        <div className='ml-1 mt-3 flex items-center gap-2'>
          {comments!.slice(0, 2).map((comment, index) => (
            <Image key={index} src={comment.author.image} alt={`user_${index}`} width={24} height={24} className={`${index !== 0 ? "-ml-5" : ""} rounded-full object-cover`} unoptimized />
          ))}

          <Link href={`/thread/${id}`}>
            <p className='mt-1 text-xs font-medium text-neutral-400'>
              {comments?.length} repl{(comments?.length ?? 0) > 1 ? "ies" : "y"}
            </p>
          </Link>
        </div>
      )}

    </article>
  );
}

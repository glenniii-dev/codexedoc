import Image from "next/image";
import Link from "next/link";

interface Props {
  key: string;
  id: string;
  currentUserId: string;
  parentId: string | null;
  content: string;
  author: {
    name: string;
    image: string;
    id: string;
  }
  community: {
    id: string;
    name: string;
    image: string;
  } | null;
  createdAt: string;
  comments: {
    author: {
      image: string;
    }
  }[];
  isComment?: boolean;
}

export default function ThreadCard({
  id,
  currentUserId,
  parentId,
  content,
  author,
  community,
  createdAt,
  comments,
  isComment
}: Props) {
  return (
    <article className={`flex w-full flex-col rounded-xl ${isComment ? 'mb-5 px-0 xs:px-7' : 'bg-neutral-950 p-7'}`}>
      <div className="flex items-start justify-between">
        <div className="flex w-full flex-1 flex-row gap-4">
          <div className="flex flex-col items-center">
            <Link href={`/profile/${author.id}`} className="relative h-11 w-11">
              <Image 
                src={author.image} alt="profile image" 
                fill 
                className="cursor-pointer rounded-full" 
              />
            </Link>

            <div className="relative mt-2 w-0.5 grow rounded-full bg-neutral-900" />
          </div>

          <div className="flex w-full flex-col">
            <Link href={`/profile/${author.id}`} className="w-fit">
              <h4 className="cursor-pointer text-base font-semibold text-white">{author.name}</h4>
            </Link>

            <p className="mt-2 text-sm text-neutral-200">
              {content}
            </p>

            <div className={`${isComment && 'mb-8'} mt-5 flex flex-row gap-3 `}>
              <div className="flex gap-3.5 flex-row text-white">
                <button className="flex flex-row gap-1">
                  <Image src="/assets/heart-gray.svg" alt="heart" width={24} height={24} className="cursor-pointer" />Like
                </button>
                <Link href={`/thread/${id}`} className="flex flex-row gap-1">
                  <Image src="/assets/reply.svg" alt="reply" width={24} height={24} className="cursor-pointer" />Reply
                </Link>
                {/* <Image src="/assets/repost.svg" alt="repost" width={24} height={24} className="cursor-pointer" />
                <Image src="/assets/share.svg" alt="share" width={24} height={24} className="cursor-pointer" /> */}
              </div>
            </div>

            {isComment && comments.length > 0 && (
              <Link href={`/thread/${id}`}>
                <p className="mt-1 text-xs text-neutral-400 font-medium">
                  {comments.length} replies
                </p>
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

import ThreadCard from "@/components/cards/ThreadCard";
import { fetchThreads } from "@/lib/actions/thread.actions";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
  const result = await fetchThreads(1, 30);
  const user = await currentUser();
  return (
    <div>
      <div className="flex flex-rows items-center">
        <h1 className="text-white text-3xl font-bold text-left">Home</h1>
        <Link href="/create-thread" className="ml-auto px-4 bg-neutral-950 text-neutral-400 rounded hover:bg-neutral-900 transition flex items-center gap-2 font-extrabold">
          New <span className="text-2xl">+</span>
        </Link>
      </div>

      <section className="mt-9 flex flex-col gap-10">
        {result.threads.length === 0 ? (
          <p className="text-center text-base text-neutral-400">No threads found</p>
        ) : (
          <>
            {result.threads.map((thread: any) => (
              <ThreadCard 
                key={thread._id}
                id={thread._id}
                currentUserId={user?.id || ""}
                parentId={thread.parentId}
                content={thread.text}
                author={thread.author}
                community={thread.community}
                createdAt={thread.createdAt}
                comments={thread.children}
              />
            ))}
          </>
        )}
      </section>
    </div>
  );
}

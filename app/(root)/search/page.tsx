import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Searchbar from "@/components/shared/Searchbar";
import ThreadCard from "@/components/cards/ThreadCard";
import { searchThreads } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";

export default async function Page({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect('/onboarding');

  const q = searchParams?.q ?? undefined;
  const page = searchParams?.page ? +searchParams.page : 1;

  const result = await searchThreads(q, page, 25);

  return (
    <section>
      <h1 className="text-3xl font-bold text-white mb-6">Search Threads</h1>

      <Searchbar routeType={'search'} />

      <div className="mt-8 flex flex-col gap-8">
        {result.threads.length === 0 ? (
          <p className="no-result">No results</p>
        ) : (
          result.threads.map((thread: any) => (
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
          ))
        )}
      </div>
    </section>
  );
}

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchUser, getActivity } from "@/lib/actions/user.actions";
import Link from "next/link";
import Image from "next/image";


export default async function Page() {
  const user = await currentUser();
  
  if (!user) return null;
  
  const userInfo = await fetchUser(user.id);

  if (!userInfo?.onboarded) redirect("/onboarding");

  // getActivity - pass the user's external id so the server-side resolver can find the local Mongo user
  const activity = await getActivity(userInfo.id);

  return (
    <section>
      <h1 className="text-3xl font-bold text-white mb-10">Liked</h1>

      <section className="mt-10 flex flex-col gap-5">
        {activity && activity.length > 0 ? (
          <>
            {activity.map((thread: any) => (
              <Link key={thread._id} href={`/thread/${thread._id}`}>
                <article className="flex items-start gap-3 rounded-md bg-neutral-950 px-7 py-4">
                  <Image 
                    src={thread.author?.image || '/logo.png'}
                    alt="Profile Picture"
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                    unoptimized
                  />
                  <div>
                    <p className="text-sm text-white">
                      <span className="mr-1 text-neutral-400">{thread.author?.name}</span>
                    </p>
                    <p className="text-sm text-neutral-300 mt-1 max-w-prose">{thread.text?.slice(0, 200)}</p>
                  </div>
                </article>
              </Link>
            ))}
          </>
        ) : (
          <p>No liked items yet</p>
        )}
      </section>
    </section>
  )
}
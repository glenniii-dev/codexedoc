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

  // getActivity
  const activity = await getActivity(userInfo._id);

  return (
    <section>
      <h1 className="text-3xl font-bold text-white mb-10">Activity</h1>

      <section className="mt-10 flex flex-col gap-5">
        {activity.length > 0 ? (
          <>
            {activity.map((activity) => (
              <Link key={activity._id} href={`/thread/${activity.parentId}`}>
                <article className="flex items-center gap-2 rounded-md bg-neutral-950 px-7 py-4">
                  <Image 
                    src={activity.author.image}
                    alt="Profile Picture"
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                    unoptimized
                  />
                  <p className="text-sm text-white">
                    <span className="mr-1 text-neutral-400">
                      {activity.author.name}
                    </span>{" "}
                    replied to your thread
                  </p>
                </article>
              </Link>  
            ))}
          </>
        ) : (
          <p>No Activity Yet</p>
        )}
      </section>
    </section>
  )
}
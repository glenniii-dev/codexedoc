import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchUser } from "@/lib/actions/user.actions";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { profileTabs } from "@/constants";
import Image from "next/image";
import ThreadsTab from "@/components/shared/ThreadsTab";


export default async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  
  if (!user) return null;
  
  const userInfo = await fetchUser(params.id);
  
  if (!userInfo?.onboarded) redirect("/onboarding");
  
  const userId = userInfo?._id?.toString();

  return (
    <section>
      <ProfileHeader 
        accountId={userInfo.id}
        authUserId={user.id}
        name={userInfo.name}
        username={userInfo.username}
        imgUrl={userInfo.image}
        bio={userInfo.bio}
      />

      <div className="mt-9">
        <div className="w-full">
          {/* <div className="w-full flex min-h-[50px] flex-1 items-center gap-3 bg-neutral-900 text-neutral-400">
              <div className="flex min-h-[50px] flex-1 items-center gap-3 text-neutral-400">
                <Image 
                  src={'/assets/reply.svg'}
                  alt={'reply icon'}
                  width={24}
                  height={24}
                  className="object-contain"
                  unoptimized
                />
                <p className="max-sm:hidden">Threads</p>
                <p className="bg-neutral-400 px-2 py-1 text-[10px] font-medium text-neutral-900">
                  {userInfo?.threads?.length}
                </p>
              </div>
          </div> */}
          {profileTabs.map((tab) => (
            <div key={`content-${tab.label}`} className="w-full text-white">
              <ThreadsTab
                currentUserId={user.id}
                accountId={userInfo.id}
                accountType="User"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
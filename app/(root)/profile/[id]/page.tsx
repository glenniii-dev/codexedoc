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
        <Tabs defaultValue="threads" className="w-full">
          <TabsList className="w-full flex min-h-[50px] flex-1 items-center gap-3 bg-neutral-900 text-neutral-400 data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-400">
            {profileTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className="flex min-h-[50px] flex-1 items-center gap-3 bg-neutral-900 text-neutral-400 data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-400">
                <Image 
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className="object-contain"
                  unoptimized
                />
                <p className="max-sm:hidden">{tab.label}</p>

                {tab.label === "Threads" && (
                  <p className="ml-1 rounded-sm bg-neutral-400 px-2 py-1 text-[10px] font-medium text-neutral-900">
                    {userInfo?.threads?.length}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {profileTabs.map((tab) => (
            <TabsContent key={`content-${tab.label}`} value={tab.value} className="w-full text-white">
              <ThreadsTab
                currentUserId={user.id}
                accountId={userInfo.id}
                accountType="User"
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
import AccountProfile from "@/components/forms/AccountProfile";
import { currentUser } from "@clerk/nextjs/server";
import { fetchUser } from "@/lib/actions/user.actions";

export default async function Page() {
  const user = await currentUser();

  if (!user) return null;
  const userInfo = await fetchUser(user.id);

  const userData = {
    id: user?.id,
    objectId: userInfo?._id,
    username: userInfo?.username || user?.username,
    name: userInfo?.name || user?.firstName || "",
    bio: userInfo?.bio || "",
    image: userInfo?.image || user?.imageUrl
  }
  return (
    <main className="mx-auto flex max-w-3xl flex-col justify-start px-10 py-20">
      <h1 className="text-3xl font-bold text-white">Onboarding</h1>
      <p className="mt-3 text-md text-neutral-50">
        Complete your profile now to use CODEXEDOC
      </p>
      <section className="mt-9 bg-neutral-900 p-10">
        <AccountProfile
          userId={userData.id}
          objectId={userData.objectId}
          name={userData.name}
          bio={userData.bio}
          image={userData.image}
          btnTitle="Submit"
        />
      </section>
    </main>
  )
}

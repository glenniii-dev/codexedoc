import UpdateProfile from "@/components/forms/UpdateProfile";
import { currentUser } from "@clerk/nextjs/server";
import { fetchUser } from "@/lib/actions/user.actions";

export default async function Page() {
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  
  const userData = {
    id: user?.id,
    objectId: userInfo?._id.toString(),
    username: userInfo?.username || user?.username,
    name: userInfo?.name || user?.firstName || "",
    bio: userInfo?.bio || "",
    image: userInfo?.image || user?.imageUrl
  }

  return (
    <main className="mx-auto flex flex-col w-full justify-start px-5 lg:px-10">
      <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
      <section className="mt-9 bg-neutral-900 p-10">
        <UpdateProfile
          userId={userData.id}
          objectId={userData.objectId}
          username={userData.username}
          name={userData.name}
          bio={userData.bio}
          image={userData.image}
          btnTitle="Continue"
        />
      </section>
    </main>
  );
}
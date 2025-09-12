import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchUser } from "@/lib/actions/user.actions";
import PostThread from "@/components/forms/PostThread";

export default async function Page() {
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUser(user.id);

  if (!userInfo?.onboarded) redirect("/onboarding");

  const userId = userInfo?._id?.toString();

  return (
    <>
      <h1 className="text-3xl font-bold text-white">Create Thread</h1>
      <PostThread userId={userId} />
    </>
  )
}

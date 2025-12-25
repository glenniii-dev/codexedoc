export const dynamic = 'force-dynamic';

import CircleClient from "@/components/page/CircleClient";
import { getCircleData } from "@/utils/getCircleData";
import { getCurrentUser } from "@/utils/getCurrentUser";
import { redirect } from "next/navigation";

export default async function CirclePage({ params: paramsPromise }: { params: Promise<{ circleId: string }> }) {
  const params = await paramsPromise;
  const circleId = params.circleId;
  const circle = await getCircleData(circleId);
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!circle) redirect("/not-found");

  return (
    <>
      <CircleClient circle={circle} currentUserId={user.id} />
    </>
  )
}
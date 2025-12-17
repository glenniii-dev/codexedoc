import { getUserSettings } from "@/server/queries/getUserSettings";
import SettingsClient from "@/components/page/SettingsClient";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const user = await getUserSettings();

  if (!user) {
    redirect("/sign-in"); // or /hub
  }

  return <SettingsClient user={user} />;
}
import Hub from "@/components/layout/Hub";
import HubSidebar from "@/components/layout/HubSidebar";
import { getUserCircles } from "@/server/queries/getUserCircles";
import { getCurrentUser } from "@/utils/getCurrentUser";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CODEXEDOC",
  description: "Where ideas come to life.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  if (!user) return null;

  const circles = await getUserCircles(user.id);

  return (
    <main className="w-screen min-h-screen bg-linear-165 from-black via-primary/50 to-secondary">
      <section className="bg-background/80 w-screen min-h-screen flex flex-row">
        <HubSidebar circles={circles} />
        <div className="flex-1 flex flex-col mt-10 md:mt-5 md:mb-5 min-h-0 overflow-y-auto transition-all duration-300">
          {children}
        </div>
      </section>
    </main>
  );
}

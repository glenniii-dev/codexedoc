import { getUserCircles } from "@/server/queries/getUserCircles";
import { getCurrentUser } from "@/utils/getCurrentUser";
import Image from "next/image";
import Link from "next/link";
import { FaGear, FaGlobe, FaMessage, FaPlus } from "react-icons/fa6";

export default async function Hub({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) return;
  const circles = await getUserCircles(user.id);

  return (
    <section className="flex flex-row h-screen min-w-screen">
      {/* Left side: nested 2-column grid */}
      <div className="w-18 md:w-25 flex flex-col items-center h-full py-5">
        <Link href="/hub/" className="bg-gradient rounded-2xl mb-5 h-12 w-12 flex items-center justify-center"><Image src="/codexedoc.png" alt="codexedoc logo" width={1000} height={1000} className="w-10 h-10" /></Link>
        <div className="mb-5 w-13 h-px bg-white/20 rounded-2xl" />
        <div className="w-full flex-1 min-h-0 overflow-y-auto flex flex-col items-center gap-5">
          {circles.map((circle) => (
              <div key={circle.id} className="w-12 h-12 border border-white/20 p-1 flex items-center justify-center rounded-2xl">
                <img src={circle.image} alt={circle.name} width={1000} height={1000} className="w-full h-full" />
              </div>
          ))}
        </div>
        <div className="mt-5 w-12 h-px bg-white/20 rounded-full" />
        <Link href="/hub/create" className="bg-gradient rounded-2xl my-5 w-12 h-12 flex items-center justify-center"><FaPlus size={20} className="text-white" /></Link>
        <Link href="/hub/settings" className="bg-gradient rounded-2xl h-12 w-12 flex items-center justify-center"><FaGear size={20} className="text-white" /></Link>
      </div>
      <div className="flex-1 my-5 p-5 flex flex-col min-h-0 overflow-y-scroll">
        {children}
      </div>
    </section>
  )
}
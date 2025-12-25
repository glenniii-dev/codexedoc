import Circle from "@/types/Circle";
import Image from "next/image";
import Link from "next/link";
import { FaBook, FaGear, FaGlobe, FaHashtag, FaMagnifyingGlass, FaMessage, FaPlus, FaUsers, FaUsersRectangle } from "react-icons/fa6";

export default async function Desktop({ circles }: { circles: Circle[] }) {
  // Handle click make search variable true and cause a popout

  return (
    <section className="hidden lg:flex flex-row h-screen">
      {/* Left side: nested 2-column grid */}
      <div className="w-25 flex flex-col items-center h-full py-5">
        <Link href="hub/messages" className="bg-gradient rounded-2xl mb-5 h-12 w-12 flex items-center justify-center"><FaMessage size={20} className="text-white" /></Link>
        <div className="mb-5 w-13 h-px bg-white/20 rounded-2xl" />
        <div className="w-full flex-1 min-h-0 overflow-y-auto flex flex-col items-center gap-5">
          {circles.map((circle) => (
              <div key={circle.id} className="w-12 h-12 border border-white/20 p-1 flex items-center justify-center rounded-2xl">
                <Image src={circle.image} alt={circle.name} width={1000} height={1000} className="w-full h-full" unoptimized />
              </div>
          ))}
        </div>
        <div className="mt-5 w-12 h-px bg-white/20 rounded-full" />
        <Link href="/create" className="bg-gradient rounded-2xl my-5 w-12 h-12 flex items-center justify-center"><FaPlus size={20} className="text-white" /></Link>
        <Link href="hub/explore" className="bg-gradient rounded-2xl mb-5 h-12 w-12 flex items-center justify-center"><FaGlobe size={20} className="text-white" /></Link>
        <Link href="hub/settings" className="bg-gradient rounded-2xl h-12 w-12 flex items-center justify-center"><FaGear size={20} className="text-white" /></Link>
      </div>
      <div className="w-75 my-5 py-5 flex flex-col rounded-tl-2xl rounded-bl-2xl overflow-y-scroll border-l border-t border-b border-white/20">
        <div className="flex flex-row justify-between px-5 pb-3 border-b border-white/20">
          <button className="text-md font-bold">Circle Name</button>
          <div className="flex flex-row items-center gap-3">
            <button><FaUsers size={20} /></button>
            <button><FaBook size={20} /></button>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex-1 my-5 py-5 flex flex-col min-h-0 overflow-y-scroll border-l border-t border-b border-white/20 bg-background/30">
        <div className="flex flex-row justify-between px-5 pb-3 border-b border-white/20">
          <button className="text-md font-bold flex flex-row items-center gap-2"><FaHashtag size={20} /> Thread Name</button>
          <form className="rounded-2xl flex flex-row items-center gap-3">
            <input type="text" placeholder="Search" className="bg-transparent text-white outline-none" />
            <button><FaMagnifyingGlass size={20} /></button>
          </form>
        </div>
      </div>
    </section>
  )
}
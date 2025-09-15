"use client";

import { sidebarLinks } from "@/constants";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Bottombar() {

  const pathname = usePathname();
  const { userId } = useAuth();

  return (
    <section className="fixed bottom-0 z-10 w-full rounded-t-3xl bg-linear-to-t from-neutral-800 to-black p-4 xs:px-7 md:hidden">
      <div className="flex items-center justify-between gap-3 xs:gap-5">
        {sidebarLinks.map((link) => {
          const isActive = (pathname.includes(link.route) && link.route.length > 1) || pathname === link.route;

          return (
          <Link 
          href={link.label === "Profile" ? `/profile/${userId}` : link.route}
          key={link.label} className={`relative flex flex-col items-center gap-2 rounded-lg p-2 sm:flex-1 sm:px-2 sm:py-2.5 bg-radial from-neutral-800 to-black ${isActive && ' border-[1.5px] border-white'}`}
          >
            <Image
              src={link.imgURL} 
              alt={link.label} 
              width={24} 
              height={24} 
            />

            <p className="text-xs font-medium text-white max-sm:hidden">
              {link.label.split(/\s+/)[0]}
            </p>
          </Link>
          )
        })}
      </div>
    </section>
  )
}
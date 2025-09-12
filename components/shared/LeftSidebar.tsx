"use client";
import { sidebarLinks } from "@/constants"
import { SignedIn, SignOutButton } from "@clerk/nextjs";
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

export default function LeftSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <section className="scrollbar-hidden sticky left-0 top-0 z-20 flex h-screen w-fit flex-col justify-between overflow-auto bg-neutral-950 pt-28 max-md:hidden">
      <div className="flex w-full flex-1 flex-col gap-6 px-6">
        {sidebarLinks.map((link) => {
          const isActive = (pathname.includes(link.route) && link.route.length > 1) || pathname === link.route;

          return (
          <Link 
          href={link.route} 
          key={link.label} className={`relative flex justify-start gap-4 rounded-lg p-4 bg-neutral-950 ${isActive && 'border-[1.5px] border-white'}`}
          >
            <Image
              src={link.imgURL} 
              alt={link.label} 
              width={24} 
              height={24} 
            />

            <p className="text-white max-lg:hidden">
              {link.label}
            </p>
          </Link>
          )
        })}
      </div>
      <div className="mt-10 px-6">
        <SignedIn>
          <SignOutButton signOutOptions={{ redirectUrl: "/sign-in" }}>
            <div className="flex cursor-pointer gap-4 p-4">
              <Image
                src="/assets/logout.svg" alt="logout" width={24} height={24}>
              </Image>

              <p className="text-neutral-50 max-lg:hidden">
                Logout
              </p>
            </div>
          </SignOutButton>
        </SignedIn>
      </div>
    </section>
  )
}

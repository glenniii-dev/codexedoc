import { OrganizationSwitcher, SignedIn, SignOutButton, UserButton } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { dark } from "@clerk/themes";

export default function Topbar() {
  return (
    <nav className="fixed top-0 z-30 flex w-full items-center justify-between bg-neutral-950 px-6 py-3">
      <Link href="/" className="flex item-center gap-4">
        <Image src="/logo.png" alt="logo" width={45} height={45} className="-mt-1" />
        <p className="text-3xl font-bold text-white max-xs:hidden">CODEXEDOC</p>
      </Link>
      
      <div className="flex items-center gap-1">
        <div className="block md:hidden">
          <SignedIn>
            <SignOutButton>
              <div className="flex cursor-pointer">
                <Image
                  src="/assets/logout.svg" alt="logout" width={24} height={24}>

                </Image>
              </div>
            </SignOutButton>
          </SignedIn>
        </div>

        <div className="hidden sm:block mt-[4px] ml-3">
        <OrganizationSwitcher
          appearance={
            {
              baseTheme: dark,
              elements: {
                organizationSwitcherTrigger: "py-2 px-4",
              },
            }
          }
        />
        </div>
        <div className="block min-sm:hidden mt-2 ml-4">
          <UserButton />
        </div>
      </div>
    </nav>
  )
}

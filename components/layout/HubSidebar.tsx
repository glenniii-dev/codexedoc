"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaBars, FaGear, FaPlus } from "react-icons/fa6";
import { usePathname } from "next/navigation";

type Circle = {
  id: string | number;
  name: string;
  image: string;
};

export default function HubSidebar({ circles }: { circles: Circle[] }) {
  const [open, setOpen] = useState(false);

  const pathname = usePathname();

  let currentPage: string | undefined;

  if (pathname.includes("/hub/circle/")) {
    const circleName = circles.filter(c => c.id === pathname.split("/hub/circle/").pop());
    currentPage = circleName[0]?.name;
  } else if (pathname.includes("/hub/")) {
    currentPage = pathname.split("/hub/").pop();
  } else {
    currentPage = "Hub"
  }

  // Close sidebar ONLY on mobile
  const closeOnMobile = () => {
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* Mobile toggle */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="
            md:hidden
            fixed top-0 left-0 z-50
            w-screen h-10
            px-3
            bg-gradient
            flex items-center gap-3
            justify-between
            text-white!
          "
        >
          <FaBars size={18} />
          <span className="text-sm font-medium capitalize">{currentPage}</span>
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`
          sticky top-0 left-0 z-40
          h-screen
          flex flex-col items-center
          overflow-hidden
          transition-all duration-300 ease-in-out
          ${open ? "w-18" : "w-0"}
          md:w-25
          py-5
        `}
      >
        {/* Logo */}
        <Link
          href="/hub/"
          onClick={closeOnMobile}
          className="bg-gradient rounded-2xl mb-5 h-12 w-12 flex items-center justify-center"
        >
          <Image
            src="/codexedoc.png"
            alt="codexedoc logo"
            width={1000}
            height={1000}
            className="w-10 h-10"
          />
        </Link>

        <div className="mb-5 w-13 h-px bg-white/20 rounded-2xl" />

        {/* Circles */}
        <div className="w-full flex-1 min-h-0 overflow-y-auto flex flex-col items-center gap-5">
          {circles.map((circle) => (
            <Link
              key={circle.id}
              href={`/hub/circle/${circle.id}`}
              onClick={closeOnMobile}
              className="w-12 h-12 border border-white/20 p-1 flex items-center justify-center rounded-2xl"
            >
              <img
                src={circle.image}
                alt={circle.name}
                className="w-full h-full rounded-xl"
              />
            </Link>
          ))}
        </div>

        <div className="mt-5 w-12 h-px bg-white/20 rounded-full" />

        <Link
          href="/hub/create"
          onClick={closeOnMobile}
          className="bg-gradient rounded-2xl my-5 w-12 h-12 flex items-center justify-center"
        >
          <FaPlus size={20} className="text-white" />
        </Link>

        <Link
          href="/hub/settings"
          onClick={closeOnMobile}
          className="bg-gradient rounded-2xl h-12 w-12 flex items-center justify-center"
        >
          <FaGear size={20} className="text-white" />
        </Link>
      </aside>
    </>
  );
}
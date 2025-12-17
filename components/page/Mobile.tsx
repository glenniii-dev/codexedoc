import Image from "next/image";
import Link from "next/link";
import { FaGear } from "react-icons/fa6";

export default function Mobile() {
  return (
    <section className="flex lg:hidden flex flex-col">
      <header className="flex items-center justify-between border-b border-white/60 h-20 w-full px-5">
        <div className="flex flex-row items-center gap-2 text-white">
          <Image src="/codexedoc.png" alt="codexedoc logo" width={500} height={500} className="w-10 h-10" />
          <p className="text-2xl font-bold">CODEXEDOC</p>
        </div>
        <Link href="/settings"><FaGear size={30} className="text-white" /></Link>
      </header>
      Mobile
    </section>
  )
}
import { getCurrentUser } from "@/utils/getCurrentUser";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="w-screen h-screen text-white bg-linear-165 from-black via-primary/50 to-secondary">
      <header className="flex items-center justify-between h-30 px-5 sm:px-10 w-screen">
        <div className="flex flex-row items-center gap-2 sm:gap-3">
          <Image src="/codexedoc.png" alt="codexedoc logo" width={500} height={500} className="w-10 h-10 sm:w-12 sm:h-12" />
          <p className="text-2xl sm:text-3xl font-bold">CODEXEDOC</p>
        </div>
        {user ? 
          <Link href="/hub" className="rounded-2xl bg-white text-black px-6 py-2 font-bold hover:opacity-90">HUB</Link> : 
          <Link href="/sign-in" className="rounded-2xl bg-white text-black px-4 py-2 font-bold hover:opacity-90">SIGN IN</Link>
        }
      </header>
      <section className="flex flex-col items-center justify-center text-center mx-auto w-screen py-50 font-bold">
        <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl max-w-150 md:max-w-200 lg:max-w-250 xl:max-w-300 max-sm:px-5">Welcome to CODEXEDOC! Where ideas come to life.</h1>
      </section>
    </main>
  );
}

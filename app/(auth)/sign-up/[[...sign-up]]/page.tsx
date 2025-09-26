import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

export default function Page() {
  return (
    <section className="flex flex-col items-center p-5 md:p-10 bg-[url('/background.jpg')] bg-cover bg-center">
      <div className="flex flex-row items-center p-0 m-0">
        <Image src="/logo.png" alt="Codexedoc Logo" width={1000} height={1000} className="w-25 h-25 mr-2" />
        <h1 className="text-5xl font-bold text-white">CODEXEDOC</h1>
      </div>
      <SignUp forceRedirectUrl={"/onboarding"}/>
    </section>
  );
}
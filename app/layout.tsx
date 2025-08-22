import { Fugaz_One} from "next/font/google";
import { Open_Sans } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { AuthProvider } from "@/context/AuthContext";
import Head from 'next/head'
import Logout from "@/components/Logout";

const openSans = Open_Sans({ subsets: ["latin"] });
const fugazOne = Fugaz_One({ subsets: ["latin"], weight: ['400'] });

export const metadata: Metadata = {
  title: "CODEXEDOC",
  description: "Your Codex",
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
  const header = (
    <header className="p-4 sm:p-8 flex items-center justify-between gap-4 bg-[#f8f8f8] sticky z-100">
      <Link href={'/'}>
      <h1 className={'text-lg sm:text-xl textGradient ' + fugazOne.className}>CODEXEDOC</h1>
      </Link>
      <Logout />
    </header>
  )

  const footer = (
    <footer className="p-4 sm:p-8 grid place-items-center">
      <p className={'text-[#ff8000] ' + fugazOne.className}>© {new Date().getFullYear()} CODEXEDOC. All rights reserved.</p>
      <p className={'text-xs text-center ' + fugazOne.className}>Coded By <a href="https://glenniii.dev/" target="_blank" className="hover:text-[#ff8000]">Glenn Hensley III</a></p>
    </footer>
  )

  return (
    <html lang="en">
      <Head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.0/css/all.min.css" integrity="sha512-DxV+EoADOkOygM4IR9yXP8Sb2qwgidEmeqAEmDKIOfPRQZOWbXCzLC6vjbZyy0vPisbH2SyW27+ddLVCN+OMzQ==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </Head>
      <AuthProvider>
      <body className={'bg-[#F8F8F8] w-full max-w-[1000px] mx-auto text-sm sm:text-base text-[#005247] min-h-screen flex flex-col ' + openSans.className}>
        {header}
        {children}
      </body>
      </AuthProvider>
    </html>
  );
}

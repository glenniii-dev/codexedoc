import { Source_Code_Pro } from "next/font/google";
import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "react-hot-toast";

import Topbar from "@/components/shared/Topbar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import RightSidebar from "@/components/shared/RightSidebar";
import Bottombar from "@/components/shared/Bottombar";
import Head from "next/head";

export const metadata = {
  title: 'CODEXEDOC',
  description: 'A coding social media platform',
}

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
    <html lang="en">
      <Head>
        <meta name="apple-mobile-web-app-title" content="CODEXEDOC" />
      </Head>
      <body
        className={`
          ${sourceCodePro.className} scrollbar-hidden
        `}
      >
        <Toaster position="top-center" />
        <Topbar />

        <main className="flex flex-row">
          <LeftSidebar />
          
          <section className="flex min-h-screen flex-1 flex-col items-center bg-black px-6 pb-10 pt-28 max-md:pb-32 sm:px-10">
            <div className="w-full max-w-4xl">
              {children}
            </div>
          </section>

          {/* <RightSidebar /> */}
        </main>

        <Bottombar />
      </body>
    </html>
    </ClerkProvider>
  );
}

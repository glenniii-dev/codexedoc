import { ClerkProvider } from "@clerk/nextjs"
import { Source_Code_Pro } from 'next/font/google'
import '../globals.css';
import { dark } from "@clerk/themes";
import Head from "next/head";

export const metadata = {
  title: 'CODEXEDOC',
  description: 'A coding social media platform',
}

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
})

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode
}) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en">
        <Head>
          <meta name="apple-mobile-web-app-title" content="CODEXEDOC" />
        </Head>
        <body className={`${sourceCodePro.className} bg-black`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
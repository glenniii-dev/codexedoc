import './globals.css'
import type { Metadata } from 'next'
import { Source_Code_Pro } from 'next/font/google'
import Link from "next/link";

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
});


export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist.',
}
 
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className={`bg-black text-white ${sourceCodePro.className} flex items-center justify-center text-center h-screen flex-col p-10 lg:p-40`}>
        <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold pb-10">404 - Page Not Found</h1>
        <p className="text-lg sm:text-2xl lg:text-3xl">Our dev is too busy applying to jobs that never respond to notice this broken link. Try checking the URL or head back to the <Link href="/" className="underline">homepage</Link>.</p>
      </body>
    </html>
  )
}

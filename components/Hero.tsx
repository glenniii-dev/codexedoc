import React from 'react'
import { Fugaz_One } from "next/font/google";
import { Open_Sans } from "next/font/google";
import CallToAction from './CallToAction';

const openSans = Open_Sans({ subsets: ["latin"] });

const fugazOne = Fugaz_One({ subsets: ["latin"], weight: ['400'] });

export default function Hero() {
  return (
    <div className="py-4 md:py-10 flex flex-col gap-8 sm:gap-10">
      <h1 className={'text-5xl sm:text-6xl md:text-7xl text-center leading-20 w-full mx-auto ' + fugazOne.className}>CODEXEDOC helps you <span className="textGradient">write</span> notes with <span className="textGradient">ease</span>!</h1>
      <p className={'text-lg sm:text-xl md:text-2xl text-center w-full mx-auto max-w-[600px] ' + openSans.className}>Start creating your <span className="font-semibold">codex</span> today!</p>
      <CallToAction />
    </div>
  ) 
}

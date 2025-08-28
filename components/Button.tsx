import React from 'react'

import { Fugaz_One } from "next/font/google";

const fugazOne = Fugaz_One({ subsets: ["latin"], weight: ['400'] });

export default function Button(props: { text: string, dark?: boolean, full?: boolean, small?: boolean, className?: string, clickHandler?: () => void }) {
  const { text, dark, full, small, className, clickHandler } = props
  return (
    <button onClick={clickHandler} className={'rounded-full overflow-hidden duration-200 border-2 border-solid border-[#ff8000] ' + className + (dark ? ' text-white bg-[#ff8000] hover:bg-[#005247] hover:border-[#005247] ' : ' text-[#ff8000] hover:border-[#005247] hover:text-[#005247] ') + (full ? ' grid place-items-center w-full ' : ' ') + (small ? ' px-3 py-1 ' : ' px-6 py-2 sm:px-10 sm:py-3 ')}>
            <p className={'whitespace-nowrap ' + fugazOne.className}>{text}</p>
    </button>
  )
}

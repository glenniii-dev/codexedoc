import React from 'react'

import { Fugaz_One } from "next/font/google";

const fugazOne = Fugaz_One({ subsets: ["latin"], weight: ['400'] });

export default function Button(props: { text: string, dark?: boolean, full?: boolean, clickHandler?: () => void }) {
  const { text, dark, full, clickHandler } = props
  return (
    <button onClick={clickHandler} className={'rounded-full overflow-hidden duration-200 border-2 border-solid border-[#ff8000] ' + (dark ? ' text-white bg-[#ff8000] hover:bg-[#005247] hover:border-[#005247] ' : ' text-[#ff8000] hover:border-[#005247] hover:text-[#005247] ') + (full ? ' grid place-items-center w-full ' : ' ')}>
            <p className={'px-6 sm:px-10 whitespace-nowrap py-2 sm:py-3 ' + fugazOne.className}>{text}</p>
    </button>
  )
}

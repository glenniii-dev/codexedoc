// components/NoteViewer.tsx
import React from 'react';
import { Fugaz_One } from "next/font/google";
import Button from './Button';

const fugazOne = Fugaz_One({ subsets: ["latin"], weight: ['400'] });

interface NoteViewerProps {
  note: { title: string; content: string };
  close: () => void;
}

export default function NoteViewer({ note, close }: NoteViewerProps) {
  return (
    <div className="absolute top-[100px] min-sm:top-[150px] mx-5 left-0 right-0 bottom-0 bg-[#f8f8f8] bg-opacity-30 flex flex-col items-center z-50 overflow-y-auto scrollbar-hidden">
      <div className="max-w-[1000px] w-full mb-5 p-8 bg-white pt-8 mx-auto rounded-lg scrollbar-hidden">
        <h2 className={`font-bold text-xl pb-6 truncate ${fugazOne.className} `}>{note.title}</h2>
        <p className="text-black">{note.content}</p>
        <div className="flex justify-end mt-4">
          <Button
            clickHandler={close}
            text="Close"
            dark={true}
          />
        </div>
      </div>
    </div>
  );
}
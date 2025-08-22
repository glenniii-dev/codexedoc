import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { Fugaz_One} from "next/font/google";
import Button from './Button';

const fugazOne = Fugaz_One({ subsets: ["latin"], weight: ['400'] });

interface Note {
  id?: string;
  title: string;
  content: string;
}

export default function NoteEditor({ note, close }: { note: Note; close: () => void }) {
  const { addNote, updateNote } = useAuth();
  const [title, setTitle] = useState(note.title || "");
  const [content, setContent] = useState(note.content || "");

  const handleSave = async () => {
    if (note.id) {
      await updateNote(note.id, { title, content });
    } else {
      await addNote({ title, content });
    }
    close();
  };

  return (
    <div className="absolute top-[100px] min-sm:top-[150px] mx-5 left-0 right-0 bottom-0 bg-[#f8f8f8] bg-opacity-30 flex flex-col items-center z-50 overflow-y-auto scrollbar-hidden">
      <div className="max-w-[1000px] w-full mb-5 p-8 bg-white pt-8 mx-auto rounded-lg scrollbar-hidden">
        <h2 className={`font-bold text-xl pb-6 truncate ${fugazOne.className} `}>{note.id ? "Edit Note" : "New Note"}</h2>
        <input
          className=" w-full mb-2 p-2 border border-[#005247] rounded focus:outline-[#ff8000]"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          rows={1}
          className="w-full p-2 text-sm border border-[#005247] rounded focus:outline-[#ff8000] scrollbar-hidden"
          style={{ minHeight: '400px' }}
          value={content}
          onChange={e => setContent(e.target.value)}
          onInput={e => {
            const textarea = e.target as HTMLTextAreaElement;
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
          }}
        />
        <div className="flex justify-end mt-4 gap-4">
          <Button text="Save" clickHandler={handleSave} />
          <Button text="Cancel" clickHandler={close} dark={true} />
        </div>
      </div>
    </div>
  );
}
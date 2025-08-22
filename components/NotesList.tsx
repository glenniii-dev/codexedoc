import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import NoteEditor from './NoteEditor';
import NoteViewer from './NoteViewer';
import Loading from './Loading';
import { Fugaz_One } from "next/font/google";
import Button from './Button';

const fugazOne = Fugaz_One({ subsets: ["latin"], weight: ['400'] });

export default function NotesList() {
  const { notes, setNotes, notesLoading, deleteNote, updateNote } = useAuth();
  const [selected, setSelected] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [sortOrder, setSortOrder] = useState('title');

  const filteredNotes = useMemo(() => {
    let sortedNotes = notes;

    switch (sortOrder) {
      case 'title':
        sortedNotes = notes.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'starred':
        sortedNotes = notes.sort((a, b) => {
          if (a.starred && !b.starred) return -1;
          if (!a.starred && b.starred) return 1;
          return a.title.localeCompare(b.title);
        });
        break;
      default:
        break;
    }

    return sortedNotes.filter(note =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [notes, searchQuery, sortOrder]);

  if (notesLoading) return <Loading />;

  const handleDelete = (note: React.SetStateAction<null>) => {
    setConfirmDelete(note);
  };

  const handleConfirmDelete = () => {
    deleteNote(confirmDelete.id);
    setConfirmDelete(null);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  const handleToggleStar = (note: { id: any; title?: string; content?: string; starred?: any; }) => {
    const updatedNote = {
      ...note,
      starred: !note.starred,
      title: note.title || '',
      content: note.content || '',
    };
    updateNote(note.id, updatedNote);
    setNotes((prevNotes) => prevNotes.map((n: { id: string; title: string; content: string; }) => n.id === note.id ? updatedNote : n));
  };

  const handleSortChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setSortOrder(event.target.value);
  };

  if (notesLoading) return <Loading />;

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4 flex-wrap">
        <h1 className={'text-lg sm:text-xl font-bold textGradient ' + fugazOne.className}>Your Codex</h1>
        <div className="flex gap-2 flex-wrap">
          <input
            type="search"
            className="border border-[#005247] w-64 p-2 text-sm text-gray-700 rounded-full focus:border-[#ff8000] focus:outline-[#ff8000]"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Button
            text="New Note"
            clickHandler={() => setSelected({ title: '', content: '' })}
            dark={true}
            small={true}
          />
          <select value={sortOrder} onChange={handleSortChange}>
            <option value="title">Title</option>
            <option value="starred">Starred</option>
          </select>
        </div>
      </div>
      {notes.length === 0 ? (
        <p className="text-gray-500">Start creating your codex by adding a note!</p>
      ) : (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {filteredNotes.map(note => (
          <div key={note.id} className="bg-white shadow rounded p-4 h-40 relative">
          <div className="absolute top-0 right-0 p-2">
            <button onClick={() => handleToggleStar(note)}>
              <i className={`fas fa-star ${note.starred ? 'text-[#ff8000]' : 'text-gray-500'}`}></i>
            </button>
          </div>
            <h2 className={`font-bold text-lg truncate ${fugazOne.className}`}>{note.title}</h2>
            <p className="text-black truncate">{note.content}</p>
            <div className="absolute bottom-0 right-0 p-2 flex gap-2">
              <Button
                text="Edit"
                clickHandler={() => setSelected(note)}
                small={true}
              />
              <Button
                text="View"
                clickHandler={() => setViewer(note)}
                small={true}
              />
              <Button
                text="Delete"
                clickHandler={() => handleDelete(note)}
                dark={true}
                small={true}
              />
            </div>
            {/* ... */}
          </div>
        ))}
      </div> )}
      {selected && (
        <NoteEditor note={selected} close={() => setSelected(null)} />
      )}
      {viewer && (
        <NoteViewer note={viewer} close={() => setViewer(null)} />
      )}
      {confirmDelete && (
        <div className="fixed inset-0 bg-[#f8f8f8] bg-opacity-30 flex items-center justify-center z-50">
          <div className="border border-[#005247] p-6 rounded shadow w-full max-w-[1000px] mx-[20px]">
            <h2 className="font-bold mb-2">Confirm Delete</h2>
            <p>Are you sure you want to delete this note?</p>
            <div className="flex gap-2 mt-4">
              <Button
                text="Yes"
                clickHandler={handleConfirmDelete}
              />
              <Button
                text="No"
                clickHandler={handleCancelDelete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
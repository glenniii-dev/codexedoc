'use client'
import React from 'react'
import Login from "@/components/Login";
import Loading from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";
import Note from './Note';
import SideNav from './SideNav';
import NotesList from "./NotesList";

export default function Dashboard() {

  const { currentUser, loading } = useAuth();

    if (loading) {
      return <Loading />
    }

    if (!currentUser) {
      return <Login />;
    }

  return (
    <div className="flex flex-col flex-1">
      <NotesList />
    </div>
  );
}

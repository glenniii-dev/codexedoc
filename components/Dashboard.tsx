'use client'
import React from 'react'
import Login from "@/components/Login";
import Loading from "@/components/Loading";
import Main from "@/components/Main";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {

  const { currentUser, loading } = useAuth();

    if (loading) {
      return <Loading />
    }

    if (!currentUser) {
      return <Login />;
    }

  return (
    <div className='flex flex-col flex-1'>
      <div>DASHBOARD</div>
    </div>
  )
}

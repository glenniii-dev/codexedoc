'use client'
import React from 'react'
import Button from './Button'
import { useAuth } from '@/context/AuthContext'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function Logout() {
    const { logout, currentUser } = useAuth()
    const pathname = usePathname()

    if (!currentUser) {
      return (
        <a href="mailto:glenniii.dev@gmail.com">
          <Button text="Contact" />
            {/* <button type="button" className="border-2 border-[#005247] text-[#005247] hover:border-[#ff8000] hover:text-[#ff8000] px-4 py-2 rounded-full font-bold">Contact</button> */}
        </a>
      )
    }

    if (pathname === '/') {
        return (
            <a href="mailto:glenniii.dev@gmail.com">
              <Button text="Contact" />
                {/* <button type="button" className="border-2 border-[#005247] text-[#005247] hover:border-[#ff8000] hover:text-[#ff8000] px-4 py-2 rounded-full font-bold">Contact</button> */}
            </a>
        )
    }

    return (
      <Button clickHandler={logout} text="Logout" />
        // <button onClick={logout} type="button" className="border-2 border-[#005247] text-[#005247] hover:border-[#ff8000] hover:text-[#ff8000] px-4 py-2 rounded-full font-bold">Logout</button>
    )
}
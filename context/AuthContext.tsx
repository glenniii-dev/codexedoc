/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { auth, db } from '@/firebase'
import { 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signOut, sendPasswordResetEmail,User 
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import React, { useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react'

interface AuthContextType {
    currentUser: User | null
    userDataObj: Record<string, any> | null
    setUserDataObj: Dispatch<SetStateAction<Record<string, any> | null>>
    signup: (email: string, password: string) => Promise<any>
    login: (email: string, password: string) => Promise<any>
    logout: () => Promise<void>
    loading: boolean
    resetPassword: (email: any) => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [userDataObj, setUserDataObj] = useState<Record<string, any> | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    // AUTH HANDLERS
    function signup(email: string, password: string) {
        return createUserWithEmailAndPassword(auth, email, password)
    }

    function login(email: string, password: string) {
        return signInWithEmailAndPassword(auth, email, password)
    }

    function logout() {
        setUserDataObj(null)
        setCurrentUser(null)
        return signOut(auth)
    }

    function resetPassword(email: string) {
        return sendPasswordResetEmail(auth, email);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async user => {
            try {
                setLoading(true)
                setCurrentUser(user)
                if (!user) {
                    console.log('No User Found')
                    setUserDataObj(null)
                    return
                }

                console.log('Fetching User Data')
                const docRef = doc(db, 'users', user.uid)
                const docSnap = await getDoc(docRef)
                let firebaseData: Record<string, any> = {}
                if (docSnap.exists()) {
                    console.log('Found User Data')
                    firebaseData = docSnap.data()
                }
                setUserDataObj(firebaseData)
            } catch (err: any) {
                console.log(err.message)
            } finally {
                setLoading(false)
            }
        })
        return unsubscribe
    }, [])

    const value: AuthContextType = {
        currentUser,
        userDataObj,
        setUserDataObj,
        signup,
        logout,
        login,
        loading,
        resetPassword
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { auth, db } from '@/firebase'
import { 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signOut, sendPasswordResetEmail,User 
} from 'firebase/auth'
import { doc, getDoc, collection, addDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore'
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
    notes: Array<{ id: string; title: string; content: string; starred?: boolean; }>
    notesLoading: boolean
    addNote: (note: { title: string; content: string }) => Promise<void>
    updateNote: (id: string, updated: { title: string; content: string }) => Promise<void>
    deleteNote: (id: string) => Promise<void>
    setNotes: Dispatch<SetStateAction<Array<{ id: string; title: string; content: string }>>>
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

    // Notes state
    const [notes, setNotes] = useState<Array<{ id: string; title: string; content: string }>>([])
    const [notesLoading, setNotesLoading] = useState<boolean>(true)

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
        setNotes([])
        return signOut(auth)
    }

    function resetPassword(email: string) {
        return sendPasswordResetEmail(auth, email)
    }

    // Fetch user data
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async user => {
            try {
                setLoading(true)
                setCurrentUser(user)
                if (!user) {
                    setUserDataObj(null)
                    setNotes([])
                    return
                }
                const docRef = doc(db, 'users', user.uid)
                const docSnap = await getDoc(docRef)
                let firebaseData: Record<string, any> = {}
                if (docSnap.exists()) {
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

    // Fetch notes for current user
    useEffect(() => {
        if (!currentUser) {
            setNotes([])
            setNotesLoading(false)
            return
        }
        const fetchNotes = async () => {
            setNotesLoading(true)
            try {
                const notesRef = collection(db, 'users', currentUser.uid, 'notes')
                const snapshot = await getDocs(notesRef)
                setNotes(snapshot.docs.map(doc => ({
                id: doc.id,
                title: doc.data().title,
                content: doc.data().content,
                starred: doc.data().starred || false,
                })))
            } catch (error) {
                console.log(error)
                setNotes([])
            } finally {
                setNotesLoading(false)
            }
        }
        fetchNotes()
    }, [currentUser])

    // Notes CRUD
    const addNote = async (note: { title: string; content: string; starred?: boolean }) => {
        if (!currentUser) return
        const notesRef = collection(db, 'users', currentUser.uid, 'notes')
        const docRef = await addDoc(notesRef, { ...note, starred: false })
        setNotes(prev => [...prev, { id: docRef.id, ...note, starred: false }])
    }

    const updateNote = async (id: string, updated: { title: string; content: string; starred?: boolean }) => {
        if (!currentUser) return
        const noteRef = doc(db, 'users', currentUser.uid, 'notes', id)
        await updateDoc(noteRef, updated)
        setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updated } : n))
    }

    const deleteNote = async (id: string) => {
        if (!currentUser) return
        const noteRef = doc(db, 'users', currentUser.uid, 'notes', id)
        await deleteDoc(noteRef)
        setNotes(prev => prev.filter(n => n.id !== id))
    }

    const value: AuthContextType = {
        currentUser,
        userDataObj,
        setUserDataObj,
        signup,
        logout,
        login,
        loading,
        resetPassword,
        notes,
        notesLoading,
        addNote,
        updateNote,
        deleteNote,
        setNotes
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
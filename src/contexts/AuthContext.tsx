import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { observeAuth, signInWithGoogle, signOutUser, signUpWithEmail, signInEmail, resetPassword, db } from '../lib/firebase'

interface AuthContextValue {
  user: User | null
  loading: boolean
  signInGoogle: () => Promise<void>
  signUpEmail: (email: string, password: string) => Promise<void>
  signInEmail: (email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = observeAuth(async (u) => {
      setUser(u)
      setLoading(false)
      if (u) {
        try {
          const userRef = doc(db, 'users', u.uid)
          // We just ensure it exists/update basic info
          await setDoc(userRef, {
            email: u.email,
            lastLogin: new Date().toISOString(),
            displayName: u.displayName || u.email?.split('@')[0] || 'User',
            uid: u.uid
          }, { merge: true })
        } catch (e) {
          console.error('Failed to sync user to db', e)
        }
      }
    })
    return () => unsub()
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    signInGoogle: () => signInWithGoogle(),
    signUpEmail: (email, password) => signUpWithEmail(email, password),
    signInEmail: (email, password) => signInEmail(email, password),
    resetPassword: (email) => resetPassword(email),
    signOut: () => signOutUser(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

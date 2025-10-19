import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { observeAuth, signInGuest, signInWithGoogle, signOutUser, signUpWithEmail, signInEmail, resetPassword } from '../lib/firebase'

interface AuthContextValue {
  user: User | null
  loading: boolean
  signInGoogle: () => Promise<void>
  signInAnon: () => Promise<void>
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
    const unsub = observeAuth(u => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    signInGoogle: () => signInWithGoogle(),
    signInAnon: () => signInGuest(),
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
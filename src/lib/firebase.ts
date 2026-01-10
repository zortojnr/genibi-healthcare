import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, setPersistence, browserLocalPersistence } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: String(import.meta.env.VITE_FIREBASE_API_KEY || ''),
  authDomain: String(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || ''),
  projectId: String(import.meta.env.VITE_FIREBASE_PROJECT_ID || ''),
  storageBucket: String(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || ''),
  messagingSenderId: String(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || ''),
  appId: String(import.meta.env.VITE_FIREBASE_APP_ID || ''),
}

const enabled = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_APP_ID
)

const app = enabled ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : undefined
export const auth = enabled ? getAuth(app!) : undefined as any
export const db = enabled ? getFirestore(app!) : undefined as any
export const storage = enabled ? getStorage(app!) : undefined as any
export const googleProvider = enabled ? new GoogleAuthProvider() : null as any

export const isFirebaseEnabled = enabled

// Ensure persistent sessions so users stay signed in across reloads
if (enabled) {
  setPersistence(auth, browserLocalPersistence).catch(err => console.warn('Failed to set persistence', err))
}

function ensureEnabled() {
  if (!enabled) {
    const err: any = new Error('Firebase not configured')
    err.code = 'app/not-configured'
    throw err
  }
}

export async function signInWithGoogle() {
  ensureEnabled()
  await signInWithPopup(auth, googleProvider)
}

export async function signUpWithEmail(email: string, password: string) {
  ensureEnabled()
  await createUserWithEmailAndPassword(auth, email, password)
}

export async function signInEmail(email: string, password: string) {
  ensureEnabled()
  await signInWithEmailAndPassword(auth, email, password)
}

export async function resetPassword(email: string) {
  ensureEnabled()
  await sendPasswordResetEmail(auth, email)
}

export async function signOutUser() {
  ensureEnabled()
  await signOut(auth)
}

export function observeAuth(callback: (u: User | null) => void) {
  if (!enabled) { callback(null); return () => {} }
  return onAuthStateChanged(auth, callback)
}
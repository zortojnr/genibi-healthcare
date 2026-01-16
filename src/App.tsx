import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import NavBar from './components/NavBar'
import { Suspense, lazy, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from './lib/firebase'

// Eager load critical path
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminLogin from './pages/AdminLogin'

// Lazy load feature modules
const Chat = lazy(() => import('./pages/Chat'))
const Appointments = lazy(() => import('./pages/Appointments'))
const MoodTracker = lazy(() => import('./pages/MoodTracker'))
const Medications = lazy(() => import('./pages/Medications'))
const Library = lazy(() => import('./pages/Library'))
const Profile = lazy(() => import('./pages/Profile'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

import { ADMIN_EMAIL } from './lib/admin'

function LoadingSpinner() {
  return (
    <div className="flex h-[50vh] items-center justify-center text-slate-500 dark:text-slate-400">
      <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  )
}

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
}

function FullAccess({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (user?.isAnonymous) return <Navigate to="/" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setIsAdmin(false)
        return
      }
      
      // Keep backward compatibility
      if (user.email === ADMIN_EMAIL) {
        setIsAdmin(true)
        return
      }

      try {
        const snap = await getDoc(doc(db, 'users', user.uid))
        setIsAdmin(snap.exists() && snap.data()?.role === 'admin')
      } catch (e) {
        console.error('Admin check failed', e)
        setIsAdmin(false)
      }
    }

    if (!loading) {
      checkAdmin()
    }
  }, [user, loading])

  if (loading || isAdmin === null) return <LoadingSpinner />
  if (!user) return <Navigate to="/admin" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  const { user } = useAuth()
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen">
      {user && !isAdminPage && <NavBar />}
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        
        {/* Lazy loaded routes wrapped in Suspense via Protected/AdminRoute */}
        <Route path="/chat" element={<Protected><Chat /></Protected>} />
        <Route path="/library" element={<Protected><Library /></Protected>} />
        <Route path="/appointments" element={<Protected><FullAccess><Appointments /></FullAccess></Protected>} />
        <Route path="/mood" element={<Protected><FullAccess><MoodTracker /></FullAccess></Protected>} />
        <Route path="/medications" element={<Protected><FullAccess><Medications /></FullAccess></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

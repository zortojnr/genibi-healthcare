import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import NavBar from './components/NavBar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Appointments from './pages/Appointments'
import MoodTracker from './pages/MoodTracker'
import Medications from './pages/Medications'
import Vitals from './pages/Vitals'
import Library from './pages/Library'
import Profile from './pages/Profile'
import Referrals from './pages/Referrals'
import Demo from './pages/Demo'
import type { ReactNode } from 'react'

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-6 text-center text-slate-600">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function FullAccess({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (user?.isAnonymous) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      {user && <NavBar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/chat" element={<Protected><Chat /></Protected>} />
        <Route path="/library" element={<Protected><Library /></Protected>} />
        <Route path="/appointments" element={<Protected><FullAccess><Appointments /></FullAccess></Protected>} />
        <Route path="/mood" element={<Protected><FullAccess><MoodTracker /></FullAccess></Protected>} />
        <Route path="/medications" element={<Protected><FullAccess><Medications /></FullAccess></Protected>} />
        <Route path="/vitals" element={<Protected><FullAccess><Vitals /></FullAccess></Protected>} />
        <Route path="/referrals" element={<Protected><Referrals /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/demo" element={<Demo />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

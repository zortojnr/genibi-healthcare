import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

export default function NavBar() {
  const { user, signOut } = useAuth()
  return (
    <div className="sticky top-0 z-40 backdrop-blur bg-white/60 border-b">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="font-semibold text-slate-800">
          GENIBI
        </motion.div>
        <nav className="flex gap-4 text-sm">
          <NavLink className={({isActive}) => `px-2 py-1 rounded ${isActive ? 'text-blue-600' : 'text-slate-600'}`} to="/">Home</NavLink>
          <NavLink className={({isActive}) => `px-2 py-1 rounded ${isActive ? 'text-blue-600' : 'text-slate-600'}`} to="/chat">AI Assistant</NavLink>
          <NavLink className={({isActive}) => `px-2 py-1 rounded ${isActive ? 'text-blue-600' : 'text-slate-600'}`} to="/appointments">Appointments</NavLink>
          <NavLink className={({isActive}) => `px-2 py-1 rounded ${isActive ? 'text-blue-600' : 'text-slate-600'}`} to="/mood">Mood Tracker</NavLink>
          <NavLink className={({isActive}) => `px-2 py-1 rounded ${isActive ? 'text-blue-600' : 'text-slate-600'}`} to="/library">Library</NavLink>
          <NavLink className={({isActive}) => `px-2 py-1 rounded ${isActive ? 'text-blue-600' : 'text-slate-600'}`} to="/profile">Profile</NavLink>
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">{user?.displayName || (user?.isAnonymous ? 'Guest' : '')}</span>
          <button onClick={signOut} className="text-xs px-3 py-1 rounded bg-slate-900 text-white">Sign out</button>
        </div>
      </div>
    </div>
  )
}
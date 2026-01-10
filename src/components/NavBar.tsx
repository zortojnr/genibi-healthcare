import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'

export default function NavBar() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }: { isActive: boolean }) => `block px-3 py-2 rounded ${isActive ? 'text-blue-600' : 'text-slate-700'} hover:text-slate-900`

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/60 border-b">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="font-semibold text-slate-800">
          GENIBI
        </motion.div>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-4 text-sm">
          <NavLink className={linkClass} to="/">Home</NavLink>
          <NavLink className={linkClass} to="/chat">AI Assistant</NavLink>
          <NavLink className={linkClass} to="/appointments">Appointments</NavLink>
          <NavLink className={linkClass} to="/mood">Mood Tracker</NavLink>
          <NavLink className={linkClass} to="/library">Library</NavLink>
          <NavLink className={linkClass} to="/profile">Profile</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm text-slate-600">{user?.displayName || (user?.isAnonymous ? 'Guest' : '')}</span>
          {/* Mobile menu button */}
          <button
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(v => !v)}
            className="md:hidden inline-flex items-center justify-center rounded-md border px-3 py-2 bg-white text-slate-700 hover:bg-slate-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
          </button>
          <button onClick={signOut} className="text-xs px-3 py-2 rounded bg-slate-900 text-white">Sign out</button>
        </div>
      </div>

      {/* Mobile nav panel */}
      {open && (
        <div className="md:hidden border-t bg-white/80">
          <div className="mx-auto max-w-6xl px-4 py-3 grid gap-2 text-sm">
            <NavLink onClick={() => setOpen(false)} className={linkClass as any} to="/">Home</NavLink>
            <NavLink onClick={() => setOpen(false)} className={linkClass as any} to="/chat">AI Assistant</NavLink>
            <NavLink onClick={() => setOpen(false)} className={linkClass as any} to="/appointments">Appointments</NavLink>
            <NavLink onClick={() => setOpen(false)} className={linkClass as any} to="/mood">Mood Tracker</NavLink>
            <NavLink onClick={() => setOpen(false)} className={linkClass as any} to="/library">Library</NavLink>
            <NavLink onClick={() => setOpen(false)} className={linkClass as any} to="/referrals">Referrals</NavLink>
            <NavLink onClick={() => setOpen(false)} className={linkClass as any} to="/profile">Profile</NavLink>
          </div>
        </div>
      )}
    </header>
  )
}
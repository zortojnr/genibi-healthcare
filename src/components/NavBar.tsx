import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export default function NavBar() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const menuRef = useRef<HTMLDivElement>(null)

  const linkClass = ({ isActive }: { isActive: boolean }) => `block px-3 py-2 rounded ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'} hover:text-slate-900 dark:hover:text-white`

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen])

  const links = [
    { to: '/', label: 'Home' },
    { to: '/chat', label: 'AI Assistant' },
    { to: '/appointments', label: 'Appointments' },
    { to: '/mood', label: 'Mood Tracker' },
    { to: '/medications', label: 'Medications' },
    { to: '/library', label: 'Library' },
  ]

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/60 dark:bg-slate-900/60 border-b dark:border-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="font-semibold text-slate-800 dark:text-white">
          GENIBI
        </motion.div>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-4 text-sm">
          <NavLink className={linkClass} to="/">Home</NavLink>
          <NavLink className={linkClass} to="/chat">AI Assistant</NavLink>
          <NavLink className={linkClass} to="/appointments">Appointments</NavLink>
          <NavLink className={linkClass} to="/mood">Mood Tracker</NavLink>
          <NavLink className={linkClass} to="/medications">Medications</NavLink>
          <NavLink className={linkClass} to="/library">Library</NavLink>
          <NavLink className={linkClass} to="/profile">Profile</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            )}
          </button>
          
          <span className="hidden sm:inline text-sm text-slate-600 dark:text-slate-300">{user?.displayName || (user?.isAnonymous ? 'Guest' : '')}</span>
          {/* Mobile menu button */}
          <button
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(v => !v)}
            className="md:hidden inline-flex items-center justify-center rounded-md border px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 dark:border-slate-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div ref={menuRef} className="md:hidden border-t bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm absolute w-full left-0 z-50 shadow-lg animate-in slide-in-from-top-2 duration-200 dark:border-slate-800">
          <div className="flex flex-col p-4 space-y-3">
            {links.map(link => (
              <Link 
                key={link.to} 
                to={link.to} 
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link 
              to="/profile"
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/profile'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Profile
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
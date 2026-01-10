import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const quotes = [
  'Breathe. You are doing the best you can.',
  'Small steps still move you forward.',
  'You are enough, exactly as you are.',
  'Calm minds see clearer paths.',
]

const features = [
  { title: 'AI Chat Assistant', to: '/chat', emoji: '💬', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { title: 'Appointments (CFID)', to: '/appointments', emoji: '📅', color: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { title: 'Medication Tracker', to: '/medications', emoji: '💊', color: 'bg-purple-50 dark:bg-purple-900/20' },
  { title: 'Mood Tracker', to: '/mood', emoji: '😊', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { title: 'E-Library', to: '/library', emoji: '📚', color: 'bg-purple-50 dark:bg-purple-900/20' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const name = user?.displayName || 'Friend'
  const [quoteIndex, setQuoteIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length)
    }, 5000) // 5 seconds for better readability
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-2xl border bg-white/70 dark:bg-slate-900/70 dark:border-slate-800 backdrop-blur p-6 relative overflow-hidden transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Welcome, {name}</h1>
          <a href="tel:+2348060270792" aria-label="Call Support +234 806 027 0792"
             className="inline-flex items-center gap-2 border bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-800 px-3 py-2 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.09 2h3a2 2 0 0 1 2 1.72c.12.81.3 1.6.54 2.36a2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.71-1.08a2 2 0 0 1 2.11-.45c.76.24 1.55.42 2.36.54A2 2 0 0 1 22 16.92z"/></svg>
            <span className="font-medium">Support: +234 806 027 0792</span>
          </a>
        </div>
        
        <div className="mt-4 h-8 relative z-10">
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-slate-600 dark:text-slate-300 italic absolute w-full"
            >
              "{quotes[quoteIndex]}"
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {features.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
            <Link to={f.to} className={`block rounded-xl border dark:border-slate-800 ${f.color} p-5 hover:shadow-sm transition-colors`}>
              <div className="text-3xl">{f.emoji}</div>
              <div className="mt-3 font-medium text-slate-800 dark:text-slate-200">{f.title}</div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
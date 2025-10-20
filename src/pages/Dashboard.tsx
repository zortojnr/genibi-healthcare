import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

const quotes = [
  'Breathe. You are doing the best you can.',
  'Small steps still move you forward.',
  'You are enough, exactly as you are.',
  'Calm minds see clearer paths.',
]

const features = [
  { title: 'AI Chat Assistant', to: '/chat', emoji: '💬', color: 'bg-blue-50' },
  { title: 'Appointments (CFID)', to: '/appointments', emoji: '📅', color: 'bg-mint-50' },
  { title: 'Medication Tracker', to: '/medications', emoji: '💊', color: 'bg-lavender-50' },
  { title: 'Vitals Log', to: '/vitals', emoji: '❤️', color: 'bg-mint-50' },
  { title: 'Mood Tracker', to: '/mood', emoji: '😊', color: 'bg-blue-50' },
  { title: 'E-Library', to: '/library', emoji: '📚', color: 'bg-lavender-50' },
  { title: 'Referrals', to: '/referrals', emoji: '🧑‍🤝‍🧑', color: 'bg-mint-50' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const name = user?.displayName || (user?.isAnonymous ? 'Guest' : 'Friend')
  const quote = quotes[Math.floor(Math.random() * quotes.length)]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-2xl border bg-white/70 backdrop-blur p-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Welcome, {name}</h1>
          <a href="tel:+2348060270792" aria-label="Call Support +234 806 027 0792"
             className="inline-flex items-center gap-2 border bg-white text-slate-800 px-3 py-2 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.09 2h3a2 2 0 0 1 2 1.72c.12.81.3 1.6.54 2.36a2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.71-1.08a2 2 0 0 1 2.11-.45c.76.24 1.55.42 2.36.54A2 2 0 0 1 22 16.92z"/></svg>
            <span className="font-medium">Support: +234 806 027 0792</span>
          </a>
        </div>
        <p className="text-slate-600 mt-2">{quote}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {features.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
            <Link to={f.to} className={`block rounded-xl border ${f.color} p-5 hover:shadow-sm`}>
              <div className="text-3xl">{f.emoji}</div>
              <div className="mt-3 font-medium text-slate-800">{f.title}</div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
import { useEffect, useState } from 'react'
import { addDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'

interface Referral { name: string; type: string; link: string; tags?: string[] }

export default function Referrals() {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [refs, setRefs] = useState<Referral[]>([])

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'referrals'))
        const items: Referral[] = []
        snap.forEach(d => items.push(d.data() as Referral))
        setRefs(items)
      } catch (e) {
        console.error('Failed to load referrals from Firestore', e)
      }
    })()
  }, [])

  async function submitAnonymous() {
    setSaving(true)
    try {
      await addDoc(collection(db, 'referral_contacts'), {
        userId: user?.uid || null,
        message,
        createdAt: new Date().toISOString(),
      })
      setMessage('')
    } catch (e) {
      console.error('Failed to submit contact', e)
    } finally { setSaving(false) }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 transition-colors duration-300">
      <div className="rounded-2xl border dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur p-6 transition-colors duration-300">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Referral Hub</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Connect to psychologists, peer groups, and rehab centers.</p>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {refs.length === 0 ? (
            <div className="col-span-full text-sm text-slate-600 dark:text-slate-400">No referrals available yet.</div>
          ) : (
            refs.map(r => (
              <a key={r.name} href={r.link} target="_blank" className="block rounded-xl border dark:border-slate-600 bg-white dark:bg-slate-700 p-4 hover:shadow-md transition-all dark:hover:bg-slate-600">
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase">{r.type}</div>
                <div className="mt-1 font-medium text-slate-800 dark:text-white">{r.name}</div>
              </a>
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur p-6 mt-8 transition-colors duration-300">
        <h3 className="font-medium text-slate-800 dark:text-white">Anonymous Contact</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">Send a message to initiate a referral anonymously.</p>
        <textarea 
          value={message} 
          onChange={e=>setMessage(e.target.value)} 
          className="mt-3 w-full px-3 py-2 rounded-lg border dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white placeholder-slate-400" 
        />
        <button onClick={submitAnonymous} disabled={saving} className="mt-3 px-4 py-2 rounded-lg bg-mint-500 text-white hover:bg-mint-400 transition-colors">
          {saving?'Sending...':'Send message'}
        </button>
      </div>
    </div>
  )
}
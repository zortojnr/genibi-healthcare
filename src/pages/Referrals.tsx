import { useState } from 'react'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'

const resources = [
  { name: 'Campus Psychologist', type: 'Psychologist', link: 'https://example.com/psychologist' },
  { name: 'Peer Support Group', type: 'Peer Group', link: 'https://example.com/peer' },
  { name: 'Rehab Center', type: 'Rehab', link: 'https://example.com/rehab' },
]

export default function Referrals() {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

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
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-2xl border bg-white/70 backdrop-blur p-6">
        <h2 className="text-xl font-semibold text-slate-800">Referral Hub</h2>
        <p className="text-sm text-slate-600">Connect to psychologists, peer groups, and rehab centers.</p>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map(r => (
            <a key={r.name} href={r.link} target="_blank" className="block rounded-xl border bg-white p-4">
              <div className="text-xs text-slate-500 uppercase">{r.type}</div>
              <div className="mt-1 font-medium text-slate-800">{r.name}</div>
            </a>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-white/70 backdrop-blur p-6 mt-8">
        <h3 className="font-medium text-slate-800">Anonymous Contact</h3>
        <p className="text-sm text-slate-600">Send a message to initiate a referral anonymously.</p>
        <textarea value={message} onChange={e=>setMessage(e.target.value)} className="mt-3 w-full px-3 py-2 rounded-lg border bg-white" />
        <button onClick={submitAnonymous} disabled={saving} className="mt-3 px-4 py-2 rounded-lg bg-mint-500 text-white">{saving?'Sending...':'Send message'}</button>
      </div>
    </div>
  )
}
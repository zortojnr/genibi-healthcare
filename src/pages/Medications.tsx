import { useState } from 'react'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'

export default function Medications() {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [time, setTime] = useState('08:00')
  const [reminder, setReminder] = useState(true)
  const [saving, setSaving] = useState(false)

  async function addMedication() {
    if (!user) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'medications'), {
        userId: user.uid,
        name,
        dosage,
        time,
        reminder,
      })
      setName(''); setDosage('');
    } catch (e) {
      console.error('Medication save failed', e)
    } finally { setSaving(false) }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border bg-white/70 backdrop-blur p-6">
        <h2 className="text-xl font-semibold text-slate-800">Medication Tracker</h2>
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <div>
            <label className="text-sm text-slate-600">Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Dosage</label>
            <input value={dosage} onChange={e=>setDosage(e.target.value)} placeholder="e.g., 1 tablet" className="w-full px-3 py-2 rounded-lg border bg-white" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Reminder time</label>
            <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white" />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input id="reminder" type="checkbox" checked={reminder} onChange={e=>setReminder(e.target.checked)} />
            <label htmlFor="reminder" className="text-sm text-slate-600">Send reminder</label>
          </div>
        </div>
        <button onClick={addMedication} disabled={saving} className="mt-4 px-4 py-2 rounded-lg bg-mint-500 text-white">{saving?'Saving...':'Add medication'}</button>
        <p className="text-xs text-slate-500 mt-3">Reminders can be wired to email/notifications in production.</p>
      </div>
    </div>
  )
}
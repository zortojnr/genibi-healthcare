import { useState } from 'react'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'

export default function Vitals() {
  const { user } = useAuth()
  const [date, setDate] = useState('')
  const [bp, setBp] = useState('')
  const [heartRate, setHeartRate] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  async function saveVitals() {
    if (!user) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'vitals'), {
        userId: user.uid,
        date,
        bp,
        heartRate,
        note: note || undefined,
      })
      setDate(''); setBp(''); setHeartRate(''); setNote('')
    } catch (e) {
      console.error('Vitals save failed', e)
    } finally { setSaving(false) }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border bg-white/70 backdrop-blur p-6">
        <h2 className="text-xl font-semibold text-slate-800">Vitals Log</h2>
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <div>
            <label className="text-sm text-slate-600">Date</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Blood Pressure</label>
            <input value={bp} onChange={e=>setBp(e.target.value)} placeholder="e.g., 120/80" className="w-full px-3 py-2 rounded-lg border bg-white" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Heart Rate</label>
            <input value={heartRate} onChange={e=>setHeartRate(e.target.value)} placeholder="e.g., 72" className="w-full px-3 py-2 rounded-lg border bg-white" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-slate-600">Note</label>
            <textarea value={note} onChange={e=>setNote(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white" />
          </div>
        </div>
        <button onClick={saveVitals} disabled={saving} className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white">{saving?'Saving...':'Save vitals'}</button>
      </div>
    </div>
  )
}
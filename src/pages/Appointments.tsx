import { useState } from 'react'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'

export default function Appointments() {
  const { user } = useAuth()
  const [date, setDate] = useState('')
  const [type, setType] = useState('Counseling')
  const [ref, setRef] = useState('CFID-001')
  const [saving, setSaving] = useState(false)

  async function book() {
    if (!user) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'appointments'), {
        userId: user.uid,
        date,
        type,
        CFID_reference: ref,
        status: 'pending',
        bookedAt: new Date().toISOString()
      })
      setDate('')
      alert("Appointment has been booked. Your request is being processed and you will be contacted.")
    } catch (e) {
      console.error('Failed to book appointment', e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border bg-white/70 backdrop-blur p-6">
        <h2 className="text-xl font-semibold text-slate-800">Book a Support Session</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm text-slate-600">Date</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Type</label>
            <select value={type} onChange={e=>setType(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white">
              <option>Counseling</option>
              <option>Psychosocial</option>
              <option>Peer Support</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="text-sm text-slate-600">CFID Reference</label>
          <input value={ref} onChange={e=>setRef(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white" />
        </div>
        <button onClick={book} disabled={saving} className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white">{saving?'Booking...':'Book session'}</button>
      </div>
    </div>
  )
}
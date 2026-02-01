import { useEffect, useState } from 'react'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '../../lib/firebase'

interface Appointment {
  id: string
  userId: string
  userEmail?: string
  date: string
  type: string
  status: string
  CFID_reference: string
}

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  // loading removed as unused, or use it
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const snap = await getDocs(collection(db, 'appointments'))
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) return <div>Loading...</div>

  async function updateStatus(id: string, status: string) {
    if (!confirm(`Mark appointment as ${status}?`)) return
    try {
      await updateDoc(doc(db, 'appointments', id), { status })
      load()
    } catch (e) {
      alert('Failed to update')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold dark:text-white">Appointment Management</h2>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">User</th>
              <th className="p-3">Type</th>
              <th className="p-3">Ref</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-700 dark:text-slate-300">
            {appointments.map(apt => (
              <tr key={apt.id}>
                <td className="p-3">{apt.date}</td>
                <td className="p-3">
                  <div>{apt.userEmail || apt.userId}</div>
                </td>
                <td className="p-3">{apt.type}</td>
                <td className="p-3 font-mono">{apt.CFID_reference}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    apt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {apt.status}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => updateStatus(apt.id, 'confirmed')} className="text-green-600 hover:underline">Confirm</button>
                  <button onClick={() => updateStatus(apt.id, 'cancelled')} className="text-red-600 hover:underline">Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

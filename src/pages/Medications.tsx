import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { format, parse } from 'date-fns'

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency?: string;
  times?: string[]; // e.g., ["08:00", "20:00"]
  instructions?: string;
  assignedBy?: string;
  assignedAt?: string;
}

export default function Medications() {
  const { user } = useAuth()
  const [meds, setMeds] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<{type:'success'|'error', text:string}|null>(null)
  
  // Time Picker State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['09:00'])

  const [showAddForm, setShowAddForm] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '', instructions: '' })

  const handleAddMedication = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setAdding(true)
    try {
      await addDoc(collection(db, 'medications'), {
        ...newMed,
        userId: user.uid,
        assignedAt: new Date().toISOString(),
        assignedBy: 'user',
        times: ['09:00']
      })
      setNewMed({ name: '', dosage: '', frequency: '', instructions: '' })
      setShowAddForm(false)
      setMsg({ type: 'success', text: 'Medication added successfully!' })
    } catch (e) {
      console.error(e)
      setMsg({ type: 'error', text: 'Failed to add medication.' })
    }
    setAdding(false)
  }

  // Helper to generate ICS content
  const generateICS = (med: Medication) => {
    const times = med.times || ['09:00']
    const events = times.map(time => {
      // Create a start date for tomorrow at the specified time
      const [hours, minutes] = time.split(':').map(Number)
      const now = new Date()
      const startDate = new Date(now)
      startDate.setHours(hours, minutes, 0)
      if (startDate <= now) startDate.setDate(startDate.getDate() + 1)
      
      const formatICSDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      
      return `BEGIN:VEVENT
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(new Date(startDate.getTime() + 15 * 60000))} 
RRULE:FREQ=DAILY
SUMMARY:Take ${med.name} (${med.dosage})
DESCRIPTION:Instruction: ${med.instructions || 'None'}
BEGIN:VALARM
TRIGGER:-PT10M
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT`
    }).join('\n')

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Genibi Healthcare//Medication Tracker//EN
${events}
END:VCALENDAR`
  }

  const handleDownloadCalendar = (med: Medication) => {
    try {
      const icsContent = generateICS(med)
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.setAttribute('download', `${med.name.replace(/\s+/g, '_')}_schedule.ics`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setMsg({ type: 'success', text: `Calendar event for ${med.name} generated!` })
    } catch (e) {
      console.error(e)
      setMsg({ type: 'error', text: 'Failed to generate calendar event.' })
    }
  }

  const handleSaveTimes = async (medId: string) => {
    try {
      await updateDoc(doc(db, 'medications', medId), { times: selectedTimes })
      setEditingId(null)
      setMsg({ type: 'success', text: 'Reminder times updated!' })
    } catch (e) {
      console.error(e)
      setMsg({ type: 'error', text: 'Failed to save times.' })
    }
  }

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'medications'),
      where('userId', '==', user.uid),
      // orderBy('assignedAt', 'desc') // Requires index, use client side sort if needed or create index
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Medication[] = []
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as Medication)
      })
      setMeds(items)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching meds:", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-2xl border bg-white/70 dark:bg-slate-900/70 dark:border-slate-800 backdrop-blur p-6 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Medication Tracker</h2>
            <p className="text-slate-600 dark:text-slate-400">Manage your prescriptions and daily intake.</p>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2"
          >
            {showAddForm ? 'Cancel' : '+ Add New'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddMedication} className="bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-5 mb-6 animate-in slide-in-from-top-4 duration-300">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Add New Medication</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input 
                  required
                  value={newMed.name}
                  onChange={e => setNewMed({...newMed, name: e.target.value})}
                  className="w-full px-3 py-2 border dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 dark:text-white"
                  placeholder="e.g. Lisinopril"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dosage</label>
                <input 
                  value={newMed.dosage}
                  onChange={e => setNewMed({...newMed, dosage: e.target.value})}
                  className="w-full px-3 py-2 border dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 dark:text-white"
                  placeholder="e.g. 10mg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
                <input 
                  value={newMed.frequency}
                  onChange={e => setNewMed({...newMed, frequency: e.target.value})}
                  className="w-full px-3 py-2 border dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 dark:text-white"
                  placeholder="e.g. Twice daily"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Instructions</label>
                <input 
                  value={newMed.instructions}
                  onChange={e => setNewMed({...newMed, instructions: e.target.value})}
                  className="w-full px-3 py-2 border dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 dark:text-white"
                  placeholder="e.g. Take with food"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={adding}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {adding ? 'Adding...' : 'Add Medication'}
              </button>
            </div>
          </form>
        )}

        {msg && (
          <div className={`mb-6 p-3 rounded-lg text-sm flex items-center gap-2 ${msg.type === 'error' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-800'}`}>
            <span>{msg.type === 'error' ? '⚠️' : '✅'}</span>
            {msg.text}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">Loading medications...</div>
        ) : meds.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed dark:border-slate-700">
            <span className="text-4xl block mb-2">💊</span>
            <p className="text-slate-500 dark:text-slate-400">No medications assigned yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {meds.map(med => (
              <div key={med.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border dark:border-slate-700 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{med.name}</h3>
                  {med.assignedBy === 'admin' && (
                    <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded-full font-medium">Prescribed</span>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-slate-500 dark:text-slate-400 w-20">Dosage:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{med.dosage}</span>
                  </div>
                  {med.frequency && (
                    <div className="flex gap-2">
                      <span className="text-slate-500 dark:text-slate-400 w-20">Frequency:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{med.frequency}</span>
                    </div>
                  )}
                  {med.instructions && (
                    <div className="mt-3 pt-3 border-t dark:border-slate-700">
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">Instructions</div>
                      <p className="text-slate-700 dark:text-slate-300">{med.instructions}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t dark:border-slate-700 flex flex-col gap-3">
                  {editingId === med.id ? (
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border dark:border-slate-700">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Set Reminder Times</label>
                      {selectedTimes.map((t, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <input 
                            type="time" 
                            value={t} 
                            onChange={e => {
                              const newTimes = [...selectedTimes]
                              newTimes[idx] = e.target.value
                              setSelectedTimes(newTimes)
                            }}
                            className="p-1 border dark:border-slate-600 rounded text-sm w-full bg-white dark:bg-slate-800 dark:text-white"
                          />
                          <button 
                            onClick={() => setSelectedTimes(selectedTimes.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => setSelectedTimes([...selectedTimes, '09:00'])}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline mb-3 block"
                      >
                        + Add another time
                      </button>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleSaveTimes(med.id)}
                          className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setEditingId(null)}
                          className="bg-white dark:bg-slate-800 border dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs px-3 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                       <div className="flex gap-1 flex-wrap">
                         {(med.times || []).map(t => (
                           <span key={t} className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-1 rounded">
                             ⏰ {format(parse(t, 'HH:mm', new Date()), 'h:mm a')}
                           </span>
                         ))}
                         {(!med.times || med.times.length === 0) && (
                           <span className="text-xs text-slate-400 italic">No reminders set</span>
                         )}
                       </div>
                       <button 
                         onClick={() => {
                           setEditingId(med.id)
                           setSelectedTimes(med.times && med.times.length > 0 ? med.times : ['09:00'])
                         }}
                         className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                       >
                         Edit Times
                       </button>
                    </div>
                  )}

                  <button 
                    onClick={() => handleDownloadCalendar(med)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    Add to Calendar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
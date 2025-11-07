import { useEffect, useMemo, useState } from 'react'
import { addDoc, collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

interface MoodEntry { date: string; score: number; note?: string }

export default function MoodTracker() {
  const { user } = useAuth()
  const [score, setScore] = useState(3)
  const [note, setNote] = useState('')
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [saving, setSaving] = useState(false)

  const uid = user?.uid

  async function load() {
    if (!uid) return
    try {
      const q = query(
        collection(db, 'moods'),
        where('userId', '==', uid),
        orderBy('date', 'desc')
      )
      const snap = await getDocs(q)
      const items: MoodEntry[] = []
      snap.forEach(d => {
        const data = d.data() as any
        items.push({ date: data.date, score: data.score, note: data.note })
      })
      setMoods(items.reverse())
    } catch (e) {
      console.warn('Mood fetch failed, showing local data only', e)
    }
  }

  useEffect(() => { load() }, [uid])

  async function save() {
    if (!uid) return
    const today = new Date().toISOString().slice(0,10)
    // Prevent duplicate entry for the same day
    if (moods.some(m => m.date === today)) {
      return
    }
    setSaving(true)
    const entry: MoodEntry = {
      date: today,
      score,
      note: note.trim() || undefined,
    }
    try {
      await addDoc(collection(db, 'moods'), { ...entry, userId: uid })
      setMoods(prev => [...prev, entry])
      setNote('')
    } catch (e) {
      console.error('Save mood failed', e)
    } finally {
      setSaving(false)
    }
  }

  const data = useMemo(() => moods.slice(-14).map(m => ({
    date: m.date.slice(5), score: m.score
  })), [moods])

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border bg-white/70 backdrop-blur p-6">
        <h2 className="text-xl font-semibold text-slate-800">Mood Tracker</h2>
        <p className="text-sm text-slate-600">How are you feeling today?</p>

        <div className="mt-4">
          <input type="range" min={1} max={5} value={score} onChange={e=>setScore(Number(e.target.value))} className="w-full" />
          <div className="flex justify-between text-xs text-slate-500">
            <span>😞 1</span><span>🙂 3</span><span>😊 5</span>
          </div>
        </div>

        <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Add a note (optional)" className="mt-4 w-full px-3 py-2 rounded-lg border bg-white" />

        <button onClick={save} disabled={saving} className="mt-4 px-4 py-2 rounded-lg bg-mint-500 text-white">{saving?'Saving...':'Save mood'}</button>
      </div>

      <div className="rounded-2xl border bg-white/70 backdrop-blur p-6 mt-8">
        <h3 className="font-medium text-slate-800">Recent trend</h3>
        <div className="h-64 mt-4">
          <ResponsiveContainer>
            <LineChart data={data}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={[1,5]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#3F8CFF" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
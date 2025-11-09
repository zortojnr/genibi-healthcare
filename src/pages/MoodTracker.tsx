import { useEffect, useMemo, useState } from 'react'
import { addDoc, collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

interface MoodEntry { 
  date: string; 
  score: number; 
  note?: string;
  mood_direction?: string;
  mood_intensity?: number;
  mood_source?: string;
}

export default function MoodTracker() {
  const { user } = useAuth()
  const [score, setScore] = useState(3)
  const [note, setNote] = useState('')
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [saving, setSaving] = useState(false)
  
  // New mood tracking fields
  const [moodDirection, setMoodDirection] = useState<string>('Neutral')
  const [moodIntensity, setMoodIntensity] = useState<number>(3)
  const [moodSource, setMoodSource] = useState<string>('Not sure')

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
        items.push({ 
          date: data.date, 
          score: data.score, 
          note: data.note,
          mood_direction: data.mood_direction,
          mood_intensity: data.mood_intensity,
          mood_source: data.mood_source
        })
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
      mood_direction: moodDirection,
      mood_intensity: moodIntensity,
      mood_source: moodSource
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

        <div className="mt-4">
          <label className="text-sm text-slate-700 block mb-2">Mood direction</label>
          <select value={moodDirection} onChange={e=>setMoodDirection(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white">
            <option value="Positive">Positive</option>
            <option value="Neutral">Neutral</option>
            <option value="Negative">Negative</option>
          </select>
        </div>

        <div className="mt-4">
          <label className="text-sm text-slate-700 block mb-2">Mood intensity</label>
          <input type="range" min={1} max={5} value={moodIntensity} onChange={e=>setMoodIntensity(Number(e.target.value))} className="w-full" />
          <div className="flex justify-between text-xs text-slate-500">
            <span>1 - Very Low</span><span>3 - Moderate</span><span>5 - Very High</span>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm text-slate-700 block mb-2">Mood source</label>
          <select value={moodSource} onChange={e=>setMoodSource(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-white">
            <option value="My thoughts/internal feelings">My thoughts/internal feelings</option>
            <option value="Someone else's actions or words">Someone else's actions or words</option>
            <option value="Environment / surroundings">Environment / surroundings</option>
            <option value="Not sure">Not sure</option>
          </select>
        </div>

        <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Add a note (optional)" className="mt-4 w-full px-3 py-2 rounded-lg border bg-white" />

        <button 
          onClick={save} 
          disabled={saving} 
          className={`
            mt-4 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 ease-in-out
            ${saving 
              ? 'bg-mint-400 cursor-not-allowed opacity-75' 
              : 'bg-mint-500 hover:bg-mint-600 hover:shadow-lg hover:scale-105 active:bg-mint-700 active:scale-95'
            }
            focus:outline-none focus:ring-4 focus:ring-mint-300 focus:ring-opacity-50
            disabled:transform-none disabled:shadow-none
            min-w-[120px] flex items-center justify-center
          `}
          aria-label={saving ? 'Saving mood entry' : 'Save mood entry'}
          aria-busy={saving}
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save mood'
          )}
        </button>
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
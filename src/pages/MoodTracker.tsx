import { useEffect, useMemo, useState } from 'react'
import { addDoc, collection, onSnapshot, orderBy, query, where, getDocs } from 'firebase/firestore'
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
  analysis?: string;
}

export default function MoodTracker() {
  const { user } = useAuth()
  const [score, setScore] = useState(3)
  const [note, setNote] = useState('')
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<{type: 'success' | 'error', text: string} | null>(null)
  
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
      
      // Initial load
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
      setLoading(false)

      // Realtime listener
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const updatedItems: MoodEntry[] = []
        snapshot.forEach(d => {
          const data = d.data() as any
          updatedItems.push({ 
            date: data.date, 
            score: data.score, 
            note: data.note,
            mood_direction: data.mood_direction,
            mood_intensity: data.mood_intensity,
            mood_source: data.mood_source
          })
        })
        setMoods(updatedItems.reverse())
      })
      
      return unsubscribe
    } catch (e) {
      console.warn('Mood fetch failed, showing local data only', e)
      setMsg({ type: 'error', text: 'Failed to load mood history. Please try refreshing.' })
      setLoading(false)
    }
  }

  useEffect(() => { 
    let unsub: any
    load().then(u => unsub = u)
    return () => { if(unsub && typeof unsub === 'function') unsub() }
  }, [uid])

  async function save() {
    if (!uid) return
    setMsg(null)
    const today = new Date().toISOString().slice(0,10)
    // Prevent duplicate entry for the same day
    if (moods.some(m => m.date === today)) {
      setMsg({ type: 'error', text: 'You have already logged your mood for today.' })
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
      // setMoods(prev => [...prev, entry]) // No longer needed with onSnapshot
      setNote('')
      setMsg({ type: 'success', text: 'Mood entry saved successfully!' })
    } catch (e) {
      console.error('Save mood failed', e)
      setMsg({ type: 'error', text: 'Failed to save mood. Please try again.' })
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
        <p className="text-sm text-slate-600 mb-4">How are you feeling today?</p>

        {msg && (
          <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
            <span>{msg.type === 'error' ? '⚠️' : '✅'}</span>
            {msg.text}
          </div>
        )}

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
            mt-4 px-6 py-3 rounded-lg font-semibold text-slate-900 transition-all duration-200 ease-in-out
            min-w-[140px] min-h-[48px] flex items-center justify-center gap-2
            shadow-md hover:shadow-lg active:shadow-sm
            transform hover:scale-105 active:scale-95
            ${saving 
              ? 'bg-gradient-to-r from-mint-400 to-mint-500 cursor-not-allowed opacity-80 shadow-inner' 
              : 'bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700 active:from-mint-700 active:to-mint-800'
            }
            focus:outline-none focus:ring-4 focus:ring-mint-300 focus:ring-opacity-60
            disabled:transform-none disabled:shadow-none disabled:opacity-60
            border border-mint-600/20 hover:border-mint-600/30
          `}
          aria-label={saving ? 'Saving mood entry' : 'Save mood entry'}
          aria-busy={saving}
        >
          {saving ? (
            <>
              <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-medium">Saving...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Save mood</span>
            </>
          )}
        </button>
      </div>

      <div className="rounded-2xl border bg-white/70 backdrop-blur p-6 mt-8">
        <h3 className="font-medium text-slate-800">Recent trend</h3>
        {loading ? (
          <div className="h-64 mt-4 flex items-center justify-center text-slate-400">
            <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : moods.length === 0 ? (
          <div className="h-64 mt-4 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
            <span className="text-4xl mb-2">📊</span>
            <p>No mood data yet. Start tracking today!</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  )
}
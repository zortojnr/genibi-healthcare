import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'

interface Resource { title: string; type: 'article'|'video'|'audio'; link: string; tags?: string[] }

const fallback: Resource[] = [
  { title: 'Breathing for Calm (3 min)', type: 'audio', link: 'https://example.com/breathing', tags: ['anxiety', 'calm'] },
  { title: 'Focus Reset: Pomodoro Basics', type: 'article', link: 'https://example.com/focus', tags: ['focus', 'study'] },
  { title: 'Understanding Stress', type: 'video', link: 'https://example.com/stress', tags: ['stress'] },
]

export default function Library() {
  const [resources, setResources] = useState<Resource[]>(fallback)
  const [q, setQ] = useState('')
  const [type, setType] = useState<'all'|'article'|'video'|'audio'>('all')

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'resources'))
        const items: Resource[] = []
        snap.forEach(d => items.push(d.data() as Resource))
        if (items.length) setResources(items)
      } catch (e) {
        console.warn('Using fallback resources', e)
      }
    })()
  }, [])

  const filtered = useMemo(() => resources.filter(r => {
    const matchesText = q ? (r.title.toLowerCase().includes(q.toLowerCase()) || (r.tags||[]).join(' ').toLowerCase().includes(q.toLowerCase())) : true
    const matchesType = type==='all' ? true : r.type===type
    return matchesText && matchesType
  }), [resources, q, type])

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-2xl border bg-white/70 backdrop-blur p-6">
        <h2 className="text-xl font-semibold text-slate-800">E-Library</h2>
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search articles, videos, audio" className="px-3 py-2 rounded-lg border bg-white" />
          <select value={type} onChange={e=>setType(e.target.value as any)} className="px-3 py-2 rounded-lg border bg-white">
            <option value="all">All</option>
            <option value="article">Articles</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
          </select>
        </div>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(r => (
            <a key={r.title} href={r.link} target="_blank" className="block rounded-xl border bg-white p-4">
              <div className="text-xs text-slate-500 uppercase">{r.type}</div>
              <div className="mt-1 font-medium text-slate-800">{r.title}</div>
              {r.tags && <div className="mt-2 text-xs text-slate-500">{r.tags.join(', ')}</div>}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
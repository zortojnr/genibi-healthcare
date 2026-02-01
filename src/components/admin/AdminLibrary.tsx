import { useEffect, useState } from 'react'
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export default function AdminLibrary() {
  const [resources, setResources] = useState<any[]>([])
  const [form, setForm] = useState({ title: '', type: 'article', link: '', tags: '' })
  
  useEffect(() => { load() }, [])

  async function load() {
    const snap = await getDocs(collection(db, 'resources'))
    setResources(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  async function add() {
    if (!form.title || !form.link) return alert('Title and Link required')
    await addDoc(collection(db, 'resources'), {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()),
      createdAt: new Date().toISOString()
    })
    setForm({ title: '', type: 'article', link: '', tags: '' })
    load()
  }

  async function remove(id: string) {
    if (!confirm('Delete resource?')) return
    await deleteDoc(doc(db, 'resources', id))
    load()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold dark:text-white">Library Manager</h2>
      
      {/* Add Form */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
        <div className="lg:col-span-2">
          <label className="text-xs dark:text-slate-400">Title</label>
          <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
        </div>
        <div>
          <label className="text-xs dark:text-slate-400">Type</label>
          <select className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" value={form.type} onChange={e=>setForm({...form, type: e.target.value})}>
            <option value="article">Article</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
          </select>
        </div>
        <div>
          <label className="text-xs dark:text-slate-400">Link</label>
          <input className="w-full p-2 border rounded dark:bg-slate-700 dark:text-white" value={form.link} onChange={e=>setForm({...form, link: e.target.value})} />
        </div>
        <button onClick={add} className="bg-green-600 text-white p-2 rounded hover:bg-green-700">Add Resource</button>
      </div>

      {/* List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map(r => (
          <div key={r.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 flex justify-between items-start">
            <div>
              <div className="font-bold dark:text-white">{r.title}</div>
              <div className="text-xs text-slate-500 uppercase">{r.type}</div>
              <a href={r.link} target="_blank" className="text-xs text-blue-500 hover:underline truncate block max-w-[200px]">{r.link}</a>
            </div>
            <button onClick={() => remove(r.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">🗑️</button>
          </div>
        ))}
      </div>
    </div>
  )
}

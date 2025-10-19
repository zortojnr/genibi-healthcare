import { motion } from "framer-motion"
import { useState } from "react"
import {
  demoUser,
  demoAppointments,
  demoMoodEntries,
  demoVitals,
  demoMedications,
  demoLibraryItems,
} from "../lib/demoData"
import { Link } from "react-router-dom"
import { isGeminiEnabled, generateReply } from "../lib/genibi"

interface Message { role: 'user' | 'assistant'; content: string }
function geminiStub(prompt: string): string {
  const normalized = prompt.toLowerCase()
  if (normalized.includes('anxious')) return 'I hear you. Let’s try a 4-7-8 breathing exercise together. Inhale for 4, hold for 7, exhale for 8. You are safe.'
  if (normalized.includes('focus')) return 'Focus drifts; that’s normal. Try the Pomodoro technique: 25 minutes of study, 5 minutes of rest. Want me to guide a session?'
  if (normalized.includes('book')) return 'I can help you book a psychosocial support session. Tap Appointments to choose a date and time.'
  return 'I’m here with you. Tell me how you’re feeling, and we’ll take it one step at a time.'
}
const quick = ['I feel anxious', "I can't focus", 'Book a session']

export default function Demo() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi, I’m Genibi AI. How can I support you today?' }
  ])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const send = async (text: string) => {
    const prompt = text.trim()
    if (!prompt) return
    const userMsg: Message = { role: 'user', content: prompt }
    setMessages(prev => [...prev, userMsg])
    setPending(true)
    try {
      let replyText: string
      if (isGeminiEnabled) {
        const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
        replyText = await generateReply(history.map(h => h.content).join('\n'))
      } else {
        replyText = geminiStub(prompt)
      }
      setMessages(prev => [...prev, { role: 'assistant', content: replyText }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I couldn’t get a live reply. Please try again.' }])
    } finally {
      setPending(false)
    }
  }
  const [showAssistant, setShowAssistant] = useState(true)
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className="px-6 sm:px-10 py-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">GENIBI</h1>
                <p className="text-sm text-gray-500">Explore the platform with sample data (no sign-in required)</p>
              </div>
            </div>
            <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-700">Return to sign in</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-10">
            {/* Overview */}
            <div className="md:col-span-1 space-y-4">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                <h2 className="text-sm font-medium text-slate-700">Profile</h2>
                <div className="mt-3 text-sm text-slate-900">{demoUser.name}</div>
                <div className="text-xs text-slate-500">{demoUser.organization}</div>
                <div className="mt-2 inline-flex items-center px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs">Demo Mode</div>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                <h2 className="text-sm font-medium text-slate-700">Vitals</h2>
                <ul className="mt-3 space-y-2">
                  {demoVitals.map(v => (
                    <li key={v.id} className="flex justify-between text-sm">
                      <span className="text-slate-600">{v.metric}</span>
                      <span className="font-medium text-slate-900">{v.value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                <h2 className="text-sm font-medium text-slate-700">Medications</h2>
                <ul className="mt-3 space-y-2">
                  {demoMedications.map(m => (
                    <li key={m.id} className="text-sm text-slate-800">
                      {m.name} · <span className="text-slate-600">{m.dosage}</span> · <span className="text-slate-600">{m.schedule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Activity */}
            <div className="md:col-span-2 space-y-4">
              {/* Toggle to reopen when hidden */}
              {!showAssistant && (
                <div className="flex justify-end">
                  <button onClick={() => setShowAssistant(true)} className="text-xs px-3 py-1 rounded-full border bg-white text-slate-700 hover:opacity-90">Open AI Assistant</button>
                </div>
              )}
              {/* AI Assistant (Genibi) */}
              {showAssistant && (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-slate-700">AI Assistant</h2>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-1 rounded-full border ${isGeminiEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{isGeminiEnabled ? 'Live' : 'Demo'}</span>
                    <button aria-label="Close assistant" onClick={() => setShowAssistant(false)} className="text-xs px-3 py-1 rounded-full border bg-white text-slate-700 hover:opacity-90">Close</button>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="space-y-2">
                    {messages.map((m, i) => (
                      <div key={i} className={`text-sm ${m.role==='user'?'text-slate-800':'text-slate-700'}`}>
                        <span className={`inline-block px-3 py-2 rounded-xl ${m.role==='user'?'bg-mint-50 border':'bg-blue-50 border'}`}>{m.content}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {quick.map(q => (
                      <button key={q} onClick={() => send(q)} className="text-xs px-3 py-1 rounded-full border bg-white text-slate-700">{q}</button>
                    ))}
                  </div>
                  <div className="mt-3 p-3 border-t flex flex-col sm:flex-row gap-2">
                    <input value={input} onChange={e=>setInput(e.target.value)} placeholder={pending ? "Genibi is replying..." : "Type your message"} disabled={pending} className="w-full sm:flex-1 px-3 py-2 rounded-lg border bg-white disabled:opacity-70" />
                    <button disabled={pending} onClick={async () => { const t = input.trim(); if (t) { await send(t); setInput('') } }} className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-70">{pending ? 'Sending…' : 'Send'}</button>
                  </div>
                </div>
              </div>
              )}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                <h2 className="text-sm font-medium text-slate-700">Upcoming Appointments</h2>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {demoAppointments.map(a => (
                    <div key={a.id} className="p-4 bg-white border border-slate-200 rounded-lg">
                      <div className="text-sm font-medium text-slate-900">{a.with}</div>
                      <div className="text-xs text-slate-600">{a.type}</div>
                      <div className="mt-2 text-sm text-slate-700">{a.date} · {a.time}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                <h2 className="text-sm font-medium text-slate-700">Recent Mood</h2>
                <div className="mt-3 flex items-end gap-2">
                  {demoMoodEntries.map(e => (
                    <div key={e.id} className="flex flex-col items-center">
                      <div className="h-16 w-8 bg-indigo-200 rounded-sm" style={{ height: `${e.score * 8}px` }}></div>
                      <div className="mt-1 text-xs text-slate-600">{e.mood}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                <h2 className="text-sm font-medium text-slate-700">Library</h2>
                <ul className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {demoLibraryItems.map(item => (
                    <li key={item.id} className="p-4 bg-white border border-slate-200 rounded-lg text-sm">
                      <div className="font-medium text-slate-900">{item.title}</div>
                      <div className="text-xs text-slate-600">{item.type}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
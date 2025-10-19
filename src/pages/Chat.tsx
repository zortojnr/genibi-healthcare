import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { isGeminiEnabled, generateReply } from '../lib/genibi'

interface Message { role: 'user' | 'assistant'; content: string }

function geminiStub(prompt: string): string {
  const normalized = prompt.toLowerCase()
  if (normalized.includes('anxious')) return 'I hear you. Let’s try a 4-7-8 breathing exercise together. Inhale for 4, hold for 7, exhale for 8. You are safe.'
  if (normalized.includes('focus')) return 'Focus drifts; that’s normal. Try the Pomodoro technique: 25 minutes of study, 5 minutes of rest. Want me to guide a session?'
  if (normalized.includes('book')) return 'I can help you book a psychosocial support session. Tap Appointments to choose a date and time.'
  return 'I’m here with you. Tell me how you’re feeling, and we’ll take it one step at a time.'
}

const quick = ['I feel anxious', "I can't focus", 'Book a session']

export default function Chat() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi, I’m Genibi AI. How can I support you today?' }
  ])
  const [input, setInput] = useState('')
  const [showAssistant, setShowAssistant] = useState(true)
  const [pending, setPending] = useState(false)

  const send = async (text: string) => {
    const userMsg: Message = { role: 'user', content: text }
    const history = [...messages, userMsg]
    setMessages(prev => [...prev, userMsg])
    setPending(true)
    try {
      let replyText: string
      if (isGeminiEnabled) {
        replyText = await generateReply(text, history)
      } else {
        replyText = geminiStub(text)
      }
      const reply: Message = { role: 'assistant', content: replyText }
      setMessages(prev => [...prev, reply])
    } catch (err) {
      const reply: Message = { role: 'assistant', content: 'I’m having trouble responding right now. Please try again.' }
      setMessages(prev => [...prev, reply])
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border bg-white/70 backdrop-blur">
        {/* Header with close + toggle */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="text-sm font-medium text-slate-800">AI Assistant</div>
          <div className="flex items-center gap-2">
            <button aria-label={showAssistant ? 'Hide assistant' : 'Show assistant'} onClick={() => setShowAssistant(v=>!v)} className="text-xs px-3 py-1 rounded-full border bg-white text-slate-700 hover:opacity-90">
              {showAssistant ? 'Hide' : 'Show'}
            </button>
            <button aria-label="Close assistant" onClick={() => navigate('/')} className="text-xs px-3 py-1 rounded-full border bg-white text-slate-700 hover:opacity-90">Close</button>
          </div>
        </div>

        {!showAssistant ? (
          <div className="p-6">
            <p className="text-sm text-slate-600">Assistant is hidden.</p>
            <button onClick={() => setShowAssistant(true)} className="mt-3 text-xs px-3 py-1 rounded-full border bg-white text-slate-700 hover:opacity-90">Open AI Assistant</button>
          </div>
        ) : (
          <>
            <div className="p-6 space-y-4">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`text-sm ${m.role==='user'?'text-slate-800':'text-slate-700'}`}>
                  <span className={`inline-block px-3 py-2 rounded-xl ${m.role==='user'?'bg-mint-50 border':'bg-blue-50 border'}`}>{m.content}</span>
                </motion.div>
              ))}
            </div>
            <div className="px-6 pb-6 flex gap-2 flex-wrap">
              {quick.map(q => (
                <button key={q} onClick={() => send(q)} className="text-xs px-3 py-1 rounded-full border bg-white text-slate-700">{q}</button>
              ))}
            </div>
            <div className="p-4 border-t flex flex-col sm:flex-row gap-2">
            <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Type your message" className="w-full sm:flex-1 px-3 py-2 rounded-lg border bg-white" />
            <button disabled={pending} onClick={() => { if (input.trim()) { void send(input.trim()); setInput('') }}} className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60">Send</button>
            </div>
          </>
        )}
      </div>
      <p className="text-xs text-slate-500 mt-3">Note: Genibi AI is powered by Gemini. Add VITE_GEMINI_API_KEY in .env to enable live responses.</p>
    </div>
  )
}
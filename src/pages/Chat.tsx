import { useState } from 'react'
import { motion } from 'framer-motion'
import { isGeminiEnabled, generateReply } from '../lib/genibi'

interface Message { role: 'user' | 'assistant'; content: string }

const quick = ['I feel anxious', "I can't focus", 'Book a session']

export default function Chat() {
  // removed unused navigate
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
      if (!isGeminiEnabled) {
        const reply: Message = { role: 'assistant', content: 'Live AI is not configured. Add VITE_GEMINI_API_KEY to enable.' }
        setMessages(prev => [...prev, reply])
      } else {
        const replyText = await generateReply(text, history)
        const reply: Message = { role: 'assistant', content: replyText }
        setMessages(prev => [...prev, reply])
      }
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
        {showAssistant && (
          <>
            <div className="px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-700">AI Assistant</h2>
              <div className="flex items-center gap-2">
                <button aria-label="Close assistant" onClick={() => setShowAssistant(false)} className="text-xs px-3 py-1 rounded-full border bg-white text-slate-700">Close</button>
              </div>
            </div>
            <div className="px-6 py-3 space-y-2">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-sm ${m.role==='user'?'text-slate-800':'text-slate-700'}`}>
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
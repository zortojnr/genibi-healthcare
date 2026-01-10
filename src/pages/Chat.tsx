import { useState } from 'react'
import { motion } from 'framer-motion'
import { isGeminiEnabled, generateReply } from '../lib/genibi'

interface Message { role: 'user' | 'assistant'; content: string }

const quick = [
  'How can I improve sleep quality?',
  'What are balanced diet tips?',
  'When should I see a doctor?'
]

export default function Chat() {
  // removed unused navigate
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi, I’m Genibi AI. How can I help with your health today?' }
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
      const replyText = await generateReply(text, history)
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
      <div className="rounded-2xl border bg-white/70 dark:bg-slate-900/70 dark:border-slate-800 backdrop-blur transition-colors">
        {showAssistant && (
          <>
            <div className="px-6 py-4 flex items-center justify-between border-b dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300">AI Assistant</h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${isGeminiEnabled ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'}`}>
                  {isGeminiEnabled ? 'AI: Live' : 'AI: Disabled'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  aria-label="Close assistant" 
                  onClick={() => setShowAssistant(false)} 
                  className="text-xs px-3 py-1 rounded-full border bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="px-6 py-3 space-y-3 min-h-[300px] max-h-[500px] overflow-y-auto">
              {messages.map((m, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <span className={`inline-block px-4 py-2.5 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm'
                  }`}>
                    {m.content}
                  </span>
                </motion.div>
              ))}
              {pending && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 px-4 py-3 rounded-2xl shadow-sm flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  </div>
                </motion.div>
              )}
            </div>
            <div className="px-6 pb-6 flex gap-2 flex-wrap">
              {quick.map(q => (
                <button 
                  key={q} 
                  onClick={() => send(q)} 
                  className="text-xs px-3 py-1.5 rounded-full border bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="p-4 border-t dark:border-slate-800 flex flex-col sm:flex-row gap-2">
              <input 
                value={input} 
                onChange={e=>setInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && input.trim() && !pending && (e.preventDefault(), send(input.trim()), setInput(''))}
                placeholder="Type your message..." 
                className="w-full sm:flex-1 px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 dark:placeholder-slate-500" 
              />
              <button 
                disabled={pending || !input.trim()} 
                onClick={() => { if (input.trim()) { void send(input.trim()); setInput('') }}} 
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
        Note: Genibi AI calls are routed via a secure server. Configure <code>GEMINI_API_KEY</code> in your server environment.
      </p>
    </div>
  )
}
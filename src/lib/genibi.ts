import { GoogleGenerativeAI } from '@google/generative-ai'

export interface ChatMessage { role: 'user' | 'assistant'; content: string }

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
export const isGeminiEnabled = Boolean(apiKey)

const defaultModel = 'gemini-1.5-flash'
const modelId = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || defaultModel

export async function generateReply(input: string, history: ChatMessage[] = []): Promise<string> {
  if (!isGeminiEnabled) {
    throw new Error('app/not-configured')
  }
  const genAI = new GoogleGenerativeAI(apiKey!)
  const model = genAI.getGenerativeModel({ model: modelId })

  // Generate a response using prior turns + current input
  const toRole = (r: 'user' | 'assistant') => (r === 'assistant' ? 'model' : 'user')
  const contents = [
    ...history.map(m => ({ role: toRole(m.role), parts: [{ text: m.content }] })),
    { role: 'user', parts: [{ text: input }] },
  ]

  const result = await model.generateContent({ contents })
  const text = result.response.text()
  return text.trim()
}
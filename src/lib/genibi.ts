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

  // Build a lightweight chat session with prior turns
  const chat = model.startChat({
    history: history.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
  })

  const result = await chat.sendMessage(input)
  const text = result.response.text()
  return text.trim()
}
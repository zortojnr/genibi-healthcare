export interface ChatMessage { role: 'user' | 'assistant'; content: string }

export const isGeminiEnabled = true

export async function generateReply(input: string, history: ChatMessage[] = []): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, history }),
  })
  if (!response.ok) {
    const errText = await response.text()
    throw new Error(errText || 'chat/request_failed')
  }
  const data = await response.json() as { success?: boolean; response?: string }
  return (data.response || '').trim()
}
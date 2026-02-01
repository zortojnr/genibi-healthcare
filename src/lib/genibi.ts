export interface ChatMessage { role: 'user' | 'assistant'; content: string }

export const isGeminiEnabled = true

const MEDICAL_CONTEXT = `
You are Genibi, a mental health AI assistant. 
Your role is to provide supportive, non-judgmental information about mental health, coping strategies, and wellness.
DO NOT provide medical diagnoses or prescribe medication.
Always advise users to seek professional help for serious issues.
Use the following reference data when relevant:
- Anxiety: Generalized Anxiety Disorder is characterized by excessive worry.
- Depression: Persistent sadness and loss of interest.
- Stress Management: Deep breathing, mindfulness, and exercise are effective.
- Crisis: If the user mentions self-harm or suicide, provide emergency numbers immediately.
`

export async function generateReply(input: string, history: ChatMessage[] = []): Promise<string> {
  // Inject context at the beginning of the history for the API
  const contextMessage: ChatMessage = { role: 'system' as any, content: MEDICAL_CONTEXT }
  const enrichedHistory = [contextMessage, ...history]

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, history: enrichedHistory }),
  })
  if (!response.ok) {
    const errText = await response.text()
    throw new Error(errText || 'chat/request_failed')
  }
  const data = await response.json() as { success?: boolean; response?: string }
  return (data.response || '').trim()
}
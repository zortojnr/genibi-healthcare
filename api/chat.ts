// Types are intentionally generic to avoid requiring '@vercel/node' locally

interface ChatRequest {
  input: string;
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface GeminiRequest {
  contents: GeminiContent[];
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Parse request body
    const { input, history }: ChatRequest = req.body;

    if (!input || typeof input !== 'string') {
      return res.status(400).json({ error: 'Invalid input provided' });
    }

    // Convert history to Gemini format
    const contents: GeminiContent[] = [];
    
    // Add history messages
    if (history && Array.isArray(history)) {
      for (const message of history) {
        contents.push({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: message.content }]
        });
      }
    }

    // Add current user input
    contents.push({
      role: 'user',
      parts: [{ text: input }]
    });

    // Prepare Gemini API request
    const geminiRequest: GeminiRequest = {
      contents
    };

    // Make request to Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to get response from Gemini API',
        details: errorText
      });
    }

    const geminiResponse: GeminiResponse = await response.json();

    // Extract response text
    const responseText = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      console.error('No response text from Gemini API:', geminiResponse);
      return res.status(500).json({ error: 'No response received from AI' });
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      response: responseText,
      model: model
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
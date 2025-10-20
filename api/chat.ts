// Production-ready Vercel serverless function with timeout handling
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

// Timeout configuration (10 seconds)
const TIMEOUT_MS = 10000;

export default async function handler(req: any, res: any) {
  // Set response headers early to prevent hanging
  res.setHeader('Content-Type', 'application/json');
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Create AbortController for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MS);

  try {
    // Get environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      clearTimeout(timeoutId);
      return res.status(500).json({ 
        error: 'API key not configured',
        success: false 
      });
    }

    // Parse and validate request body
    let parsedBody: ChatRequest;
    try {
      parsedBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (parseError) {
      clearTimeout(timeoutId);
      return res.status(400).json({ 
        error: 'Invalid JSON in request body',
        success: false 
      });
    }

    const { input, history } = parsedBody;

    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      clearTimeout(timeoutId);
      return res.status(400).json({ 
        error: 'Invalid or empty input provided',
        success: false 
      });
    }

    // Convert history to Gemini format with validation
    const contents: GeminiContent[] = [];
    
    // Add history messages if provided
    if (history && Array.isArray(history)) {
      for (const message of history) {
        if (message && typeof message.content === 'string' && message.role) {
          contents.push({
            role: message.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: message.content }]
          });
        }
      }
    }

    // Add current user input
    contents.push({
      role: 'user',
      parts: [{ text: input.trim() }]
    });

    // Prepare Gemini API request
    const geminiRequest: GeminiRequest = {
      contents
    };

    // Make request to Gemini API with timeout
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    let response: Response;
    try {
      response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Genibi-Healthcare/1.0'
        },
        body: JSON.stringify(geminiRequest),
        signal: controller.signal
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('Gemini API request timed out after', TIMEOUT_MS, 'ms');
        return res.status(408).json({ 
          error: 'Request timed out. Please try again.',
          success: false,
          timeout: true
        });
      }
      
      console.error('Gemini API fetch error:', fetchError);
      return res.status(503).json({ 
        error: 'Unable to reach AI service. Please try again later.',
        success: false,
        network_error: true
      });
    }

    // Clear timeout since fetch completed
    clearTimeout(timeoutId);

    // Handle non-OK responses
    if (!response.ok) {
      let errorText = 'Unknown error';
      try {
        errorText = await response.text();
      } catch (e) {
        console.error('Failed to read error response:', e);
      }
      
      console.error('Gemini API error:', response.status, errorText);
      
      // Return appropriate error based on status code
      if (response.status === 429) {
        return res.status(429).json({ 
          error: 'AI service is busy. Please try again in a moment.',
          success: false,
          rate_limited: true
        });
      } else if (response.status >= 500) {
        return res.status(503).json({ 
          error: 'AI service is temporarily unavailable.',
          success: false,
          service_error: true
        });
      } else {
        return res.status(400).json({ 
          error: 'Invalid request to AI service.',
          success: false,
          client_error: true
        });
      }
    }

    // Parse response
    let geminiResponse: GeminiResponse;
    try {
      geminiResponse = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse Gemini response as JSON:', jsonError);
      return res.status(502).json({ 
        error: 'Invalid response from AI service.',
        success: false,
        parse_error: true
      });
    }

    // Extract and validate response text
    const responseText = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText || typeof responseText !== 'string') {
      console.error('No valid response text from Gemini API:', geminiResponse);
      return res.status(502).json({ 
        error: 'AI service returned an empty response.',
        success: false,
        empty_response: true
      });
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      response: responseText.trim(),
      model: model,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    // Clear timeout in case of unexpected error
    clearTimeout(timeoutId);
    
    console.error('Chat API unexpected error:', error);
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      return res.status(408).json({ 
        error: 'Request was cancelled due to timeout.',
        success: false,
        timeout: true
      });
    }
    
    return res.status(500).json({ 
      error: 'An unexpected error occurred. Please try again.',
      success: false,
      internal_error: true,
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
interface ChatRequest {
  message?: string;
  language?: string;
  location?: { name?: string; displayName?: string };
  air?: {
    aqi?: number;
    category?: string;
    dominantPollutant?: string;
    pm25?: number;
    temperature?: number;
    windSpeed?: number;
  };
  history?: Array<{ sender: 'user' | 'assistant'; text: string }>;
}

export const handler = async (event: { httpMethod: string; body: string | null }) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let payload: ChatRequest;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  const message = payload.message?.trim();
  if (!message) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Message is required' })
    };
  }

  const air = payload.air ?? {};
  const place = payload.location?.name || 'your selected location';
  const language = payload.language && payload.language !== 'Auto' ? payload.language : 'the same language and script as the user';
  const system = `You are BreatheAI, a warm, precise air-quality companion. You help people make practical choices about outdoor plans, masks, indoor air, and pollution.

Live context for ${place}: AQI ${air.aqi ?? 'unavailable'} (${air.category ?? 'unknown'}), dominant pollutant ${air.dominantPollutant ?? 'unknown'}, PM2.5 ${air.pm25 ?? 'unavailable'} µg/m³, temperature ${air.temperature ?? 'unavailable'}°C, wind ${air.windSpeed ?? 'unavailable'} km/h.

Rules:
- Reply in ${language}. If Auto is selected, match the user's language, script, and tone.
- Answer the user's actual question first.
- Keep ordinary replies under 120 words. Use short paragraphs or at most three bullets.
- For health information, be practical and cautious; encourage professional care for urgent symptoms.
- Do not mention prompts, APIs, models, or that you are an AI unless asked.`;

  const history = (payload.history ?? [])
    .filter(turn => turn && (turn.sender === 'user' || turn.sender === 'assistant') && typeof turn.text === 'string')
    .slice(-8)
    .map(turn => ({ role: turn.sender === 'assistant' ? 'assistant' : 'user', content: turn.text.slice(0, 1800) }));

  // 1. Try Groq
  const groqKey = process.env.GROQ_LLM_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (groqKey) {
    try {
      const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${groqKey}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || 'qwen/qwen3.8-27b',
          messages: [{ role: 'system', content: system }, ...history, { role: 'user', content: message }],
          temperature: 0.65,
          max_tokens: 360
        })
      });

      if (upstream.ok) {
        const data = await upstream.json() as { choices?: Array<{ message?: { content?: string } }> };
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (reply) {
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({ reply })
          };
        }
      }
    } catch (e) {
      console.error('Netlify Groq request error:', e);
    }
  }

  // 2. Try Gemini
  const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (geminiKey) {
    const models = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'];
    for (const model of models) {
      try {
        const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [
              ...history.map(h => ({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.content }] })),
              { role: 'user', parts: [{ text: message }] }
            ],
            generationConfig: { maxOutputTokens: 360, temperature: 0.65 }
          })
        });

        if (upstream.ok) {
          const data = await upstream.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (reply) {
            return {
              statusCode: 200,
              headers: { 'Content-Type': 'application/json; charset=utf-8' },
              body: JSON.stringify({ reply })
            };
          }
        }
      } catch (e) {
        console.error(`Netlify Gemini ${model} request error:`, e);
      }
    }
  }

  // 3. Try Ollama Fallback Safety (https://ollama.com/v1)
  const ollamaKey = process.env.OLLAMA_API_KEY || process.env.VITE_OLLAMA_API_KEY;
  if (ollamaKey) {
    try {
      const baseUrl = (process.env.OLLAMA_BASE_URL || process.env.VITE_OLLAMA_BASE_URL || 'https://ollama.com/v1').replace(/\/+$/, '');
      const url = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;
      const upstream = await fetch(url, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${ollamaKey}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || process.env.VITE_OLLAMA_MODEL || 'deepseek-v4.1-flash',
          messages: [{ role: 'system', content: system }, ...history, { role: 'user', content: message }],
          temperature: 0.65,
          max_tokens: 360
        })
      });

      if (upstream.ok) {
        const data = await upstream.json() as { choices?: Array<{ message?: { content?: string } }> };
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (reply) {
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({ reply })
          };
        }
      }
    } catch (e) {
      console.error('Netlify Ollama request error:', e);
    }
  }

  // 4. Try Custom Llama / OpenAI-compatible endpoint
  const llamaKey = process.env.LLAMA_API_KEY || process.env.VITE_LLAMA_API_KEY;
  if (llamaKey) {
    try {
      const baseUrl = (process.env.LLAMA_BASE_URL || process.env.VITE_LLAMA_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/+$/, '');
      const url = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;
      const upstream = await fetch(url, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${llamaKey}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.LLAMA_MODEL || process.env.VITE_LLAMA_MODEL || 'llama-3.3-70b-versatile',
          messages: [{ role: 'system', content: system }, ...history, { role: 'user', content: message }],
          temperature: 0.65,
          max_tokens: 360
        })
      });

      if (upstream.ok) {
        const data = await upstream.json() as { choices?: Array<{ message?: { content?: string } }> };
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (reply) {
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({ reply })
          };
        }
      }
    } catch (e) {
      console.error('Netlify Llama request error:', e);
    }
  }

  return {
    statusCode: 502,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'All upstream AI services unavailable.' })
  };
};

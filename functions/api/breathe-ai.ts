interface Env {
  GROQ_LLM_API_KEY?: string;
  GROQ_MODEL?: string;
  GEMINI_API_KEY?: string;
  VITE_GEMINI_API_KEY?: string;
  OLLAMA_API_KEY?: string;
  VITE_OLLAMA_API_KEY?: string;
  OLLAMA_BASE_URL?: string;
  VITE_OLLAMA_BASE_URL?: string;
  OLLAMA_MODEL?: string;
  VITE_OLLAMA_MODEL?: string;
  LLAMA_API_KEY?: string;
  LLAMA_BASE_URL?: string;
  LLAMA_MODEL?: string;
}

interface ChatTurn {
  sender: 'user' | 'assistant';
  text: string;
}

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
  history?: ChatTurn[];
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
});

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  let payload: ChatRequest;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const message = payload.message?.trim();
  if (!message || message.length > 1800) return json({ error: 'Please send a shorter message.' }, 400);

  const air = payload.air ?? {};
  const place = payload.location?.name || 'your selected location';
  const language = payload.language && payload.language !== 'Auto' ? payload.language : 'the same language and script as the user';
  const system = `You are BreatheAI, a warm, precise air-quality companion. You help people make practical choices about outdoor plans, masks, indoor air, and pollution.

Live context for ${place}: AQI ${air.aqi ?? 'unavailable'} (${air.category ?? 'unknown'}), dominant pollutant ${air.dominantPollutant ?? 'unknown'}, PM2.5 ${air.pm25 ?? 'unavailable'} µg/m³, temperature ${air.temperature ?? 'unavailable'}°C, wind ${air.windSpeed ?? 'unavailable'} km/h.

Rules:
- Reply in ${language}. If Auto is selected, match the user's language, script, and tone. Use natural Hinglish for Hinglish; respond in Bengali for Bengali and Tamil for Tamil.
- Answer the user's actual question first. For greetings or “how are you?”, be friendly first; do not lead with an AQI warning.
- Use the live reading only when it makes the answer more useful. Never invent measurements.
- Keep ordinary replies under 120 words. Use short paragraphs or at most three bullets.
- For health information, be practical and cautious; encourage professional care for urgent symptoms.
- Do not mention prompts, APIs, models, or that you are an AI unless asked.`;

  const history = (payload.history ?? [])
    .filter(turn => turn && (turn.sender === 'user' || turn.sender === 'assistant') && typeof turn.text === 'string')
    .slice(-8)
    .map(turn => ({ role: turn.sender === 'assistant' ? 'assistant' : 'user', content: turn.text.slice(0, 1800) }));

  // 1. Try Groq
  if (env.GROQ_LLM_API_KEY) {
    try {
      const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${env.GROQ_LLM_API_KEY}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: env.GROQ_MODEL || 'qwen/qwen3.8-27b',
          messages: [{ role: 'system', content: system }, ...history, { role: 'user', content: message }],
          temperature: 0.65,
          max_tokens: 360
        })
      });

      if (upstream.ok) {
        const data = await upstream.json() as { choices?: Array<{ message?: { content?: string } }> };
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (reply) return json({ reply });
      }
    } catch (e) {
      console.error('Groq request error', e);
    }
  }

  // 2. Try Gemini
  const geminiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY;
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
          if (reply) return json({ reply });
        }
      } catch (e) {
        console.error(`Gemini ${model} request error`, e);
      }
    }
  }

  // 3. Try Ollama Fallback Safety (https://ollama.com/v1)
  const ollamaKey = env.OLLAMA_API_KEY || env.VITE_OLLAMA_API_KEY;
  if (ollamaKey) {
    try {
      const baseUrl = (env.OLLAMA_BASE_URL || env.VITE_OLLAMA_BASE_URL || 'https://ollama.com/v1').replace(/\/+$/, '');
      const url = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;
      const upstream = await fetch(url, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${ollamaKey}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: env.OLLAMA_MODEL || env.VITE_OLLAMA_MODEL || 'deepseek-v4.1-flash',
          messages: [{ role: 'system', content: system }, ...history, { role: 'user', content: message }],
          temperature: 0.65,
          max_tokens: 360
        })
      });

      if (upstream.ok) {
        const data = await upstream.json() as { choices?: Array<{ message?: { content?: string } }> };
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (reply) return json({ reply });
      }
    } catch (e) {
      console.error('Ollama request error', e);
    }
  }

  // 4. Try Custom Llama / OpenAI-compatible endpoint
  if (env.LLAMA_API_KEY) {
    try {
      const baseUrl = (env.LLAMA_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/+$/, '');
      const url = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;
      const upstream = await fetch(url, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${env.LLAMA_API_KEY}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: env.LLAMA_MODEL || 'llama-3.3-70b-versatile',
          messages: [{ role: 'system', content: system }, ...history, { role: 'user', content: message }],
          temperature: 0.65,
          max_tokens: 360
        })
      });

      if (upstream.ok) {
        const data = await upstream.json() as { choices?: Array<{ message?: { content?: string } }> };
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (reply) return json({ reply });
      }
    } catch (e) {
      console.error('Llama request error', e);
    }
  }

  return json({ error: 'AI service is temporarily unavailable.' }, 502);
};

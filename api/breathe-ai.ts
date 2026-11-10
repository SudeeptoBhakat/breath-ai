import type { IncomingMessage, ServerResponse } from 'http';

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

function sendResponse(res: ServerResponse, status: number, data: any) {
  if (typeof (res as any).status === 'function' && typeof (res as any).json === 'function') {
    return (res as any).status(status).json(data);
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    return sendResponse(res, 405, { error: 'Method not allowed.' });
  }

  let payload: ChatRequest = req.body;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch {
      payload = {};
    }
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const raw = Buffer.concat(chunks).toString('utf-8');
      payload = JSON.parse(raw || '{}');
    } catch {
      payload = {};
    }
  }

  const message = payload.message?.trim();
  if (!message || message.length > 1800) {
    return sendResponse(res, 400, { error: 'Please send a valid, concise message.' });
  }

  const air = payload.air ?? {};
  const place = payload.location?.name || 'your selected location';
  const language = payload.language && payload.language !== 'Auto' ? payload.language : 'the same language and script as the user';
  const system = `You are BreatheAI, a warm, precise air-quality companion. You help people make practical choices about outdoor plans, masks, indoor air, and pollution.

Live context for ${place}: AQI ${air.aqi ?? 'unavailable'} (${air.category ?? 'unknown'}), dominant pollutant ${air.dominantPollutant ?? 'unknown'}, PM2.5 ${air.pm25 ?? 'unavailable'} µg/m³, temperature ${air.temperature ?? 'unavailable'}°C, wind ${air.windSpeed ?? 'unavailable'} km/h.

Rules:
- Reply in ${language}. If Auto is selected, match the user's language, script, and tone. Use natural Hinglish for Hinglish; respond in Bengali for Bengali and Tamil for Tamil.
- Answer the user's actual question first. For greetings or "how are you?", be friendly first; do not lead with an AQI warning.
- Use the live reading only when it makes the answer more useful. Never invent measurements.
- Keep ordinary replies under 120 words. Use short paragraphs or at most three bullets.
- For health information, be practical and cautious; encourage professional care for urgent symptoms.
- Do not mention prompts, APIs, models, or that you are an AI unless asked.`;

  const history = (payload.history ?? [])
    .filter(turn => turn && (turn.sender === 'user' || turn.sender === 'assistant') && typeof turn.text === 'string')
    .slice(-8)
    .map(turn => ({ role: turn.sender === 'assistant' ? 'assistant' : 'user', content: turn.text.slice(0, 1800) }));

  const env = process.env;

  // 1. Try Groq
  const groqKey = env.GROQ_LLM_API_KEY || env.VITE_GROQ_API_KEY;
  if (groqKey) {
    try {
      const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${groqKey}`,
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
        if (reply) return sendResponse(res, 200, { reply });
      }
    } catch (e) {
      console.warn('Groq request error', e);
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
          if (reply) return sendResponse(res, 200, { reply });
        }
      } catch (e) {
        console.warn(`Gemini ${model} request error`, e);
      }
    }
  }

  // 3. Fallback
  return sendResponse(res, 502, { error: 'AI assistant service temporarily unavailable.' });
}

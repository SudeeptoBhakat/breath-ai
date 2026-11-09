interface Env {
  GROQ_LLM_API_KEY: string;
  GROQ_MODEL?: string;
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
  if (!env.GROQ_LLM_API_KEY) return json({ error: 'AI service is not configured.' }, 503);

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

    if (!upstream.ok) {
      console.error('Groq upstream error', upstream.status);
      return json({ error: 'AI service is temporarily unavailable.' }, 502);
    }

    const data = await upstream.json() as { choices?: Array<{ message?: { content?: string } }> };
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) return json({ error: 'AI service returned an empty response.' }, 502);
    return json({ reply });
  } catch (error) {
    console.error('Groq request error', error);
    return json({ error: 'AI service is temporarily unavailable.' }, 502);
  }
};

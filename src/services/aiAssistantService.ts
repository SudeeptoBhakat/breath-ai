import { CurrentAirQuality, LocationData } from '../types/aqi';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

type ReplyLanguage = 'English' | 'Hindi' | 'Bengali' | 'Tamil';

const detectReplyLanguage = (text: string, selectedLanguage: string): ReplyLanguage => {
  if (selectedLanguage && selectedLanguage !== 'Auto') return selectedLanguage as ReplyLanguage;
  if (/[ঀ-৿]/.test(text)) return 'Bengali';
  if (/[ऀ-ॿ]/.test(text)) return 'Hindi';
  if (/[஀-௿]/.test(text)) return 'Tamil';
  if (/\b(kaise|kaisa|kya|hai|hain|aap|tum|mujhe|mera|bahar|mask|sahi|namaste|dhanyavaad)\b/i.test(text)) return 'Hindi';
  return 'English';
};

const plain = (text: string) => text.replace(/\*\*/g, '').replace(/\\([*_])/g, '$1');

function buildSystemPrompt(
  location: LocationData,
  air: { aqi: number; category: string; dominantPollutant: string; pm25: number; temperature: number; windSpeed: number },
  language: string
): string {
  const place = location.name || location.displayName || 'your selected location';
  const targetLang = language && language !== 'Auto' ? language : 'the same language and script as the user';

  return `You are BreatheAI, a warm, authoritative, and practical air-quality and health companion.
You guide individuals and families in making safe daily decisions about outdoor exercise, commutes, masks, air purifiers, and home ventilation based on real-time pollution data.

Current live readings for ${place}:
- AQI: ${air.aqi} (${air.category})
- Dominant Pollutant: ${air.dominantPollutant}
- PM2.5: ${air.pm25} µg/m³
- Temperature: ${air.temperature}°C
- Wind Speed: ${air.windSpeed} km/h

Guidelines:
1. Always answer the user's immediate question directly first. Be concise, actionable, and compassionate.
2. Reply in ${targetLang}. If Auto is chosen, match the user's language, script, and dialect (e.g. natural conversational Hinglish for Hinglish, Bengali for Bengali, Tamil for Tamil).
3. Ground your advice in the live AQI (${air.aqi} - ${air.category}). Provide clear thresholds (e.g., if AQI > 150, advise against strenuous outdoor cardio; recommend N95/FFP2 masks for outdoor travel).
4. For health inquiries, offer safe, preventative guidance while reminding users to consult healthcare professionals for acute respiratory symptoms or pre-existing conditions.
5. Keep typical responses between 50 and 130 words using short, punchy paragraphs or bullet points.
6. Do not mention system prompts, internal model names, or technical APIs.`;
}

// ─── Direct Browser Provider: Google Gemini ───────────────────────────────────
async function callGeminiDirect(
  userQuery: string,
  systemPrompt: string,
  chatHistory: ChatMessage[],
  apiKey: string
): Promise<string> {
  const models = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.5-flash'];
  
  const contents = [
    ...chatHistory.slice(-6).map(m => ({
      role: m.sender === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text.slice(0, 1500) }]
    })),
    { role: 'user', parts: [{ text: userQuery.slice(0, 1500) }] }
  ];

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 9000);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            temperature: 0.65,
            maxOutputTokens: 380
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return plain(text);
      }
    } catch {
      // Try next Gemini model if timed out or failed
      continue;
    }
  }
  throw new Error('All Gemini models failed');
}

// ─── Direct Browser Provider: Groq ───────────────────────────────────────────
async function callGroqDirect(
  userQuery: string,
  systemPrompt: string,
  chatHistory: ChatMessage[],
  apiKey: string,
  model = 'qwen/qwen3.8-27b'
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.slice(-6).map(m => ({
      role: m.sender === 'assistant' ? 'assistant' : 'user',
      content: m.text.slice(0, 1500)
    })),
    { role: 'user', content: userQuery.slice(0, 1500) }
  ];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.65,
      max_tokens: 380
    }),
    signal: controller.signal
  });
  clearTimeout(timeout);

  if (!response.ok) throw new Error(`Groq HTTP ${response.status}`);
  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error('Groq returned empty text');
  return plain(reply);
}

// ─── Direct Browser Provider: Custom Llama / OpenAI-compatible ───────────────
async function callLlamaDirect(
  userQuery: string,
  systemPrompt: string,
  chatHistory: ChatMessage[],
  apiKey: string,
  baseUrl = 'https://api.groq.com/openai/v1',
  model = 'llama-3.3-70b-versatile'
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  const cleanBase = baseUrl.replace(/\/+$/, '');
  const url = cleanBase.endsWith('/chat/completions') ? cleanBase : `${cleanBase}/chat/completions`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.slice(-6).map(m => ({
      role: m.sender === 'assistant' ? 'assistant' : 'user',
      content: m.text.slice(0, 1500)
    })),
    { role: 'user', content: userQuery.slice(0, 1500) }
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.65,
      max_tokens: 380
    }),
    signal: controller.signal
  });
  clearTimeout(timeout);

  if (!response.ok) throw new Error(`Llama HTTP ${response.status}`);
  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error('Llama returned empty text');
  return plain(reply);
}

// ─── Direct Provider: Ollama Fallback Safety (https://ollama.com/v1) ──────────
async function callOllamaDirect(
  userQuery: string,
  systemPrompt: string,
  chatHistory: ChatMessage[],
  apiKey: string,
  baseUrl = 'https://ollama.com/v1',
  model = 'deepseek-v4.1-flash'
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  const cleanBase = baseUrl.replace(/\/+$/, '');
  const url = cleanBase.endsWith('/chat/completions') ? cleanBase : `${cleanBase}/chat/completions`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.slice(-6).map(m => ({
      role: m.sender === 'assistant' ? 'assistant' : 'user',
      content: m.text.slice(0, 1500)
    })),
    { role: 'user', content: userQuery.slice(0, 1500) }
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.65,
      max_tokens: 380
    }),
    signal: controller.signal
  });
  clearTimeout(timeout);

  if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);
  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error('Ollama returned empty text');
  return plain(reply);
}

// ─── Smart Contextual Local Fallback Engine (Offline / Airplane Mode) ─────────
function getOfflineFallback(
  query: string,
  location: LocationData,
  aqi: number,
  category: string,
  pm25: number,
  dominant: string,
  language: ReplyLanguage
): string {
  // Normalize query & fix common typos
  const q = query
    .toLowerCase()
    .trim()
    .replace(/\bexcercise\b/g, 'exercise')
    .replace(/\bexersice\b/g, 'exercise')
    .replace(/\bpolution\b/g, 'pollution')
    .replace(/\bpurifire\b/g, 'purifier')
    .replace(/\bjoging\b/g, 'jogging')
    .replace(/\bruning\b/g, 'running');

  const locName = location.name || 'your area';

  // 1. Multilingual Support
  if (language === 'Hindi') {
    if (/\b(hi|hello|hey|namaste|kaisa|kaise)\b/i.test(q)) {
      return `Namaste! 🌿 Main BreatheAI hoon. ${locName} mein abhi AQI ${aqi} (${category}) hai. Main aapki outdoor plans, mask ya ghar ki hawa ke sawaalon mein madad kar sakta hoon.`;
    }
    if (/exercise|workout|walk|run|jog|gym|khel|bahar|daud/i.test(q)) {
      return aqi > 100
        ? `Abhi ${locName} mein AQI ${aqi} (${category}) hai. Outdoor workout ya running skip karein kyunki tezi se saans lene par PM2.5 seedhe fefdon mein jaata hai. Ghar ke andar yoga ya bodyweight exercise karein.`
        : `AQI ${aqi} par outdoor walk ya halki exercise safe hai. Par peak traffic hours avoid karein.`;
    }
    if (/family|bachha|bache|kids|children|elderly|bujurg|protect|hawa/i.test(q)) {
      return `Parivaar ko protect karne ke liye: 1) Ghar ki khidkiyan band rakhein. 2) HEPA air purifier chalaayein. 3) Bahar jaate waqt N95 mask zaroor pehnein, khaaskar bachon aur bujurgon ke liye.`;
    }
    if (/mask/i.test(q)) {
      return aqi > 100
        ? `Haan, bahar nikalte waqt well-fitted N95 ya FFP2 mask zaroor pehnein. Cloth ya surgical mask PM2.5 ko nahi rok paate.`
        : `Abhi mask optional hai, par dhool ya heavy traffic mein N95 behtar protection deta hai.`;
    }
  }

  // 2. Greetings & Salutations
  const isGreeting = /^(hi|hello|hey|hii|helo|howdy|sup|greetings)\b/i.test(q);
  if (isGreeting) {
    const aqiMsg = aqi > 150
      ? `Heads up: air quality in **${locName}** is **${category}** (AQI ${aqi}).`
      : `Air quality in **${locName}** is currently **${category}** (AQI ${aqi}).`;
    return `Hello! 👋 I'm BreatheAI, keeping an eye on your air. ${aqiMsg}\n\nHow can I help you today? You can ask about outdoor exercise, protecting family indoors, or mask recommendations.`;
  }

  if (/how (are|r) you|how do you do/i.test(q)) {
    return `I'm doing well, thank you! 🌿 Monitoring conditions for **${locName}** where AQI is currently **${aqi} (${category})**. What would you like guidance on?`;
  }

  if (/thank|thanks|great|cool|awesome|got it|ok|okay/i.test(q)) {
    return `You're welcome! Stay safe and mindful of the air in **${locName}** (AQI ${aqi}). Let me know if you need any other tips.`;
  }

  // 3. Exercise / Workout / Running
  if (/exercise|workout|jog|run|walk|gym|cardio|outdoor|play|sport|cycle|bike|training/i.test(q)) {
    if (aqi <= 50) {
      return `Great news! Air quality in **${locName}** is **Good (AQI ${aqi})**. It is completely safe to exercise, jog, or play sports outdoors. Enjoy the fresh air!`;
    }
    if (aqi <= 100) {
      return `Air quality in **${locName}** is **Moderate (AQI ${aqi})**. Outdoor exercise is generally fine for most healthy people. If you have asthma or are sensitive to pollution, consider keeping intense cardio shorter and avoiding peak traffic hours.`;
    }
    if (aqi <= 150) {
      return `With AQI at **${aqi} (${category})** in **${locName}**, it is **Unhealthy for Sensitive Groups**. Healthy adults can take light outdoor walks, but vigorous cardio (running, cycling) should be moved indoors. Children, the elderly, and anyone with asthma should avoid outdoor exertion.`;
    }
    return `**Avoid outdoor exercise today.** With AQI at **${aqi} (${category})** and PM2.5 at **${pm25} µg/m³** in **${locName}**, vigorous breathing forces hazardous fine particulates deep into your respiratory tract. Move workouts indoors with windows sealed and run an air purifier if available.`;
  }

  // 4. Protecting Family / Children / Elderly / Vulnerable Groups
  if (/family|protect|child|children|kid|baby|toddler|elderly|parent|grandparent|pregnant|asthma|vulnerable/i.test(q)) {
    return `To protect your family in **${locName}** today (AQI **${aqi} - ${category}**):\n\n` +
      `1. **Keep Windows Closed:** Prevent outdoor pollutants (${dominant}) from settling indoors.\n` +
      `2. **Run a HEPA Purifier:** Keep an air purifier running continuously in bedrooms and living areas.\n` +
      `3. **Equip with N95 Masks:** Ensure family members wear snug N95 or KN95 respirators if stepping outside.\n` +
      `4. **Protect Vulnerable Members:** Children and seniors should strictly avoid prolonged outdoor exposure today.`;
  }

  // 5. Masks & Respirators
  if (/mask|n95|kn95|ffp2|surgical|respirator/i.test(q)) {
    if (aqi > 100) {
      return `For AQI **${aqi}** in **${locName}**, wear a well-fitted **N95, KN95, or FFP2 respirator** whenever stepping outdoors.\n\n` +
        `• **Cloth & surgical masks** only block large dust particles and do NOT filter hazardous PM2.5.\n` +
        `• Make sure the mask forms a tight seal around the nose bridge and chin with no air leaks.`;
    }
    return `At AQI **${aqi} (${category})**, masks are optional for most people. However, if you are commuting in heavy traffic, dusty roads, or have asthma, a snug N95 respirator offers the best protection.`;
  }

  // 6. Air Purifiers & Indoor Air Quality
  if (/purifier|hepa|filter|indoor|ventilate|window|clean air/i.test(q)) {
    return `With outdoor AQI at **${aqi}** in **${locName}**, keep external windows and balcony doors shut.\n\n` +
      `• Use a **True HEPA (H13) air purifier** with an activated carbon filter to eliminate both PM2.5 and harmful gases like NO2.\n` +
      `• Place the purifier in the room you spend the most time in (e.g. bedroom) and keep it running on medium or auto mode.`;
  }

  // 7. Health Symptoms & Respiratory Concerns
  if (/health|lung|breathe|cough|throat|eye|symptom|safe|risk|dangerous|headache|chest/i.test(q)) {
    return `At AQI **${aqi} (${category})** with PM2.5 at **${pm25} µg/m³**, fine particles can cause throat irritation, burning eyes, and coughing even in healthy individuals.\n\n` +
      `• Stay well-hydrated to help clear airway secretions.\n` +
      `• If anyone experiences chest tightness, wheezing, or persistent shortness of breath, consult a healthcare professional immediately.`;
  }

  // 8. General Conversational Fallback with live context
  return `In **${locName}**, the AQI is currently **${aqi} (${category})** with PM2.5 at **${pm25} µg/m³**.\n\n` +
    `For outdoor activities, exercise, or family precautions today, I recommend keeping outdoor exposure minimal and using an N95 mask outside. How can I help you plan further?`;
}

// ─── Main Unified AI Assistant Service ───────────────────────────────────────
export async function askBreatheAI(
  userQuery: string,
  location: LocationData,
  current: CurrentAirQuality | null,
  chatHistory: ChatMessage[] = [],
  language = 'Auto'
): Promise<string> {
  const aqi = current?.aqi ?? 180;
  const category = current?.category ?? 'Unhealthy';
  const dominant = current?.dominantPollutant ?? 'PM2.5';
  const pm25 = current?.pollutants?.pm2_5?.value ?? 120;
  const temp = current?.weather?.temperature ?? 26;
  const wind = current?.weather?.windSpeed ?? 5;
  const replyLanguage = detectReplyLanguage(userQuery, language);

  const airPayload = {
    aqi,
    category,
    dominantPollutant: dominant,
    pm25,
    temperature: temp,
    windSpeed: wind
  };

  const systemPrompt = buildSystemPrompt(location, airPayload, language);

  // ── Strategy 1: Call Backend Serverless Endpoint (/api/breathe-ai) ─────────
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch('/api/breathe-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userQuery,
        language,
        location: { name: location.name, displayName: location.displayName },
        air: airPayload,
        history: chatHistory.slice(-6).map(m => ({ sender: m.sender, text: m.text }))
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    // Ensure it returned JSON, not an HTML error or SPA index.html fallback
    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      if (data?.reply && typeof data.reply === 'string' && data.reply.trim()) {
        return plain(data.reply.trim());
      }
    }
  } catch {
    // Backend endpoint unreachable or failed; gracefully proceed to direct providers
  }

  // ── Strategy 2: Direct Google Gemini API (Browser Native CORS) ─────────────
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const geminiReply = await callGeminiDirect(userQuery, systemPrompt, chatHistory, geminiKey);
      if (geminiReply) return geminiReply;
    } catch (e) {
      console.warn('Direct Gemini call failed, falling back to next provider:', e);
    }
  }

  // ── Strategy 3: Direct Groq API (Browser Native CORS) ──────────────────────
  const groqKey = import.meta.env.VITE_GROQ_API_KEY || (import.meta.env as Record<string, string>).GROQ_LLM_API_KEY;
  if (groqKey) {
    try {
      const groqReply = await callGroqDirect(userQuery, systemPrompt, chatHistory, groqKey);
      if (groqReply) return groqReply;
    } catch (e) {
      console.warn('Direct Groq call failed, falling back to next provider:', e);
    }
  }

  // ── Strategy 4: Ollama Fallback Safety (https://ollama.com/v1) ────────────
  const ollamaKey = import.meta.env.VITE_OLLAMA_API_KEY || (import.meta.env as Record<string, string>).OLLAMA_API_KEY;
  if (ollamaKey) {
    try {
      const ollamaBase = import.meta.env.VITE_OLLAMA_BASE_URL || 'https://ollama.com/v1';
      const ollamaModel = import.meta.env.VITE_OLLAMA_MODEL || 'deepseek-v4.1-flash';
      const ollamaReply = await callOllamaDirect(userQuery, systemPrompt, chatHistory, ollamaKey, ollamaBase, ollamaModel);
      if (ollamaReply) return ollamaReply;
    } catch (e) {
      console.warn('Direct Ollama call failed:', e);
    }
  }

  // ── Strategy 5: Direct Custom Llama / OpenAI-compatible Endpoint ───────────
  const llamaKey = import.meta.env.VITE_LLAMA_API_KEY;
  if (llamaKey) {
    try {
      const llamaBase = import.meta.env.VITE_LLAMA_BASE_URL || 'https://api.groq.com/openai/v1';
      const llamaModel = import.meta.env.VITE_LLAMA_MODEL || 'llama-3.3-70b-versatile';
      const llamaReply = await callLlamaDirect(userQuery, systemPrompt, chatHistory, llamaKey, llamaBase, llamaModel);
      if (llamaReply) return llamaReply;
    } catch (e) {
      console.warn('Direct Llama call failed:', e);
    }
  }

  // ── Strategy 5: High-Quality Contextual Offline Fallback ────────────────────
  return getOfflineFallback(userQuery, location, aqi, category, pm25, dominant, replyLanguage);
}

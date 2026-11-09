import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

interface LocalBreatheRequest {
  message?: string;
  language?: string;
  location?: { name?: string };
  air?: { aqi?: number; category?: string; dominantPollutant?: string; pm25?: number; temperature?: number; windSpeed?: number };
  history?: Array<{ sender?: 'user' | 'assistant'; text?: string }>;
}

interface ProxyConfig {
  groqKey?: string;
  groqModel?: string;
  geminiKey?: string;
  ollamaKey?: string;
  ollamaBase?: string;
  ollamaModel?: string;
  llamaKey?: string;
  llamaBase?: string;
  llamaModel?: string;
}

const localBreatheAiProxy = (cfg: ProxyConfig): Plugin => ({
  name: 'local-breathe-ai-proxy',
  configureServer(server) {
    server.middlewares.use('/api/breathe-ai', async (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405;
        response.end(JSON.stringify({ error: 'Method not allowed.' }));
        return;
      }

      try {
        const body = await new Promise<string>((resolve, reject) => {
          let raw = '';
          request.setEncoding('utf8');
          request.on('data', chunk => { raw += chunk; });
          request.on('end', () => resolve(raw));
          request.on('error', reject);
        });
        const payload = JSON.parse(body) as LocalBreatheRequest;
        const message = payload.message?.trim();
        if (!message) {
          response.statusCode = 400;
          response.end(JSON.stringify({ error: 'Message is required.' }));
          return;
        }

        const air = payload.air ?? {};
        const location = payload.location?.name || 'your selected location';
        const language = payload.language && payload.language !== 'Auto' ? payload.language : 'the same language and script as the user';
        const system = `You are BreatheAI, a warm and precise air-quality companion. Reply in ${language}; match the user's language, script, and tone. Answer the actual question first. For greetings, be friendly before mentioning air quality. Keep normal replies under 120 words. Do not mention APIs or models.\n\nLive context for ${location}: AQI ${air.aqi ?? 'unavailable'} (${air.category ?? 'unknown'}), dominant pollutant ${air.dominantPollutant ?? 'unknown'}, PM2.5 ${air.pm25 ?? 'unavailable'} µg/m³, temperature ${air.temperature ?? 'unavailable'}°C, wind ${air.windSpeed ?? 'unavailable'} km/h.`;
        const history = (payload.history ?? [])
          .filter(turn => (turn.sender === 'user' || turn.sender === 'assistant') && typeof turn.text === 'string')
          .slice(-8)
          .map(turn => ({ role: turn.sender === 'assistant' ? 'assistant' : 'user', content: turn.text!.slice(0, 1800) }));

        let reply: string | null = null;

        // 1. Try Groq
        if (cfg.groqKey) {
          try {
            const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: { authorization: `Bearer ${cfg.groqKey}`, 'content-type': 'application/json' },
              body: JSON.stringify({
                model: cfg.groqModel || 'qwen/qwen3.8-27b',
                messages: [{ role: 'system', content: system }, ...history, { role: 'user', content: message }],
                temperature: 0.65,
                max_tokens: 360
              })
            });
            if (upstream.ok) {
              const data = await upstream.json() as { choices?: Array<{ message?: { content?: string } }> };
              reply = data.choices?.[0]?.message?.content?.trim() || null;
            }
          } catch (e) {
            console.warn('Vite proxy Groq attempt failed:', e);
          }
        }

        // 2. Try Gemini
        if (!reply && cfg.geminiKey) {
          const geminiModels = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'];
          for (const m of geminiModels) {
            try {
              const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${cfg.geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  systemInstruction: { parts: [{ text: system }] },
                  contents: [
                    ...history.map(h => ({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.content }] })),
                    { role: 'user', parts: [{ text: message }] }
                  ],
                  generationConfig: { maxOutputTokens: 360, temperature: 0.65 }
                })
              });
              if (geminiRes.ok) {
                const geminiData = await geminiRes.json();
                reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
                if (reply) break;
              }
            } catch (e) {
              console.warn(`Vite proxy Gemini ${m} attempt failed:`, e);
            }
          }
        }

        // 3. Try Ollama Fallback Safety (https://ollama.com/v1)
        if (!reply && cfg.ollamaKey) {
          try {
            const baseUrl = (cfg.ollamaBase || 'https://ollama.com/v1').replace(/\/+$/, '');
            const url = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;
            const ollamaRes = await fetch(url, {
              method: 'POST',
              headers: { authorization: `Bearer ${cfg.ollamaKey}`, 'content-type': 'application/json' },
              body: JSON.stringify({
                model: cfg.ollamaModel || 'deepseek-v4.1-flash',
                messages: [{ role: 'system', content: system }, ...history, { role: 'user', content: message }],
                temperature: 0.65,
                max_tokens: 360
              })
            });
            if (ollamaRes.ok) {
              const data = await ollamaRes.json() as { choices?: Array<{ message?: { content?: string } }> };
              reply = data.choices?.[0]?.message?.content?.trim() || null;
            }
          } catch (e) {
            console.warn('Vite proxy Ollama attempt failed:', e);
          }
        }

        // 4. Try Custom Llama / OpenAI-compatible endpoint
        if (!reply && cfg.llamaKey) {
          try {
            const baseUrl = (cfg.llamaBase || 'https://api.groq.com/openai/v1').replace(/\/+$/, '');
            const url = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;
            const llamaRes = await fetch(url, {
              method: 'POST',
              headers: { authorization: `Bearer ${cfg.llamaKey}`, 'content-type': 'application/json' },
              body: JSON.stringify({
                model: cfg.llamaModel || 'llama-3.3-70b-versatile',
                messages: [{ role: 'system', content: system }, ...history, { role: 'user', content: message }],
                temperature: 0.65,
                max_tokens: 360
              })
            });
            if (llamaRes.ok) {
              const data = await llamaRes.json() as { choices?: Array<{ message?: { content?: string } }> };
              reply = data.choices?.[0]?.message?.content?.trim() || null;
            }
          } catch (e) {
            console.warn('Vite proxy Llama attempt failed:', e);
          }
        }

        response.setHeader('content-type', 'application/json; charset=utf-8');
        if (reply) {
          response.statusCode = 200;
          response.end(JSON.stringify({ reply }));
        } else {
          response.statusCode = 502;
          response.end(JSON.stringify({ error: 'All upstream AI services unavailable.' }));
        }
      } catch (error) {
        console.error('Local BreatheAI proxy error:', error);
        response.statusCode = 500;
        response.setHeader('content-type', 'application/json; charset=utf-8');
        response.end(JSON.stringify({ error: 'Local BreatheAI service could not process that request.' }));
      }
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      localBreatheAiProxy({
        groqKey: env.GROQ_LLM_API_KEY || env.VITE_GROQ_API_KEY,
        groqModel: env.GROQ_MODEL || 'qwen/qwen3.8-27b',
        geminiKey: env.VITE_GEMINI_API_KEY,
        ollamaKey: env.OLLAMA_API_KEY || env.VITE_OLLAMA_API_KEY,
        ollamaBase: env.OLLAMA_BASE_URL || env.VITE_OLLAMA_BASE_URL,
        ollamaModel: env.OLLAMA_MODEL || env.VITE_OLLAMA_MODEL,
        llamaKey: env.VITE_LLAMA_API_KEY || env.LLAMA_API_KEY,
        llamaBase: env.VITE_LLAMA_BASE_URL,
        llamaModel: env.VITE_LLAMA_MODEL
      })
    ],
    server: {
      port: 3000,
      host: true,
      watch: {
        // Ignore binary/image files that OneDrive can lock on Windows
        ignored: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.ico', '**/*.webp']
      }
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet')) {
              return 'vendor-maps';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
          }
        }
      }
    }
  };
});

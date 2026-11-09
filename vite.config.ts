import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

interface LocalBreatheRequest {
  message?: string;
  language?: string;
  location?: { name?: string };
  air?: { aqi?: number; category?: string; dominantPollutant?: string; pm25?: number; temperature?: number; windSpeed?: number };
  history?: Array<{ sender?: 'user' | 'assistant'; text?: string }>;
}

const localBreatheAiProxy = (apiKey?: string, model?: string): Plugin => ({
  name: 'local-breathe-ai-proxy',
  configureServer(server) {
    server.middlewares.use('/api/breathe-ai', async (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405;
        response.end(JSON.stringify({ error: 'Method not allowed.' }));
        return;
      }
      if (!apiKey) {
        response.statusCode = 503;
        response.end(JSON.stringify({ error: 'GROQ_LLM_API_KEY is missing from .env. Restart Vite after adding it.' }));
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
        if (!message) throw new Error('Message is required.');

        const air = payload.air ?? {};
        const location = payload.location?.name || 'your selected location';
        const language = payload.language && payload.language !== 'Auto' ? payload.language : 'the same language and script as the user';
        const system = `You are BreatheAI, a warm and precise air-quality companion. Reply in ${language}; match the user's language, script, and tone. Answer the actual question first. For greetings, be friendly before mentioning air quality. Keep normal replies under 120 words. Do not mention APIs or models.\n\nLive context for ${location}: AQI ${air.aqi ?? 'unavailable'} (${air.category ?? 'unknown'}), dominant pollutant ${air.dominantPollutant ?? 'unknown'}, PM2.5 ${air.pm25 ?? 'unavailable'} µg/m³, temperature ${air.temperature ?? 'unavailable'}°C, wind ${air.windSpeed ?? 'unavailable'} km/h.`;
        const history = (payload.history ?? [])
          .filter(turn => (turn.sender === 'user' || turn.sender === 'assistant') && typeof turn.text === 'string')
          .slice(-8)
          .map(turn => ({ role: turn.sender, content: turn.text!.slice(0, 1800) }));
        const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
          body: JSON.stringify({
            model: model || 'qwen/qwen3.8-27b',
            messages: [{ role: 'system', content: system }, ...history, { role: 'user', content: message }],
            temperature: 0.65,
            max_tokens: 360
          })
        });
        const upstreamBody = await upstream.text();
        response.setHeader('content-type', 'application/json; charset=utf-8');
        response.statusCode = upstream.ok ? 200 : 502;
        if (!upstream.ok) {
          console.error('Local Groq proxy error:', upstream.status);
          response.end(JSON.stringify({ error: 'Groq is temporarily unavailable.' }));
          return;
        }
        const data = JSON.parse(upstreamBody) as { choices?: Array<{ message?: { content?: string } }> };
        response.end(JSON.stringify({ reply: data.choices?.[0]?.message?.content?.trim() || 'I could not generate a response.' }));
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
  // The empty prefix makes the server-only GROQ_LLM_API_KEY available to Vite's
  // Node process without exposing it to browser code.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), localBreatheAiProxy(env.GROQ_LLM_API_KEY, env.GROQ_MODEL)],
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
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-charts': ['recharts'],
            'vendor-maps': ['leaflet', 'react-leaflet'],
            'vendor-icons': ['lucide-react']
          }
        }
      }
    }
  };
});

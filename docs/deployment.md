# Architecture: Deployment

## Supported Platforms

BreatheAI is a **static SPA** with optional serverless functions. It can be deployed anywhere that serves static files; the serverless function (`/api/breathe-ai`) is optional but strongly recommended to route AI requests server-side.

---

## Vercel (Primary)

**Live:** https://breath-ai-six.vercel.app/

The serverless function is at [`functions/api/breathe-ai.ts`](../functions/api/breathe-ai.ts). Vercel auto-detects files inside `functions/api/` and deploys them as Edge/Serverless functions.

```
functions/
└── api/
    └── breathe-ai.ts     ← POST /api/breathe-ai
```

**Steps:**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Environment variables:** Set in Vercel Dashboard → Project → Settings → Environment Variables. Add all variables from `.env.example`.

---

## Netlify (Alternative)

[`netlify.toml`](../netlify.toml) is pre-configured:

```toml
[build]
  command   = "npm run build"
  publish   = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/api/breathe-ai"
  to   = "/.netlify/functions/breathe-ai"
  status = 200

[[redirects]]
  from = "/*"
  to   = "/index.html"
  status = 200
```

The function lives at [`netlify/functions/breathe-ai.ts`](../netlify/functions/breathe-ai.ts).

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

---

## Cloudflare Pages

The `functions/api/breathe-ai.ts` file uses the Cloudflare Pages format (`export const onRequestPost`). Deploy via the Cloudflare dashboard or Wrangler CLI, pointing the build output to `dist/`.

---

## Self-hosted Static

```bash
npm run build
npx serve dist --listen 8080
```

Without a serverless function, all AI calls fall through to the browser-side Gemini / Groq direct fetch tiers (Tiers 2–3) and ultimately to the offline engine (Tier 6). This mode works fully but exposes API keys in the browser bundle.

---

## Environment Variable Matrix

| Variable | Vercel | Netlify | Cloudflare | Self-hosted |
|----------|--------|---------|-----------|-------------|
| `VITE_WAQI_TOKEN` | Build env | Build env | Build env | `.env` |
| `VITE_GEMINI_API_KEY` | Build env | Build env | Build env | `.env` |
| `GROQ_LLM_API_KEY` | Build + Runtime env | Netlify env | Workers secret | `.env` |
| `VITE_SUPABASE_URL` | Build env | Build env | Build env | `.env` |
| `VITE_SUPABASE_ANON_KEY` | Build env | Build env | Build env | `.env` |

---

## Build Output

```
dist/
├── index.html                                 1.5 kB
├── assets/
│   ├── index-*.css                           68 kB (gzip: 13 kB)
│   ├── index-*.js                           376 kB (gzip: 102 kB)   ← main app
│   ├── vendor-charts-*.js                   418 kB (gzip: 113 kB)   ← Recharts
│   ├── vendor-maps-*.js                     290 kB (gzip:  89 kB)   ← Leaflet
│   ├── vendor-icons-*.js                     36 kB (gzip:   9 kB)   ← Lucide
│   ├── BreatheAiChat-*.js                    24 kB (lazy loaded)
│   ├── HealthAdvisoryCard-*.js               15 kB (lazy loaded)
│   └── ...other lazy chunks
```

Initial page load (over the wire): **~115 kB** CSS + JS gzipped before lazy chunks.

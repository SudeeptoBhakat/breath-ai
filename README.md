<div align="center">

<img src="src/logo.png" alt="BreatheAI Logo" width="80" />

# BreatheAI

**Production-grade real-time air quality intelligence — engineered for South Asian and global cities.**

[![Live Demo](https://img.shields.io/badge/Live-breath--ai--six.vercel.app-10b981?style=flat-square&logo=vercel)](https://breath-ai-six.vercel.app/)
[![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Live Demo](https://breath-ai-six.vercel.app/) · [Architecture](#architecture) · [Quick Start](#quick-start) · [Contributing](#contributing)

</div>

---

## Overview

BreatheAI is a **React + TypeScript** single-page application that delivers real-time air quality intelligence, 7-day history, 5-day forecasting, clinical health advisories, and an AI-powered conversational companion — all backed by authentic ground sensor telemetry.

### Key Features

| Feature | Description |
|---------|-------------|
| 🌿 **Live AQI Dashboard** | Real-time US AQI from Open-Meteo & WAQI ground stations |
| 🤖 **BreatheAI Chat** | 6-tier AI failover cascade (Gemini → Groq → Ollama → Llama) |
| 🗺️ **Interactive Map** | Leaflet + WAQI tile layers with real monitoring station markers |
| 📊 **Historical Analytics** | 7-day hourly trends, anomaly detection, ML-based 12-hour prediction |
| 📅 **5-Day Forecast** | Open-Meteo predictive atmospheric data with confidence intervals |
| 🏥 **Health Advisory** | US EPA + CPCB AQI spectrum with physician-calibrated guidance |
| 🌤️ **Atmospheric Card** | Google Weather-style card with dynamic sky animations |
| 🌍 **7 Languages** | English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati |
| 📤 **Social Sharing** | 1200×630 PNG social card + WhatsApp, X, Facebook, Instagram, Email |
| ⭐ **Saved Locations** | Modal & drawer to view, inspect live AQI, switch, & remove saved cities |
| 🔔 **Notification Center** | Dedicated notification panel with unread badge counter & alert history |
| 📧 **SMTP Email Alerts** | Automated physician warning reports dispatched via serverless SMTP |
| 🌙 **Dark / Light Theme** | Persisted theme with CSS custom properties |

---

## Architecture

```
src/
├── App.tsx                          # Root: provider tree, tab routing, lazy loading
├── main.tsx                         # React 18 createRoot entry point
├── index.css                        # Tailwind base + custom animations + design tokens
├── vite-env.d.ts                    # ImportMeta.env type declarations
│
├── types/
│   ├── aqi.ts                       # Domain types: AQICategory, PollutantDetail, LocationData…
│   └── database.ts                  # Supabase table row types
│
├── context/
│   ├── AirQualityContext.tsx        # Global state: location, telemetry, tabs, favorites
│   ├── AlertContext.tsx             # AQI alert threshold state
│   └── LanguageContext.tsx          # i18n: language detection, t() helper, persistence
│
├── i18n/
│   └── translations.ts             # 7-language dictionary (en/hi/bn/ta/te/mr/gu)
│
├── services/
│   ├── aiAssistantService.ts        # 6-tier AI cascade: proxy → Gemini → Groq → Ollama → Llama → offline
│   ├── emailService.ts              # Client dispatcher for automated SMTP email alerts
│   ├── openMeteoService.ts          # Open-Meteo Air Quality API + 5-min in-memory cache
│   ├── weatherService.ts            # Open-Meteo Weather API (temperature, humidity, wind)
│   ├── waqiService.ts               # WAQI station API + map tile URLs
│   ├── geocodingService.ts          # Open-Meteo geocoding + OSM Nominatim reverse geocode
│   ├── mlPredictionService.ts       # Exponential smoothing AQI predictor + Z-score anomaly detection
│   ├── exportService.ts             # Canvas 1200×630 PNG social card generation (cross-browser)
│   ├── supabaseService.ts           # Supabase CRUD: favorites, alerts, community reports + localStorage fallback
│   └── speechService.ts            # Web Speech API TTS / STT wrapper
│
├── utils/
│   ├── alertEmailTemplate.ts        # Responsive HTML email template for automated warnings
│   ├── aqiCalculator.ts             # AQI_CATEGORIES map, getAQICategory(), formatPollutant()
│   ├── formatters.ts                # formatTime(), formatDateShort(), calculatePercentageChange()
│   └── logger.ts                    # Production-safe logger that silences console output in prod
│
└── components/
    ├── layout/
    │   ├── Navbar.tsx               # Sticky header: search, tabs, language selector, theme toggle
    │   ├── Footer.tsx               # Atmospheric footer with i18n tagline
    │   ├── LanguageSelector.tsx     # Dropdown language picker with native script labels
    │   ├── SavedLocationsModal.tsx  # Modal & manager for saved monitored cities with live AQI
    │   ├── NotificationCenterModal.tsx # Centralized notification panel with unread badge counter
    │   ├── DiwaliBanner.tsx         # Seasonal notification banner (toggled in App.tsx)
    │   └── ErrorBoundary.tsx        # React class ErrorBoundary — prevents blank-screen crashes
    ├── dashboard/
    │   ├── HeroAqiCard.tsx          # Primary AQI hero: live gauge, WHO comparison, quick actions
    │   ├── PollutantGrid.tsx        # 6-pollutant breakdown grid vs WHO limits
    │   └── WeatherCard.tsx          # Google Weather-style card with animated sky + clouds
    ├── analytics/
    │   ├── HistoricalTracker.tsx    # 7-day hourly chart + anomaly detection table
    │   └── ForecastView.tsx         # 5-day daily trend chart + 12-hour ML predictions
    ├── comparison/
    │   └── LocationComparator.tsx   # Side-by-side multi-city AQI comparison
    ├── health/
    │   └── HealthAdvisoryCard.tsx   # Clinical advisories: exercise, masks, purifiers, vulnerable groups
    ├── map/
    │   └── AirQualityMap.tsx        # Leaflet interactive map with WAQI overlay
    └── bonus/
        ├── BreatheAiChat.tsx        # Full-screen AI chat modal with voice I/O
        ├── ShareCardModal.tsx       # Social sharing: PNG download + 6 platform buttons
        ├── SmartAlertModal.tsx      # AQI threshold alert configuration
        ├── CleanAirFinder.tsx       # Escape planner: finds cleaner-air nearby cities
        └── PollutionLeaderboard.tsx # Ranked pollution table: worst to cleanest
```

### Data Flow

```
Browser → AirQualityContext
           ├── openMeteoService  → Open-Meteo Air Quality API (hourly, 7d history, 5d forecast)
           ├── weatherService    → Open-Meteo Weather API (temperature, wind, humidity)
           └── waqiService       → WAQI Geo Feed API (ground station AQI)

BreatheAI Chat → aiAssistantService
  Tier 1: POST /api/breathe-ai  (Vercel Edge / Netlify Function / Vite dev proxy)
    └── Groq → Gemini → Ollama → Llama
  Tier 2: Direct Gemini fetch (browser CORS)
  Tier 3: Direct Groq fetch   (browser CORS)
  Tier 4: Direct Ollama fetch (browser — blocked by CORS, server-side only)
  Tier 5: Direct Llama fetch  (OpenAI-compatible endpoint)
  Tier 6: Smart offline contextual engine (typo-tolerant keyword matching)
```

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### 1. Clone & install

```bash
git clone https://github.com/your-org/breathe-ai.git
cd breathe-ai
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Then fill in your keys — see Environment Variables section below
```

### 3. Run development server

```bash
npm run dev
# → http://localhost:3000
```

### 4. Build for production

```bash
npm run build        # TypeScript check + Vite bundle
npm run preview      # Locally preview the built dist/
```

---

## Environment Variables

Create a `.env` file in the project root (never commit this file):

```dotenv
# ── Required ────────────────────────────────────────────────────────────────

# WAQI Air Quality Map Tiles & Station API
# Free key: https://aqicn.org/data-platform/token/
VITE_WAQI_TOKEN=your_waqi_token_here

# Google Gemini (AI Tier 2 — direct browser + server proxy)
# Free key: https://aistudio.google.com/app/apikey
VITE_GEMINI_API_KEY=your_gemini_key_here

# Groq Cloud (AI Tier 1 primary)
# Free key: https://console.groq.com/keys
GROQ_LLM_API_KEY=your_groq_key_here   # server-side proxy
VITE_GROQ_API_KEY=your_groq_key_here  # client-side direct (browser CORS)

# Supabase (favorites, alerts, community reports)
# Free project: https://supabase.com/dashboard
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# ── Optional: Ollama Fallback (AI Tier 3) ───────────────────────────────────
OLLAMA_API_KEY=your_ollama_key_here
VITE_OLLAMA_API_KEY=your_ollama_key_here
OLLAMA_BASE_URL=https://ollama.com/v1
VITE_OLLAMA_BASE_URL=https://ollama.com/v1
OLLAMA_MODEL=deepseek-v4.1-flash
VITE_OLLAMA_MODEL=deepseek-v4.1-flash

# ── Optional: Custom Llama / OpenAI-compatible LLM (AI Tier 4) ──────────────
# Works with Groq, Together AI, OpenRouter, Cerebras, Fireworks, etc.
# VITE_LLAMA_API_KEY=your_llama_api_key
# VITE_LLAMA_BASE_URL=https://api.groq.com/openai/v1
# VITE_LLAMA_MODEL=llama-3.3-70b-versatile
```

> **Security note:** `GROQ_LLM_API_KEY` and `VITE_GEMINI_API_KEY` are exposed to the browser bundle when prefixed with `VITE_`. For production use, prefer routing all AI calls exclusively through the serverless proxy (`/api/breathe-ai`) and setting only the non-`VITE_` server-side variables.

---

## AI Provider Failover Architecture

The AI assistant uses a **6-tier automatic cascade** — if any tier fails (network error, rate limit, CORS block), the next tier is tried immediately with no visible delay to the user.

| Tier | Provider | Routing | Model |
|------|----------|---------|-------|
| 1 | **Serverless Proxy** | `/api/breathe-ai` (Vercel/Netlify/Cloudflare) | Groq → Gemini → Ollama → Llama |
| 2 | **Google Gemini** | Direct browser fetch | `gemini-3.1-flash-lite` → `gemini-3.5-flash-lite` |
| 3 | **Groq Cloud** | Direct browser fetch | `qwen/qwen3.8-27b` |
| 4 | **Ollama** | Server-side only (CORS blocked in browser) | `deepseek-v4.1-flash` |
| 5 | **Custom Llama** | OpenAI-compatible endpoint | `llama-3.3-70b-versatile` |
| 6 | **Offline Engine** | In-process keyword matching | Typo-tolerant contextual responses |

> **Ollama note:** `https://ollama.com/v1` blocks cross-origin preflight requests (CORS). In the browser, Ollama is only reached when the serverless proxy is active. In local development, the Vite dev-server proxy plugin at `vite.config.ts` handles this transparently.

---

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel --prod
```

The `/api/breathe-ai` route is handled by [`functions/api/breathe-ai.ts`](functions/api/breathe-ai.ts) (Cloudflare Pages format, also compatible with Vercel serverless).

Set all environment variables in the **Vercel Dashboard → Project → Settings → Environment Variables**.

### Netlify

The [`netlify.toml`](netlify.toml) is pre-configured:

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/api/breathe-ai"
  to   = "/.netlify/functions/breathe-ai"
  status = 200
```

Deploy:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Self-hosted (Docker / VPS)

```bash
npm run build
# Serve the dist/ directory with any static file server:
npx serve dist
```

---

## Internationalization (i18n)

BreatheAI supports **7 languages** out of the box:

| Code | Language | Native Script |
|------|----------|---------------|
| `en` | English | English |
| `hi` | Hindi | हिन्दी |
| `bn` | Bengali | বাংলা |
| `ta` | Tamil | தமிழ் |
| `te` | Telugu | తెలుగు |
| `mr` | Marathi | मराठी |
| `gu` | Gujarati | ગુજરાતી |

**Auto-detection**: On first load, `LanguageContext` reads `navigator.language` and maps it to the closest supported language. The choice is persisted in `localStorage` under the key `breathe-lang`.

**Adding a new language**: Edit [`src/i18n/translations.ts`](src/i18n/translations.ts), add a new entry to the `SUPPORTED_LANGUAGES` array and `translations` record, then register the browser locale prefix in `detectInitialLanguage()` inside [`src/context/LanguageContext.tsx`](src/context/LanguageContext.tsx).

---

## External APIs & Data Sources

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| [Open-Meteo Air Quality](https://open-meteo.com/en/docs/air-quality-api) | Real-time + historical + forecast AQI, PM2.5, PM10, NO₂, O₃, SO₂, CO | ✅ Unlimited |
| [Open-Meteo Weather](https://open-meteo.com/en/docs) | Temperature, humidity, wind speed/direction, weather code | ✅ Unlimited |
| [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api) | City search by name | ✅ Unlimited |
| [WAQI](https://waqi.info/) | Ground station AQI + map tile overlays | ✅ Free key |
| [OSM Nominatim](https://nominatim.openstreetmap.org/) | Reverse geocoding (lat/lon → city name) | ✅ Unlimited |
| [Google Gemini](https://ai.google.dev/) | AI conversational assistant | ✅ Free quota |
| [Groq Cloud](https://groq.com/) | AI conversational assistant | ✅ Free quota |
| [Supabase](https://supabase.com/) | Favorites, alerts, community reports storage | ✅ Free tier |

---

## Scripts

```bash
npm run dev       # Start Vite dev server at http://localhost:3000
npm run build     # tsc type-check + Vite production bundle → dist/
npm run preview   # Locally preview dist/ at http://localhost:4173
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 + TypeScript 5.7 |
| **Build tool** | Vite 6.1 with manual chunk splitting |
| **Styling** | Tailwind CSS 3.4 + custom CSS animations |
| **Charts** | Recharts 2 |
| **Maps** | React-Leaflet 4 + Leaflet 1.9 |
| **Icons** | Lucide React |
| **Database** | Supabase JS v2 |
| **Social card** | HTML5 Canvas (cross-browser `roundRect` polyfill) |
| **Speech** | Web Speech API (SpeechSynthesis + SpeechRecognition) |
| **AI** | Google Gemini, Groq (Qwen/Llama), Ollama, OpenAI-compatible |
| **Deployment** | Vercel / Netlify / Cloudflare Pages |

---

## Contributing

Contributions are welcome. Please follow this workflow:

1. **Fork** the repository and create a feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. **Code** your changes. Make sure the TypeScript compiler and linter are happy:
   ```bash
   npm run build
   ```
3. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add ozone forecast overlay to map
   fix: resolve canvas roundRect crash on iOS Safari
   docs: update API environment variables table
   ```
4. **Push** and open a **Pull Request** against `main`. Fill in the PR template.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guidelines.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with 🌿 for cleaner air and healthier days. <br/>
**Breathe Smarter. Live Better.**

</div>

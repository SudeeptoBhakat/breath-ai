# BreatheAI — Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

---

## [1.4.0] — 2026-11-09

### Added
- **Multilingual i18n engine** — 7 languages: English, Hindi (हिन्दी), Bengali (বাংলা), Tamil (தமிழ்), Telugu (తెలుగు), Marathi (मराठी), Gujarati (ગુજરાતી).
- `LanguageContext` with browser locale auto-detection and `localStorage` persistence.
- `LanguageSelector` component in the Navbar header.
- `BreatheAiChat` language selector now exposes Telugu, Marathi, and Gujarati in addition to Hindi, Bengali, and Tamil.
- BreatheAI Chat auto-syncs its AI response language when the app-level language is changed via the Navbar selector.
- Speech synthesis voice locale extended to Telugu (`te-IN`), Marathi (`mr-IN`), and Gujarati (`gu-IN`).
- `Footer` now renders tagline and rights text from the i18n translation dictionary.
- `HealthAdvisoryCard` headers and section titles now consume `useLanguage()`.

### Changed
- `HealthAdvisoryCard` title reads `health.title` and `health.subtitle` from translations instead of hardcoded English strings.
- `Footer` section heading uses `footer.natureTech` translation key.

---

## [1.3.0] — 2026-11-09

### Added
- **Social sharing system** in `ShareCardModal`: 1-click platform buttons for WhatsApp, X (Twitter), Facebook, Instagram (native mobile share + desktop PNG download), Email (`mailto:`), and Copy Text with animated checkmark.
- High-resolution 1200×630 PNG social card download from canvas.
- `ErrorBoundary` React class component wrapping `ShareCardModal` and the entire app root.

### Fixed
- **Blank screen on share button click** — caused by uncaught `TypeError: ctx.roundRect is not a function` on iOS Safari / older Chrome. Fixed by implementing a cross-browser `drawRoundRect` polyfill in `exportService.ts`.
- Null-safety for all `current.pollutants.*` accesses in `generateSocialCardPng` to prevent crashes when partial data is received.
- `ShareCardModal` converted from `React.lazy()` to a direct static import in `App.tsx` to eliminate lazy-load race conditions on slow connections.

---

## [1.2.0] — 2026-11-09

### Added
- **Google Weather App-style `WeatherCard`** with dynamic sky backgrounds (Sunny, Partly Cloudy, Overcast, Hazy/Smog, Rainy, Night) driven by real Open-Meteo weather codes.
- CSS keyframe animations: `cloudDriftSlow`, `cloudDriftMedium`, `cloudDriftFast` (3-layer parallax moving clouds), `sunPulseGlow`, `sunRaysSlowSpin`, `raindropFall`, `starTwinkle`.
- Glanceable Material You metric tiles: wind speed, humidity, and thermal inversion indicator.
- Collapsible boundary-layer physics panel (hides academic detail by default).

### Changed
- Replaced previous static atmospheric dispersion card layout with the new animated weather card.

---

## [1.1.0] — 2026-11-09

### Added
- **6-tier AI failover cascade** in `aiAssistantService.ts`:
  1. Serverless proxy (`/api/breathe-ai`)
  2. Direct Google Gemini (`gemini-3.1-flash-lite` → `gemini-3.5-flash-lite`)
  3. Direct Groq Cloud (`qwen/qwen3.8-27b`)
  4. Ollama via proxy (`deepseek-v4.1-flash`)
  5. Custom Llama / OpenAI-compatible endpoint
  6. Smart typo-tolerant contextual offline engine
- Vite dev-server proxy plugin (`localBreatheAiProxy`) in `vite.config.ts` with the same 4-provider cascade (Groq → Gemini → Ollama → Llama).
- Cloudflare Pages serverless function at `functions/api/breathe-ai.ts`.
- Netlify function at `netlify/functions/breathe-ai.ts` with `netlify.toml` redirect rule.
- `OLLAMA_API_KEY`, `VITE_OLLAMA_*`, and optional `VITE_LLAMA_*` environment variables.
- `vite-env.d.ts` type declarations for `ImportMetaEnv`.

### Fixed
- Gemini `gemini-1.5-flash` returned HTTP 404 (deprecated model). Updated to `gemini-3.1-flash-lite` with `gemini-3.5-flash-lite` fallback.
- Offline fallback engine no longer returns canned repetitive responses. Now pattern-matches the actual query (exercise, family, masks, purifiers, AQI values) with contextual, typo-tolerant replies.

---

## [1.0.0] — 2026-10-15

### Added
- Initial production release.
- Real-time AQI dashboard for global cities (default: New Delhi).
- 7-day historical tracking and 5-day forecast powered by Open-Meteo.
- Interactive Leaflet map with WAQI tile overlays.
- US EPA + CPCB AQI spectrum health advisory card.
- Location comparator and pollution leaderboard.
- Clean air haven finder.
- Supabase-backed saved locations and AQI threshold alerts with localStorage offline fallback.
- BreatheAI conversational assistant (Gemini API).
- Light / dark theme toggle with `localStorage` persistence.
- Vite 6 build with manual code splitting for Recharts, Leaflet, and Lucide bundles.

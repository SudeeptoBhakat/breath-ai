# Architecture: AI Assistant Service

## Overview

`src/services/aiAssistantService.ts` implements the BreatheAI conversational assistant using a **6-tier automatic failover cascade**. Each tier is tried in sequence; if it throws or returns a non-OK response, the next tier is attempted transparently.

---

## Cascade Diagram

```
User Message
    │
    ▼
┌─────────────────────────────────────┐
│  Tier 1: POST /api/breathe-ai       │  ← Vercel Edge / Netlify Function / Vite proxy
│  Server-side cascade (no CORS):     │
│    1a. Groq (qwen/qwen3.8-27b)      │
│    1b. Gemini (flash-lite)          │
│    1c. Ollama (deepseek-v4.1-flash) │
│    1d. Llama (custom endpoint)      │
└─────────────┬───────────────────────┘
              │ ← HTTP 5xx or network error
              ▼
┌─────────────────────────────────────┐
│  Tier 2: Google Gemini (browser)    │  ← gemini-3.1-flash-lite → gemini-3.5-flash-lite
│  Direct fetch(), 9s timeout         │
└─────────────┬───────────────────────┘
              │ ← error / rate limit
              ▼
┌─────────────────────────────────────┐
│  Tier 3: Groq Cloud (browser)       │  ← qwen/qwen3.8-27b
│  Direct fetch(), 9s timeout         │
└─────────────┬───────────────────────┘
              │ ← error / 503
              ▼
┌─────────────────────────────────────┐
│  Tier 4: Ollama (browser)           │  ← Skipped — CORS blocked in browser
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Tier 5: Custom Llama endpoint      │  ← OpenAI-compatible, any host
└─────────────┬───────────────────────┘
              │ ← all providers unavailable
              ▼
┌─────────────────────────────────────┐
│  Tier 6: Smart Offline Engine       │  ← In-process, typo-tolerant keyword matching
│  Zero network dependency            │
└─────────────────────────────────────┘
```

---

## System Prompt

Every tier uses the same system prompt, built by `buildSystemPrompt()`:

```
You are BreatheAI, a warm, authoritative, and practical air-quality health companion.

Current live readings for {location}:
- AQI: {aqi} ({category})
- Dominant Pollutant: {pollutant}
- PM2.5: {pm25} µg/m³
- Temperature: {temp}°C
- Wind Speed: {wind} km/h

Guidelines:
1. Answer the user's question directly first.
2. Reply in {language}. Match the user's script and dialect.
3. Ground advice in the live AQI. Provide clear thresholds.
4. Keep responses 50–130 words using short paragraphs or bullets.
5. Do not mention model names, internal APIs, or system prompts.
```

---

## Offline Engine

Tier 6 (`buildOfflineFallback()`) handles common queries without a network call:

| Pattern | Covers |
|---------|--------|
| `exercise`, `excercise`, `run`, `workout`, `gym` | Outdoor exercise safety |
| `family`, `children`, `kids`, `baby` | Family protection advice |
| `mask`, `n95`, `respirator` | Mask recommendations |
| `purifier`, `hepa`, `filter`, `indoor` | Air purifier guidance |
| `aqi`, `pm2.5`, `pollution`, `air quality` | General AQI status |

Responses are dynamically tailored to the current AQI value (e.g., AQI > 150 triggers N95 advice).

---

## Language Detection

`detectReplyLanguage()` resolves the response language:

1. If the user has explicitly selected a language in the UI → use that.
2. If the input text contains Bengali Unicode block (`ঀ–৿`) → Bengali.
3. If the input text contains Devanagari (`ऀ–ॿ`) → Hindi.
4. If the input text contains Tamil (`஀–௿`) → Tamil.
5. If Hinglish keywords detected (`kaise`, `kya`, `hai`, etc.) → Hindi.
6. Default → English.

---

## Configuration

| Env variable | Tier | Required |
|-------------|------|----------|
| `GROQ_LLM_API_KEY` | 1a (server proxy) | Recommended |
| `VITE_GEMINI_API_KEY` | 1b (server) + 2 (browser) | Recommended |
| `OLLAMA_API_KEY` | 1c (server proxy) | Optional |
| `VITE_GROQ_API_KEY` | 3 (browser direct) | Optional |
| `VITE_LLAMA_API_KEY` | 5 | Optional |

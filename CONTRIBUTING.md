# Contributing to BreatheAI

Thank you for your interest in contributing! BreatheAI is an open project — bug reports, feature ideas, translations, and code improvements are all equally valued.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Branch & Commit Conventions](#branch--commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Adding a Language](#adding-a-language)
- [Adding an AI Provider](#adding-an-ai-provider)
- [Code Style](#code-style)
- [Architecture Decisions](#architecture-decisions)

---

## Code of Conduct

Be respectful and constructive. We follow the [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

---

## Getting Started

```bash
# 1. Fork, then clone your fork
git clone https://github.com/YOUR_USERNAME/breathe-ai.git
cd breathe-ai

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your own API keys (see README for details)

# 4. Start dev server
npm run dev
```

---

## Branch & Commit Conventions

### Branch naming

| Prefix | Use case |
|--------|----------|
| `feat/` | New feature |
| `fix/` | Bug fix |
| `docs/` | Documentation only |
| `refactor/` | Code restructuring with no behaviour change |
| `perf/` | Performance improvement |
| `test/` | Adding or fixing tests |
| `chore/` | Tooling, CI, dependency updates |

Example: `feat/add-pm10-forecast-chart`

### Commit messages — Conventional Commits

```
<type>(scope): <short imperative description>

[optional body]

[optional footer — e.g. Closes #42]
```

Examples:
```
feat(ai): add Cerebras as Tier 5 LLM fallback
fix(canvas): resolve roundRect crash on iOS 15 Safari
docs(readme): add self-hosted Docker deployment section
refactor(context): split AirQualityContext into smaller hooks
```

---

## Pull Request Process

1. Make sure `npm run build` exits with **code 0** (no TypeScript errors).
2. Keep PRs focused: one logical change per PR.
3. Update the `README.md` and relevant `docs/` pages if your change affects public behaviour or configuration.
4. Fill in the PR description: **What** changed, **Why**, and any **Testing steps**.
5. PRs are merged by squash-merge to keep main history clean.

---

## Issue Reporting

Use GitHub Issues. Please include:

- **Environment**: OS, browser, device.
- **Steps to reproduce** the problem.
- **Expected vs actual** behaviour.
- **Screenshots / console errors** where applicable.

For security vulnerabilities, do **not** open a public issue — email the maintainer directly.

---

## Adding a Language

1. Open [`src/i18n/translations.ts`](src/i18n/translations.ts).
2. Add your language code to `SupportedLanguage` (e.g., `'pa'` for Punjabi).
3. Add a `LanguageMeta` entry to `SUPPORTED_LANGUAGES`:
   ```ts
   { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', shortLabel: 'ਪੰ', flag: '🇮🇳' }
   ```
4. Add a full translation dictionary under `translations.pa = { ... }`. Copy the `en` block as a starting template.
5. In [`src/context/LanguageContext.tsx`](src/context/LanguageContext.tsx), add the browser locale prefix to `detectInitialLanguage()`:
   ```ts
   if (browser.startsWith('pa')) return 'pa';
   ```
6. Submit a PR with the title `feat(i18n): add Punjabi (pa) language support`.

---

## Adding an AI Provider

The cascade lives in [`src/services/aiAssistantService.ts`](src/services/aiAssistantService.ts) and [`vite.config.ts`](vite.config.ts) (dev proxy) / [`functions/api/breathe-ai.ts`](functions/api/breathe-ai.ts) (production serverless).

To add a new provider:

1. Create an `async function callMyProvider(...)` that returns `Promise<string>` and throws on failure.
2. Insert a `try/catch` block into the cascade in `askBreatheAI()`, ordered by priority.
3. Add the corresponding `VITE_MYPROVIDER_API_KEY` / `MYPROVIDER_API_KEY` variables to `.env.example` with a comment.
4. Add the same call in `vite.config.ts` (Vite dev proxy) and `functions/api/breathe-ai.ts` (serverless).

---

## Code Style

- **TypeScript strict mode** is enabled. No `any` without a comment explaining why.
- **Tailwind CSS** for all styling. No inline `style=` props except for dynamic runtime values (e.g., AQI colour tokens).
- **React functional components** only. No class components except `ErrorBoundary` (required by React's error boundary API).
- Keep component files under **400 lines**. Split into sub-components or hooks if approaching that limit.
- All `useEffect` calls must list correct dependencies. Run `npm run build` to surface exhaustive-deps warnings treated as errors by TypeScript.

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Vite over CRA | Zero-config ESM, instant HMR, manual chunk splitting for large deps (Recharts, Leaflet, Lucide) |
| Open-Meteo (no key required) | Removes friction for contributors; avoids rate-limit pain during development |
| AI 6-tier cascade | Maximises uptime across free-tier quotas; graceful offline degradation |
| Supabase + localStorage fallback | Zero backend for contributors without Supabase; full functionality preserved offline |
| `ErrorBoundary` wrapping `ShareCardModal` | Canvas `roundRect` crashes on older mobile WebViews; boundary prevents full page unmount |
| `LanguageContext` with `localStorage` | Instant language restore on page reload without a server roundtrip |
| Lazy-loaded tabs | Keeps initial JS bundle under 400 kB gzipped; heavy libs (Recharts, Leaflet) only load when needed |

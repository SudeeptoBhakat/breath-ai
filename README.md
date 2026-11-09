# 🪔 BreatheBetter (PranaAir) — Real-Time Air Quality Intelligence Platform
> **Theme:** Technology for Cleaner Air — *Breathe Better, Build Smarter*  
> **Challenge:** LETS CODE DIWALI CHALLENGE 2026 🪔  
> **Submission URL:** [Lets Code Google Form](https://forms.gle/8ck7stXe8W61U2t88)

---

## 🌟 Overview
**BreatheBetter** is a production-grade, full-stack Air Quality Intelligence Platform designed to empower citizens, vulnerable health groups, and environmental researchers with actionable, real-time air quality telemetry.

During Diwali and the post-monsoon winter transition, severe particulate accumulation, thermal boundary-layer inversions, and celebratory emissions create life-threatening smog hotspots across urban centers. BreatheBetter transforms complex atmospheric chemistry data into clear, life-saving visual insights.

---

## 🚀 Key Highlights & Architectural Strengths

- **100% Authentic Public Telemetry:** Zero synthetic or mock data. Powered by European **Copernicus Atmosphere Monitoring Service (CAMS)**, **NOAA Global Forecast System (GFS)** via Open-Meteo, and **WAQI / CPCB** ground monitoring stations.
- **Geospatial Intelligence:** Interactive OpenStreetMap/CartoDB map with dynamic color-coded SVG station pins, coordinate sampling, and pollution hotspot filters.
- **AI-Powered Environmental Assistant (BreatheAI):** Context-aware conversational AI that ingests live telemetry and answers questions via speech-to-text and text-to-speech.
- **Predictive ML Analytics:** Auto-regressive exponential smoothing with diurnal cycle weighting (12-hour trajectory) and statistical Z-Score anomaly detection ($Z > 2.0\sigma$).
- **Diwali 2026 Special Module:** Smog dispersion physics, N95 vs surgical mask filtration breakdown, and eco-celebration safeguards.
- **Universal Zero-Cost Cloud Stack:** React 19, TypeScript, Tailwind CSS, Leaflet, Recharts, and Supabase (PostgreSQL) with instant offline-first fallback. Ready for free 1-click deployment on **Vercel** or **Netlify**.

---

## 📋 Features Checklist (100% Implemented)

### ✅ Mandatory Features (Section 3)
| Feature | Implementation Details | Status |
| :--- | :--- | :---: |
| **A. Live AQI Dashboard** | Real-time US EPA & Indian CPCB AQI (0–500 scale), color-coded severity badges, full pollutant telemetry (PM2.5, PM10, $\text{NO}_2$, $\text{SO}_2$, $\text{CO}$, $\text{O}_3$, Dust, UV Index), exact last-updated timestamp, and data source badges. | ✅ Done |
| **B. Interactive Air Quality Map** | Leaflet + React-Leaflet interactive map with custom color-coded station pins, coordinate click-sampling, reverse geocoding, and pollution hotspot toggle. | ✅ Done |
| **C. Historical Pollution Tracker** | 24h, 48h, and 7-day historical curves, PM2.5 vs PM10 correlation charts, daily pollution aggregates, rate-of-change percentages ($\pm\%$), and automated spike detection with meteorological reasoning. | ✅ Done |
| **D. Location Comparison** | Side-by-side comparator for 2 to 4 global cities, difference metrics, grouped pollutant bar charts, and automated **"Clean Air Winner 🏆"** badge designation. | ✅ Done |
| **E. Health & Safety Dashboard** | Actionable lifestyle advisories for outdoor cardio, home window ventilation, certified N95 respirators, and HEPA purifiers. Dedicated guides for children, asthmatics, and elderly. Complete AQI spectrum table. | ✅ Done |
| **F. AQI Forecast** | 72-hour to 5-day hourly atmospheric chemistry forecast (CAMS/NOAA), diurnal cycle visualization (morning smog peak vs afternoon solar mixing), and clear visual distinction between simulated forecasts and ground telemetry. | ✅ Done |

### 🚀 Bonus Features (Section 4 - All 13 Implemented!)
| Bonus Feature | Implementation Details | Status |
| :--- | :--- | :---: |
| **1. AI AQI Assistant (BreatheAI)** | Context-aware AI chatbot understanding current city telemetry, with pre-configured health prompts and Gemini 1.5 Flash support. | ✅ Done |
| **2. Smart AQI Alerts** | User-defined threshold notifications with Web Audio synthesized chime and browser Push Notifications API. | ✅ Done |
| **3. ML-Based Prediction** | Auto-regressive Holt-Winters smoothing model predicting next 12 hours with confidence intervals and weather weighting. | ✅ Done |
| **4. Anomaly Detection** | Rolling-window Z-Score statistical anomaly detector identifying burst emission events ($Z > 2.0\sigma$). | ✅ Done |
| **5. Pollution Hotspot Filter** | 1-click map filter isolating severe/hazardous zones. | ✅ Done |
| **6. Location-Based AQI** | HTML5 Geolocation API with reverse geocoding for instant 1-click "Locate Me" tracking. | ✅ Done |
| **7. Clean Air Sanctuary Finder** | Scans and ranks regional retreats (hill stations, coastal corridors) with percentage cleaner air calculations. | ✅ Done |
| **8. AQI Sharing Cards** | High-resolution HTML5 Canvas social card generator exportable to branded PNG for WhatsApp, X (Twitter), and LinkedIn. | ✅ Done |
| **9. Pollution Leaderboard** | Live global and Indian metro rankings for most polluted vs cleanest cities. | ✅ Done |
| **10. Voice Assistant** | Web Speech Recognition (voice input) + Web Speech Synthesis (read-aloud response). | ✅ Done |
| **11. Multi-API Integration** | Open-Meteo Copernicus CAMS/NOAA + WAQI / CPCB ground stations + OpenStreetMap Nominatim. | ✅ Done |
| **12. Micro-Meteorology Context** | Explains thermal inversion risk, wind speed dispersion thresholds, and humidity binding. | ✅ Done |
| **13. Cloud Persistence & Offline Sync** | Supabase PostgreSQL schema with seamless LocalStorage offline fallback. | ✅ Done |

---

## 🛠️ Tech Stack & Architecture

```
Frontend:          React 19, TypeScript, Vite
Styling:           Tailwind CSS, Lucide Icons, Glassmorphism
Maps:              Leaflet, React-Leaflet, CartoDB Dark Matter / OSM
Data Visualization: Recharts (Area, Bar, Line, Composed)
Persistence:       Supabase (PostgreSQL) + LocalStorage Sync
Speech Engine:     Web Speech API (Recognition + Synthesis)
Audio Synthesizer: Web Audio API (Chimes)
Graphics Renderer: HTML5 Canvas 2D Context + Canvas Confetti
APIs Integrated:   Open-Meteo Air Quality, Open-Meteo Geocoding, Open-Meteo Forecast, WAQI, OSM Nominatim
Hosting:           Vercel / Netlify / GitHub Pages (100% Free)
```

---

## ⚡ Quick Start & Setup Instructions

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **pnpm**

### 2. Clone Repository & Install Dependencies
```bash
git clone https://github.com/your-username/breathe-better-prana-air.git
cd breathe-better-prana-air
npm install
```

### 3. Environment Configuration (Optional)
The platform operates **100% out-of-the-box** without any mandatory API keys!  
If you wish to configure your custom Supabase database, copy `.env.example`:
```bash
cp .env.example .env
```
Fill in the optional keys:
- `GROQ_LLM_API_KEY`: Groq key used only by the Cloudflare Pages Function. Never use a `VITE_` prefix for this key.
- `GROQ_MODEL`: Optional model override; defaults to `qwen/qwen3.8-27b`.
- `VITE_SUPABASE_URL`: Supabase Project URL (optional)
- `VITE_SUPABASE_ANON_KEY`: Supabase Anonymous Key (optional)
- `VITE_WAQI_TOKEN`: WAQI API Token (defaults to `demo`)

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> The local Vite server uses BreatheAI's offline guidance fallback. To test live Groq responses locally, run the app through Cloudflare Pages/Wrangler with the `GROQ_LLM_API_KEY` secret configured.

### 5. Production Build & Test
```bash
npm run build
npm run preview
```

---

## 🗄️ Database Setup (Supabase PostgreSQL)
If you wish to connect your online Supabase database:
1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run the schema file located at [`supabase/schema.sql`](./supabase/schema.sql).
4. Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`.

*Note: If no Supabase credentials are provided, BreatheBetter automatically uses a resilient, offline-first LocalStorage persistence engine with identical behavior.*

---

## 🌐 1-Click Free Deployment

### Deploy to Vercel
1. Push this repository to your GitHub account.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Leave framework preset as **Vite**, click **Deploy**. Your app is live with SSL and global edge CDN!

### Deploy to Netlify
1. Sign in to [Netlify](https://netlify.com) and click **"Add new site" -> "Import an existing project"**.
2. Select your repository. Build command: `npm run build`, Publish directory: `dist`.
3. Click **Deploy**.

### Deploy BreatheAI with Groq on Cloudflare Pages
1. Create a Cloudflare Pages project from this repository. Set build command to `npm run build` and output directory to `dist`.
2. In **Settings → Variables and Secrets**, add `GROQ_LLM_API_KEY` as an encrypted secret. Optionally add `GROQ_MODEL=qwen/qwen3.8-27b`.
3. Deploy. The included [`functions/api/breathe-ai.ts`](./functions/api/breathe-ai.ts) file is automatically served as `/api/breathe-ai` and keeps the Groq key server-side.

---

## 📚 Authentic Public APIs Integrated

1. **Open-Meteo Air Quality API**  
   *URL:* `https://air-quality-api.open-meteo.com/v1/air-quality`  
   *Models:* Copernicus Atmosphere Monitoring Service (CAMS) 11km Europe / 45km Global & NOAA GFS.  
   *Variables:* `us_aqi`, `pm2_5`, `pm10`, `carbon_monoxide`, `nitrogen_dioxide`, `sulphur_dioxide`, `ozone`, `dust`, `uv_index`.

2. **Open-Meteo Geocoding API**  
   *URL:* `https://geocoding-api.open-meteo.com/v1/search`  
   *Capabilities:* Instant worldwide city and coordinate search.

3. **Open-Meteo Weather API**  
   *URL:* `https://api.open-meteo.com/v1/forecast`  
   *Capabilities:* Surface wind speed, wind direction, temperature, and relative humidity for boundary-layer dispersion analysis.

4. **World Air Quality Index (WAQI) Project**  
   *URL:* `https://api.waqi.info/`  
   *Capabilities:* Physical ground monitoring stations (Central Pollution Control Board - CPCB India & EPA global feeds).

5. **OpenStreetMap Nominatim Reverse Geocoding**  
   *URL:* `https://nominatim.openstreetmap.org/reverse`  
   *Capabilities:* Reverse geocoding on map click and GPS coordinates.

---

## ⚖️ License & Credits
- Built under the **MIT License**.
- Developed with dedication for the **LETS CODE DIWALI CHALLENGE 2026 🪔**.
- All environmental data credits belong to Copernicus, NOAA, and CPCB.

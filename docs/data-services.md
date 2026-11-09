# Architecture: Data Services

## Open-Meteo Air Quality (`openMeteoService.ts`)

**Base URL:** `https://air-quality-api.open-meteo.com/v1/air-quality`

**Requires no API key.**

### What is fetched

| Parameter | Description |
|-----------|-------------|
| `current` | Instant readings: US AQI, European AQI, PM2.5, PM10, CO, NO₂, SO₂, O₃, dust, UV index, ammonia |
| `hourly` | Hourly readings for the same pollutants |
| `past_days=7` | 7 days of historical hourly data |
| `forecast_days=5` | 5 days of forward hourly data |

### Caching

A simple in-memory `Map` with a 5-minute TTL prevents redundant fetches when the user switches between tabs rapidly. The cache key is `"{lat2}_{lon2}"`.

### Output interfaces

```ts
AirQualityFetchResult {
  current:        CurrentAirQuality     // Live snapshot
  hourlyHistory:  HourlyReading[]       // Past 7 × 24 hours
  hourlyForecast: HourlyReading[]       // Next 5 × 24 hours
  dailyTrends:    DailyPollutionTrend[] // Aggregated daily min/max/avg
  spikes:         PollutionSpike[]      // Events where AQI rose > 40% in 2 hours
}
```

---

## Open-Meteo Weather (`weatherService.ts`)

**Base URL:** `https://api.open-meteo.com/v1/forecast`

Fetches current temperature, relative humidity, wind speed, wind direction, and WMO weather code for the selected location. The weather code is mapped to a human-readable description and an icon.

Data is merged into `CurrentAirQuality.weather` by `AirQualityContext` after both API calls complete.

---

## WAQI (`waqiService.ts`)

Used for two purposes:

1. **Ground station AQI overlay on the map** — tile URL:
   ```
   https://tiles.aqicn.org/tiles/{layer}/{z}/{x}/{y}.png?token={WAQI_TOKEN}
   ```

2. **Nearest ground station data** via geo feed:
   ```
   https://api.waqi.info/feed/geo:{lat};{lon}/?token={WAQI_TOKEN}
   ```

The geo feed provides station-name attribution, dominant pollutant, and AQI. When available, this supplements the Open-Meteo data.

---

## Geocoding (`geocodingService.ts`)

### Forward search
**API:** `https://geocoding-api.open-meteo.com/v1/search`
- Debounced in the Navbar search box (250 ms, handled by the component).
- Results cached in a `Map` keyed on the lowercase query string.

### Reverse geocoding
**API:** `https://nominatim.openstreetmap.org/reverse`
- Called when the user clicks "Locate me".
- Results cached by `"{lat3}_{lon3}"`.
- Gracefully falls back to `"Lat: X, Lon: Y"` if Nominatim is unreachable.

### Preset cities

Nine cities are hard-coded in `PRESET_CITIES` for instant selection without a network request:

| City | Country |
|------|---------|
| New Delhi | India |
| Mumbai | India |
| Bengaluru | India |
| Kolkata | India |
| Patna | India |
| Hyderabad | India |
| London | UK |
| New York | USA |
| Tokyo | Japan |

---

## Supabase (`supabaseService.ts`)

Provides persistent storage for three entity types. All operations **silently fall back to localStorage** when Supabase is unreachable or not configured.

| Entity | Supabase table | LocalStorage key |
|--------|---------------|-----------------|
| Saved locations | `user_favorites` | `breathe_better_favorites` |
| AQI alerts | `user_alerts` | `breathe_better_alerts` |
| Community reports | `community_reports` | `breathe_better_community_reports` |

The app uses a single hardcoded `userId = 'guest-user'`. To add multi-user support, integrate Supabase Auth and replace the guest ID with `supabase.auth.getUser()`.

---

## ML Prediction (`mlPredictionService.ts`)

Two pure-TypeScript algorithms — no ML framework dependency.

### AQI Trajectory Prediction

Algorithm: **Exponential smoothing + diurnal seasonality**

```
smoothed_t = α × aqi_t + (1 − α) × smoothed_{t−1}     (α = 0.35)

prediction_t+n = smoothed_t × 0.96 + hourly_seasonal_shift × weather_dampener
```

Weather dampener:
- Wind < 6 km/h → 1.15× (accumulation)
- Wind > 15 km/h → 0.88× (dispersal)
- Otherwise → 1.0

Confidence interval widens linearly: `±(5% + 2% × step)` of predicted value.

### Anomaly Detection

Algorithm: **12-hour rolling window Z-score**

```
z = (current_aqi − window_mean) / window_std_dev
```

| Z-score | Severity |
|---------|----------|
| ≥ 2.0, AQI > 100 | Moderate Spike |
| > 3.0 or AQI > 250 | Severe Surge |
| AQI > 350 | Emergency Inversion |

Returns the 6 most recent anomalies.

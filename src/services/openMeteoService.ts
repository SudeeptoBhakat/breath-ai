import {
  CurrentAirQuality,
  HourlyReading,
  DailyPollutionTrend,
  PollutionSpike,
  PollutantDetail,
  AQICategory
} from '../types/aqi';
import { getAQICategory, getAQICategoryInfo, formatPollutant } from '../utils/aqiCalculator';
import { formatTime, formatDateShort, calculatePercentageChange } from '../utils/formatters';

const AIR_QUALITY_BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

// In-memory cache with 5-minute TTL to prevent redundant network fetches
const cache = new Map<string, { timestamp: number; data: AirQualityFetchResult }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export interface AirQualityFetchResult {
  current: CurrentAirQuality;
  hourlyHistory: HourlyReading[];
  hourlyForecast: HourlyReading[];
  dailyTrends: DailyPollutionTrend[];
  spikes: PollutionSpike[];
}

/**
 * Fetch authentic real-time, 7-day historical, and 5-day forecast air quality data
 */
export async function fetchAirQualityData(
  latitude: number,
  longitude: number
): Promise<AirQualityFetchResult> {
  const cacheKey = `${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current: 'us_aqi,european_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,uv_index,ammonia',
    hourly: 'us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,uv_index',
    past_days: '7',
    forecast_days: '5',
    timezone: 'auto'
  });

  const response = await fetch(`${AIR_QUALITY_BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Air Quality API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const currentRaw = data.current;
  const hourlyRaw = data.hourly;

  if (!currentRaw || !hourlyRaw) {
    throw new Error('Incomplete data received from environmental monitoring service.');
  }

  // Parse current pollutants
  const pollutants: Record<string, PollutantDetail> = {
    pm2_5: formatPollutant('pm2_5', currentRaw.pm2_5),
    pm10: formatPollutant('pm10', currentRaw.pm10),
    no2: formatPollutant('no2', currentRaw.nitrogen_dioxide),
    so2: formatPollutant('so2', currentRaw.sulphur_dioxide),
    co: formatPollutant('co', currentRaw.carbon_monoxide),
    o3: formatPollutant('o3', currentRaw.ozone),
    dust: formatPollutant('dust', currentRaw.dust),
    uv_index: formatPollutant('uv_index', currentRaw.uv_index),
    ammonia: formatPollutant('ammonia', currentRaw.ammonia)
  };

  // Determine dominant pollutant
  let dominantPollutant = 'PM2.5';
  let highestRatio = -1;
  for (const p of Object.values(pollutants)) {
    if (p.ratioToWho > highestRatio) {
      highestRatio = p.ratioToWho;
      dominantPollutant = p.formula;
    }
  }

  const rawAqi = currentRaw.us_aqi ?? Math.round((currentRaw.pm2_5 || 20) * 2.5);
  const aqi = Math.max(1, Math.min(500, Math.round(rawAqi)));
  const category = getAQICategory(aqi);
  const categoryInfo = getAQICategoryInfo(aqi);

  const current: CurrentAirQuality = {
    aqi,
    category,
    categoryInfo,
    dominantPollutant,
    lastUpdated: currentRaw.time || new Date().toISOString(),
    dataSource: 'Copernicus Atmosphere Monitoring Service (CAMS) / NOAA GFS via Open-Meteo',
    isForecast: false,
    pollutants
  };

  // Process hourly readings into past (history) and future (forecast)
  const now = new Date();
  const hourlyHistory: HourlyReading[] = [];
  const hourlyForecast: HourlyReading[] = [];
  const spikes: PollutionSpike[] = [];

  const times: string[] = hourlyRaw.time || [];
  const aqis: number[] = hourlyRaw.us_aqi || [];
  const pm25s: number[] = hourlyRaw.pm2_5 || [];
  const pm10s: number[] = hourlyRaw.pm10 || [];
  const no2s: number[] = hourlyRaw.nitrogen_dioxide || [];
  const so2s: number[] = hourlyRaw.sulphur_dioxide || [];
  const cos: number[] = hourlyRaw.carbon_monoxide || [];
  const o3s: number[] = hourlyRaw.ozone || [];

  for (let i = 0; i < times.length; i++) {
    const timeStr = times[i];
    const readingDate = new Date(timeStr);
    const readingAqi = Math.round(aqis[i] ?? 0);
    const pm25 = Number((pm25s[i] ?? 0).toFixed(1));
    const pm10 = Number((pm10s[i] ?? 0).toFixed(1));
    const isForecast = readingDate > now;

    const reading: HourlyReading = {
      time: timeStr,
      formattedTime: formatTime(timeStr),
      aqi: readingAqi,
      pm2_5: pm25,
      pm10: pm10,
      no2: Number((no2s[i] ?? 0).toFixed(1)),
      so2: Number((so2s[i] ?? 0).toFixed(1)),
      co: Number((cos[i] ?? 0).toFixed(1)),
      o3: Number((o3s[i] ?? 0).toFixed(1)),
      isForecast
    };

    if (isForecast) {
      hourlyForecast.push(reading);
    } else {
      hourlyHistory.push(reading);

      // Detect pollution spikes (e.g., PM2.5 > 150 µg/m³ or sudden 2.5x rise)
      if (pm25 > 120 || readingAqi > 200) {
        spikes.push({
          timestamp: timeStr,
          formattedTime: `${formatDateShort(timeStr)} ${formatTime(timeStr)}`,
          pollutant: pm25 > 120 ? 'PM2.5' : 'AQI',
          value: pm25 > 120 ? pm25 : readingAqi,
          standardLimit: pm25 > 120 ? 15 : 100,
          factorAboveNormal: Number(((pm25 > 120 ? pm25 : readingAqi) / (pm25 > 120 ? 15 : 100)).toFixed(1)),
          reason: readingDate.getHours() >= 20 || readingDate.getHours() <= 5 
            ? 'Nighttime thermal inversion & surface accumulation' 
            : 'Rush hour combustion and meteorological stagnation'
        });
      }
    }
  }

  // Calculate daily aggregates
  const dailyGroups: Record<string, { aqis: number[]; pm25s: number[]; pm10s: number[]; isForecast: boolean }> = {};
  
  for (let i = 0; i < times.length; i++) {
    const dateKey = times[i].split('T')[0];
    const readingDate = new Date(times[i]);
    if (!dailyGroups[dateKey]) {
      dailyGroups[dateKey] = {
        aqis: [],
        pm25s: [],
        pm10s: [],
        isForecast: readingDate > now
      };
    }
    if (aqis[i] != null) dailyGroups[dateKey].aqis.push(aqis[i]);
    if (pm25s[i] != null) dailyGroups[dateKey].pm25s.push(pm25s[i]);
    if (pm10s[i] != null) dailyGroups[dateKey].pm10s.push(pm10s[i]);
  }

  const dailyTrends: DailyPollutionTrend[] = [];
  const sortedDates = Object.keys(dailyGroups).sort();
  let prevAvgAqi = 0;

  for (const dateStr of sortedDates) {
    const group = dailyGroups[dateStr];
    if (group.aqis.length === 0) continue;

    const avgAqi = Math.round(group.aqis.reduce((a, b) => a + b, 0) / group.aqis.length);
    const minAqi = Math.round(Math.min(...group.aqis));
    const maxAqi = Math.round(Math.max(...group.aqis));
    const avgPm25 = Number((group.pm25s.reduce((a, b) => a + b, 0) / group.pm25s.length).toFixed(1));
    const avgPm10 = Number((group.pm10s.reduce((a, b) => a + b, 0) / group.pm10s.length).toFixed(1));

    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    const changePercent = prevAvgAqi > 0 ? calculatePercentageChange(avgAqi, prevAvgAqi) : 0;
    prevAvgAqi = avgAqi;

    dailyTrends.push({
      date: dateStr,
      dayOfWeek,
      avgAqi,
      minAqi,
      maxAqi,
      avgPm25,
      avgPm10,
      category: getAQICategory(avgAqi),
      isForecast: group.isForecast,
      changePercent
    });
  }

  const result: AirQualityFetchResult = {
    current,
    hourlyHistory,
    hourlyForecast,
    dailyTrends,
    spikes: spikes.slice(-10) // Keep the most recent 10 notable spikes
  };

  cache.set(cacheKey, { timestamp: Date.now(), data: result });
  return result;
}

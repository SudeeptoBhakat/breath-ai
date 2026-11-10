import { getWeatherConditionName } from '../utils/formatters';
import { logger } from '../utils/logger';

const WEATHER_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

// In-memory cache with 5-minute TTL to prevent redundant weather fetches
const weatherCache = new Map<string, { timestamp: number; data: WeatherData }>();
const WEATHER_CACHE_TTL_MS = 5 * 60 * 1000;

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  weatherDescription: string;
  inversionRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
  ventilationIndex: 'Poor' | 'Moderate' | 'Good';
}

export async function fetchWeatherData(latitude: number, longitude: number): Promise<WeatherData | null> {
  const cacheKey = `${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < WEATHER_CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const params = new URLSearchParams({
      latitude: latitude.toFixed(4),
      longitude: longitude.toFixed(4),
      current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code',
      timezone: 'auto'
    });

    const response = await fetch(`${WEATHER_BASE_URL}?${params.toString()}`);
    if (!response.ok) return null;

    const data = await response.json();
    const cur = data.current;
    if (!cur) return null;

    const temp = cur.temperature_2m ?? 24;
    const humidity = cur.relative_humidity_2m ?? 60;
    const wind = cur.wind_speed_10m ?? 8;
    const dir = cur.wind_direction_10m ?? 0;
    const code = cur.weather_code ?? 0;

    // Environmental physics: low wind (< 7 km/h) + high humidity (> 70%) or cold temps (< 18°C) = severe thermal inversion & smog trapping
    let inversionRisk: WeatherData['inversionRisk'] = 'Low';
    let ventilationIndex: WeatherData['ventilationIndex'] = 'Good';

    if (wind < 5 && humidity > 75) {
      inversionRisk = 'Severe';
      ventilationIndex = 'Poor';
    } else if (wind < 9 && humidity > 60) {
      inversionRisk = 'High';
      ventilationIndex = 'Poor';
    } else if (wind < 14) {
      inversionRisk = 'Moderate';
      ventilationIndex = 'Moderate';
    }

    const result: WeatherData = {
      temperature: Math.round(temp),
      humidity: Math.round(humidity),
      windSpeed: Math.round(wind),
      windDirection: Math.round(dir),
      weatherCode: code,
      weatherDescription: getWeatherConditionName(code),
      inversionRisk,
      ventilationIndex
    };

    weatherCache.set(cacheKey, { timestamp: Date.now(), data: result });
    return result;
  } catch (error) {
    logger.warn('Weather service fetch error:', error);
    return null;
  }
}

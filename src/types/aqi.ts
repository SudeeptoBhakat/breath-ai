export type AQICategory = 
  | 'Good' 
  | 'Moderate' 
  | 'Unhealthy for Sensitive Groups' 
  | 'Unhealthy' 
  | 'Very Unhealthy' 
  | 'Hazardous';

export interface AQICategoryInfo {
  name: AQICategory;
  range: [number, number];
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
  healthImplications: string;
  activityRecommendations: {
    outdoorExercise: string;
    ventilation: string;
    maskRequired: boolean;
    airPurifier: string;
    sensitiveGroups: string;
  };
}

export interface PollutantDetail {
  code: 'pm2_5' | 'pm10' | 'no2' | 'so2' | 'co' | 'o3' | 'dust' | 'ammonia' | 'uv_index';
  name: string;
  formula: string;
  value: number;
  unit: string;
  category: 'Good' | 'Moderate' | 'Unhealthy' | 'Hazardous';
  whoLimit: number; // WHO 24-hour guideline limit
  ratioToWho: number; // e.g. 3.2x WHO limit
  description: string;
  healthEffects: string;
}

export interface CurrentAirQuality {
  aqi: number;
  category: AQICategory;
  categoryInfo: AQICategoryInfo;
  dominantPollutant: string;
  lastUpdated: string;
  dataSource: string;
  isForecast: boolean;
  pollutants: Record<string, PollutantDetail>;
  weather?: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    weatherCode: number;
    weatherDescription: string;
  };
}

export interface HourlyReading {
  time: string;
  formattedTime: string;
  aqi: number;
  pm2_5: number;
  pm10: number;
  no2?: number;
  so2?: number;
  co?: number;
  o3?: number;
  isForecast: boolean;
  anomaly?: boolean;
  anomalyScore?: number;
}

export interface DailyPollutionTrend {
  date: string;
  dayOfWeek: string;
  avgAqi: number;
  minAqi: number;
  maxAqi: number;
  avgPm25: number;
  avgPm10: number;
  category: AQICategory;
  isForecast: boolean;
  changePercent?: number; // % delta from previous day
}

export interface PollutionSpike {
  timestamp: string;
  formattedTime: string;
  pollutant: string;
  value: number;
  standardLimit: number;
  factorAboveNormal: number;
  reason: string;
}

export interface LocationData {
  id: string;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  country: string;
  countryCode: string;
  admin1?: string;
  elevation?: number;
  timezone?: string;
}

export interface AirQualityState {
  location: LocationData;
  current: CurrentAirQuality | null;
  hourlyHistory: HourlyReading[];
  hourlyForecast: HourlyReading[];
  dailyTrends: DailyPollutionTrend[];
  spikes: PollutionSpike[];
  sourceStation?: string;
  loading: boolean;
  error: string | null;
}

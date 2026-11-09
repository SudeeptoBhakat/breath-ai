export interface WaqiStationData {
  stationName: string;
  aqi: number;
  latitude: number;
  longitude: number;
  time: string;
  dominantPol: string;
  attributions: { name: string; url?: string }[];
  pollutants: {
    pm25?: number;
    pm10?: number;
    no2?: number;
    so2?: number;
    co?: number;
    o3?: number;
    temp?: number;
    humidity?: number;
    wind?: number;
  };
}

export const WAQI_TOKEN = (import.meta as any).env?.VITE_WAQI_TOKEN || '61db13bd96ce9064cf660e50aca7803d77ff2b1e';

/**
 * Returns the authentic WAQI Tile Layer URL for Leaflet
 * Valid layers: 'usepa-aqi', 'usepa-pm25', 'usepa-10', 'usepa-o3', 'usepa-no2', 'usepa-so2', 'usepa-co', 'asean-pm10'
 */
export function getWaqiTileUrl(layer: string = 'usepa-aqi'): string {
  return `https://tiles.aqicn.org/tiles/${layer}/{z}/{x}/{y}.png?token=${WAQI_TOKEN}`;
}

export async function fetchWaqiStation(lat: number, lon: number): Promise<WaqiStationData | null> {
  try {
    const url = `https://api.waqi.info/feed/geo:${lat.toFixed(4)};${lon.toFixed(4)}/?token=${WAQI_TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const json = await res.json();
    if (json.status !== 'ok' || !json.data) return null;

    const d = json.data;
    const iaqi = d.iaqi || {};

    return {
      stationName: d.city?.name || 'CPCB / DPCC Ground Monitoring Station',
      aqi: typeof d.aqi === 'number' ? d.aqi : parseInt(d.aqi, 10) || 120,
      latitude: d.city?.geo?.[0] ?? lat,
      longitude: d.city?.geo?.[1] ?? lon,
      time: d.time?.s || new Date().toISOString(),
      dominantPol: d.dominentpol || 'pm25',
      attributions: d.attributions || [],
      pollutants: {
        pm25: iaqi.pm25?.v,
        pm10: iaqi.pm10?.v,
        no2: iaqi.no2?.v,
        so2: iaqi.so2?.v,
        co: iaqi.co?.v,
        o3: iaqi.o3?.v,
        temp: iaqi.t?.v,
        humidity: iaqi.h?.v,
        wind: iaqi.w?.v
      }
    };
  } catch (err) {
    console.warn('WAQI station fetch error:', err);
    return null;
  }
}

export async function fetchWaqiHere(): Promise<WaqiStationData | null> {
  try {
    const url = `https://api.waqi.info/feed/here/?token=${WAQI_TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const json = await res.json();
    if (json.status !== 'ok' || !json.data) return null;

    const d = json.data;
    const iaqi = d.iaqi || {};

    return {
      stationName: d.city?.name || 'Local Ground Monitoring Station',
      aqi: typeof d.aqi === 'number' ? d.aqi : parseInt(d.aqi, 10) || 120,
      latitude: d.city?.geo?.[0] ?? 28.6139,
      longitude: d.city?.geo?.[1] ?? 77.2090,
      time: d.time?.s || new Date().toISOString(),
      dominantPol: d.dominentpol || 'pm25',
      attributions: d.attributions || [],
      pollutants: {
        pm25: iaqi.pm25?.v,
        pm10: iaqi.pm10?.v,
        no2: iaqi.no2?.v,
        so2: iaqi.so2?.v,
        co: iaqi.co?.v,
        o3: iaqi.o3?.v,
        temp: iaqi.t?.v,
        humidity: iaqi.h?.v,
        wind: iaqi.w?.v
      }
    };
  } catch (err) {
    console.warn('WAQI here fetch error:', err);
    return null;
  }
}

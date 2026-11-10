import { LocationData } from '../types/aqi';
import { logger } from '../utils/logger';

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export const PRESET_CITIES: LocationData[] = [
  {
    id: 'delhi',
    name: 'New Delhi',
    displayName: 'New Delhi, Delhi, India',
    latitude: 28.6139,
    longitude: 77.2090,
    country: 'India',
    countryCode: 'IN',
    admin1: 'Delhi',
    timezone: 'Asia/Kolkata'
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    displayName: 'Mumbai, Maharashtra, India',
    latitude: 19.0760,
    longitude: 72.8777,
    country: 'India',
    countryCode: 'IN',
    admin1: 'Maharashtra',
    timezone: 'Asia/Kolkata'
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    displayName: 'Bengaluru, Karnataka, India',
    latitude: 12.9716,
    longitude: 77.5946,
    country: 'India',
    countryCode: 'IN',
    admin1: 'Karnataka',
    timezone: 'Asia/Kolkata'
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    displayName: 'Kolkata, West Bengal, India',
    latitude: 22.5726,
    longitude: 88.3639,
    country: 'India',
    countryCode: 'IN',
    admin1: 'West Bengal',
    timezone: 'Asia/Kolkata'
  },
  {
    id: 'patna',
    name: 'Patna',
    displayName: 'Patna, Bihar, India',
    latitude: 25.5941,
    longitude: 85.1376,
    country: 'India',
    countryCode: 'IN',
    admin1: 'Bihar',
    timezone: 'Asia/Kolkata'
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    displayName: 'Hyderabad, Telangana, India',
    latitude: 17.3850,
    longitude: 78.4867,
    country: 'India',
    countryCode: 'IN',
    admin1: 'Telangana',
    timezone: 'Asia/Kolkata'
  },
  {
    id: 'london',
    name: 'London',
    displayName: 'London, Greater London, United Kingdom',
    latitude: 51.5074,
    longitude: -0.1278,
    country: 'United Kingdom',
    countryCode: 'GB',
    admin1: 'England',
    timezone: 'Europe/London'
  },
  {
    id: 'new-york',
    name: 'New York',
    displayName: 'New York, New York, United States',
    latitude: 40.7128,
    longitude: -74.0060,
    country: 'United States',
    countryCode: 'US',
    admin1: 'New York',
    timezone: 'America/New_York'
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    displayName: 'Tokyo, Japan',
    latitude: 35.6762,
    longitude: 139.6503,
    country: 'Japan',
    countryCode: 'JP',
    timezone: 'Asia/Tokyo'
  }
];

const searchCache = new Map<string, LocationData[]>();
const reverseCache = new Map<string, LocationData>();

export async function searchLocations(query: string): Promise<LocationData[]> {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  const cached = searchCache.get(q);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      name: query.trim(),
      count: '8',
      language: 'en',
      format: 'json'
    });

    const response = await fetch(`${GEOCODING_BASE_URL}?${params.toString()}`);
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.results || !Array.isArray(data.results)) return [];

    const results = data.results.map((item: {
      id?: number;
      name: string;
      latitude: number;
      longitude: number;
      country?: string;
      country_code?: string;
      admin1?: string;
      elevation?: number;
      timezone?: string;
    }) => {
      const parts = [item.name];
      if (item.admin1 && item.admin1 !== item.name) parts.push(item.admin1);
      if (item.country) parts.push(item.country);

      return {
        id: `${item.id || item.latitude.toFixed(2)}-${item.longitude.toFixed(2)}`,
        name: item.name,
        displayName: parts.join(', '),
        latitude: item.latitude,
        longitude: item.longitude,
        country: item.country || 'Unknown',
        countryCode: item.country_code || '',
        admin1: item.admin1,
        elevation: item.elevation,
        timezone: item.timezone
      };
    });

    searchCache.set(q, results);
    return results;
  } catch (error) {
    logger.error('Failed to search locations:', error);
    return [];
  }
}

/**
 * Reverse geocodes coordinates to a human-readable city and country
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<LocationData> {
  const cacheKey = `${latitude.toFixed(3)}_${longitude.toFixed(3)}`;
  const cached = reverseCache.get(cacheKey);
  if (cached) return cached;

  try {
    // Free openStreetMap Nominatim reverse geocode
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'BreatheBetter-AirQualityApp/1.0'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};
      const cityName = addr.city || addr.town || addr.village || addr.suburb || addr.county || 'Selected Location';
      const country = addr.country || 'Unknown';
      const admin1 = addr.state || addr.province;

      const parts = [cityName];
      if (admin1 && admin1 !== cityName) parts.push(admin1);
      if (country) parts.push(country);

      const result: LocationData = {
        id: `custom-${latitude.toFixed(3)}-${longitude.toFixed(3)}`,
        name: cityName,
        displayName: parts.join(', '),
        latitude,
        longitude,
        country,
        countryCode: (addr.country_code || '').toUpperCase(),
        admin1
      };

      reverseCache.set(cacheKey, result);
      return result;
    }
  } catch (e) {
    logger.warn('Reverse geocode fallback:', e);
  }

  // Graceful fallback
  return {
    id: `coord-${latitude.toFixed(3)}-${longitude.toFixed(3)}`,
    name: `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`,
    displayName: `Coordinates (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
    latitude,
    longitude,
    country: 'Custom Coordinates',
    countryCode: 'LOC'
  };
}

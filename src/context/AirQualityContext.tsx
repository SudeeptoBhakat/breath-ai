import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LocationData, CurrentAirQuality, HourlyReading, DailyPollutionTrend, PollutionSpike } from '../types/aqi';
import { PRESET_CITIES, reverseGeocode } from '../services/geocodingService';
import { fetchAirQualityData } from '../services/openMeteoService';
import { fetchWeatherData, WeatherData } from '../services/weatherService';
import { databaseService } from '../services/supabaseService';
import { UserFavoriteLocation } from '../types/database';

export type ActiveTab = 'dashboard' | 'map' | 'history' | 'forecast' | 'comparison' | 'health' | 'leaderboard' | 'cleanAir';

interface AirQualityContextType {
  selectedLocation: LocationData;
  setSelectedLocation: (loc: LocationData) => void;
  currentData: CurrentAirQuality | null;
  weatherData: WeatherData | null;
  hourlyHistory: HourlyReading[];
  hourlyForecast: HourlyReading[];
  dailyTrends: DailyPollutionTrend[];
  spikes: PollutionSpike[];
  isLoading: boolean;
  error: string | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  favorites: UserFavoriteLocation[];
  isFavorite: boolean;
  toggleFavorite: () => Promise<void>;
  locateMe: (silently?: boolean) => void;
  refreshData: () => Promise<void>;
  isLocating: boolean;
}

const AirQualityContext = createContext<AirQualityContextType | undefined>(undefined);

export const AirQualityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData>(PRESET_CITIES[0]); // Default: New Delhi
  const [currentData, setCurrentData] = useState<CurrentAirQuality | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [hourlyHistory, setHourlyHistory] = useState<HourlyReading[]>([]);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyReading[]>([]);
  const [dailyTrends, setDailyTrends] = useState<DailyPollutionTrend[]>([]);
  const [spikes, setSpikes] = useState<PollutionSpike[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [favorites, setFavorites] = useState<UserFavoriteLocation[]>([]);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Load favorites
  useEffect(() => {
    databaseService.getFavorites().then(setFavorites);
  }, []);

  const loadDataForLocation = useCallback(async (loc: LocationData) => {
    setIsLoading(true);
    setError(null);
    try {
      const [aqData, weather] = await Promise.all([
        fetchAirQualityData(loc.latitude, loc.longitude),
        fetchWeatherData(loc.latitude, loc.longitude)
      ]);

      if (weather && aqData.current) {
        aqData.current.weather = {
          temperature: weather.temperature,
          humidity: weather.humidity,
          windSpeed: weather.windSpeed,
          windDirection: weather.windDirection,
          weatherCode: weather.weatherCode,
          weatherDescription: weather.weatherDescription
        };
      }

      setCurrentData(aqData.current);
      setWeatherData(weather);
      setHourlyHistory(aqData.hourlyHistory);
      setHourlyForecast(aqData.hourlyForecast);
      setDailyTrends(aqData.dailyTrends);
      setSpikes(aqData.spikes);
    } catch (err: any) {
      console.error('Failed to load air quality data:', err);
      setError(err?.message || 'Failed to retrieve real-time air quality telemetry. Please check connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDataForLocation(selectedLocation);
  }, [selectedLocation, loadDataForLocation]);

  // Ask once on a fresh visit so the dashboard starts with relevant local data.
  // Browsers retain the user's decision; rejection simply keeps the selected default city.
  useEffect(() => {
    locateMe(true);
    // locateMe is intentionally invoked only at first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshData = async () => {
    await loadDataForLocation(selectedLocation);
  };

  const isFavorite = favorites.some(f => f.name.toLowerCase() === selectedLocation.name.toLowerCase());

  const toggleFavorite = async () => {
    if (isFavorite) {
      await databaseService.removeFavorite(selectedLocation.name);
      setFavorites(prev => prev.filter(f => f.name.toLowerCase() !== selectedLocation.name.toLowerCase()));
    } else {
      const added = await databaseService.addFavorite({
        userId: 'guest-user',
        name: selectedLocation.name,
        displayName: selectedLocation.displayName,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        country: selectedLocation.country
      });
      setFavorites(prev => [added, ...prev]);
    }
  };

  const locateMe = (silently = false) => {
    if (!navigator.geolocation) {
      if (!silently) alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const loc = await reverseGeocode(lat, lon);
          setSelectedLocation(loc);
        } catch (e) {
          console.error('Error reverse geocoding current location:', e);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err);
        setIsLocating(false);
        if (!silently) alert('Could not access your location. Please ensure location permissions are enabled.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <AirQualityContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation,
        currentData,
        weatherData,
        hourlyHistory,
        hourlyForecast,
        dailyTrends,
        spikes,
        isLoading,
        error,
        activeTab,
        setActiveTab,
        favorites,
        isFavorite,
        toggleFavorite,
        locateMe,
        refreshData,
        isLocating
      }}
    >
      {children}
    </AirQualityContext.Provider>
  );
};

export function useAirQuality() {
  const context = useContext(AirQualityContext);
  if (!context) {
    throw new Error('useAirQuality must be used within an AirQualityProvider');
  }
  return context;
}

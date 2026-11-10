import { logger } from '../utils/logger';
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
  removeFavorite: (name: string) => Promise<void>;
  locateMe: (silently?: boolean) => void;
  refreshData: () => Promise<void>;
  isLocating: boolean;
}

const AirQualityContext = createContext<AirQualityContextType | undefined>(undefined);

export const AirQualityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLocation, setSelectedLocationState] = useState<LocationData>(() => {
    try {
      const saved = localStorage.getItem('breathe_last_selected_location');
      if (saved) return JSON.parse(saved);
    } catch {}
    return PRESET_CITIES[0]; // Default: New Delhi
  });

  const setSelectedLocation = useCallback((loc: LocationData) => {
    setSelectedLocationState(loc);
    try {
      localStorage.setItem('breathe_last_selected_location', JSON.stringify(loc));
    } catch {}
  }, []);

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
    } catch (err: unknown) {
      logger.error('Failed to load air quality data:', err);
      const msg = err instanceof Error ? err.message : 'Failed to retrieve real-time air quality telemetry. Please check connection.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDataForLocation(selectedLocation);
  }, [selectedLocation, loadDataForLocation]);

  const locateMe = useCallback((silently = false) => {
    if (!navigator.geolocation) {
      if (!silently) alert('Geolocation is not supported by your browser.');
      return;
    }

    if (!silently) {
      try {
        localStorage.setItem('breathe_has_located', 'true');
      } catch {}
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
          logger.error('Error reverse geocoding current location:', e);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        logger.warn('Geolocation denied or failed:', err);
        setIsLocating(false);
        if (!silently) alert('Could not access your location. Please ensure location permissions are enabled.');
      },
      silently
        ? { timeout: 4000, enableHighAccuracy: false, maximumAge: 300000 }
        : { timeout: 10000, enableHighAccuracy: true }
    );
  }, [setSelectedLocation]);

  // Only auto-locate silently if user has previously allowed location
  useEffect(() => {
    try {
      const previouslyAllowed = localStorage.getItem('breathe_has_located') === 'true';
      if (previouslyAllowed) {
        locateMe(true);
      }
    } catch {}
  }, [locateMe]);

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


  const removeFavorite = async (name: string) => {
    await databaseService.removeFavorite(name);
    setFavorites(prev => prev.filter(f => f.name.toLowerCase() !== name.toLowerCase()));
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
        removeFavorite,
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




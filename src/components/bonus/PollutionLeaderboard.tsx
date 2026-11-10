import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, ArrowRight, Loader2, RefreshCw, Globe, AlertCircle } from 'lucide-react';
import { useAirQuality } from '../../context/AirQualityContext';
import { getAQICategory, AQI_CATEGORIES } from '../../utils/aqiCalculator';
import { logger } from '../../utils/logger';

// ─── City Definitions ─────────────────────────────────────────────────────────
interface CityDef {
  name: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
}

const POLLUTED_CITIES: CityDef[] = [
  { name: 'Delhi',    country: 'India',      countryCode: 'IN', latitude: 28.6139, longitude: 77.2090 },
  { name: 'Patna',    country: 'India',      countryCode: 'IN', latitude: 25.5941, longitude: 85.1376 },
  { name: 'Lahore',   country: 'Pakistan',   countryCode: 'PK', latitude: 31.5204, longitude: 74.3587 },
  { name: 'Lucknow',  country: 'India',      countryCode: 'IN', latitude: 26.8467, longitude: 80.9462 },
  { name: 'Dhaka',    country: 'Bangladesh', countryCode: 'BD', latitude: 23.8103, longitude: 90.4125 },
  { name: 'Kolkata',  country: 'India',      countryCode: 'IN', latitude: 22.5726, longitude: 88.3639 },
  { name: 'Mumbai',   country: 'India',      countryCode: 'IN', latitude: 19.0760, longitude: 72.8777 },
  { name: 'Kanpur',   country: 'India',      countryCode: 'IN', latitude: 26.4499, longitude: 80.3319 },
  { name: 'Karachi',  country: 'Pakistan',   countryCode: 'PK', latitude: 24.8607, longitude: 67.0011 },
  { name: 'Kathmandu',country: 'Nepal',      countryCode: 'NP', latitude: 27.7172, longitude: 85.3240 },
];

const CLEAN_CITIES: CityDef[] = [
  { name: 'Zurich',      country: 'Switzerland', countryCode: 'CH', latitude: 47.3769, longitude:   8.5417 },
  { name: 'Reykjavik',   country: 'Iceland',     countryCode: 'IS', latitude: 64.1466, longitude: -21.9426 },
  { name: 'Helsinki',    country: 'Finland',     countryCode: 'FI', latitude: 60.1699, longitude:  24.9384 },
  { name: 'Wellington',  country: 'New Zealand', countryCode: 'NZ', latitude:-41.2865, longitude: 174.7762 },
  { name: 'Sydney',      country: 'Australia',   countryCode: 'AU', latitude:-33.8688, longitude: 151.2093 },
  { name: 'Bengaluru',   country: 'India',       countryCode: 'IN', latitude: 12.9716, longitude:  77.5946 },
  { name: 'Singapore',   country: 'Singapore',   countryCode: 'SG', latitude:  1.3521, longitude: 103.8198 },
  { name: 'Stockholm',   country: 'Sweden',      countryCode: 'SE', latitude: 59.3293, longitude:  18.0686 },
];

// ─── Live AQI Fetcher ─────────────────────────────────────────────────────────
interface LiveCity extends CityDef {
  rank: number;
  aqi: number;
  pm25: number;
  primaryPollutant: string;
  category: string;
  fetchedAt: string;
  loading: boolean;
  error: boolean;
}

async function fetchLiveAqi(city: CityDef): Promise<{ aqi: number; pm25: number; pollutant: string }> {
  const params = new URLSearchParams({
    latitude: city.latitude.toFixed(4),
    longitude: city.longitude.toFixed(4),
    current: 'us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone',
    timezone: 'auto',
  });

  const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);

  const json = await res.json();
  const cur = json.current ?? {};
  const aqi = typeof cur.us_aqi === 'number' ? Math.round(cur.us_aqi) : 0;
  const pm25 = typeof cur.pm2_5 === 'number' ? Number(cur.pm2_5.toFixed(1)) : 0;

  // Determine dominant pollutant
  const candidates: [string, number][] = [
    ['PM2.5',  cur.pm2_5 ?? 0],
    ['PM10',   cur.pm10  ?? 0],
    ['NO₂',    cur.nitrogen_dioxide ?? 0],
    ['O₃',     cur.ozone ?? 0],
  ];
  const pollutant = candidates.sort((a, b) => b[1] - a[1])[0][0];

  return { aqi, pm25, pollutant };
}

// ─── Component ────────────────────────────────────────────────────────────────
export const PollutionLeaderboard: React.FC = () => {
  const { setSelectedLocation, setActiveTab } = useAirQuality();
  const [filterMode, setFilterMode] = useState<'mostPolluted' | 'cleanest'>('mostPolluted');
  const [pollutedList, setPollutedList] = useState<LiveCity[]>([]);
  const [cleanList,    setCleanList]    = useState<LiveCity[]>([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const buildSkeleton = (defs: CityDef[]): LiveCity[] =>
    defs.map((c, i) => ({ ...c, rank: i + 1, aqi: 0, pm25: 0, primaryPollutant: '—', category: 'Moderate', fetchedAt: '', loading: true, error: false }));

  const fetchAll = useCallback(async () => {
    setGlobalLoading(true);
    setPollutedList(buildSkeleton(POLLUTED_CITIES));
    setCleanList(buildSkeleton(CLEAN_CITIES));

    // Fetch both lists concurrently, row by row settling individually
    const fetchGroup = async (defs: CityDef[], setter: React.Dispatch<React.SetStateAction<LiveCity[]>>) => {
      const results: LiveCity[] = defs.map((c, i) => ({
        ...c, rank: i + 1, aqi: 0, pm25: 0, primaryPollutant: '—',
        category: 'Moderate', fetchedAt: '', loading: true, error: false,
      }));
      setter([...results]);

      await Promise.all(
        defs.map(async (city, i) => {
          try {
            const data = await fetchLiveAqi(city);
            const cat = getAQICategory(data.aqi);
            results[i] = {
              ...results[i],
              aqi: data.aqi,
              pm25: data.pm25,
              primaryPollutant: data.pollutant,
              category: cat,
              fetchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              loading: false,
              error: false,
            };
          } catch (e) {
            logger.warn(`Live AQI fetch failed for ${city.name}:`, e);
            results[i] = { ...results[i], loading: false, error: true };
          }
          setter([...results]);
        })
      );

      // Re-rank by aqi descending (polluted) or ascending (clean)
      return results;
    };

    const [p, c] = await Promise.all([
      fetchGroup(POLLUTED_CITIES, setPollutedList),
      fetchGroup(CLEAN_CITIES,    setCleanList),
    ]);

    // Sort and re-rank
    const ranked = (arr: LiveCity[], desc: boolean) =>
      [...arr].sort((a, b) => desc ? b.aqi - a.aqi : a.aqi - b.aqi).map((x, i) => ({ ...x, rank: i + 1 }));

    setPollutedList(ranked(p, true));
    setCleanList(ranked(c, false));
    setLastFetched(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setGlobalLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const displayedList = filterMode === 'mostPolluted' ? pollutedList : cleanList;

  const handleSelectCity = (city: LiveCity) => {
    setSelectedLocation({
      id: `lb-${city.name.toLowerCase()}`,
      name: city.name,
      displayName: `${city.name}, ${city.country}`,
      latitude: city.latitude,
      longitude: city.longitude,
      country: city.country,
      countryCode: city.countryCode,
    });
    setActiveTab('dashboard');
  };

  return (
    <div className="bg-white border border-[#E3E6DC] rounded-3xl p-6 sm:p-8 shadow-card space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold font-heading text-[#173D32] tracking-tight flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#8B5E3C]" />
            <span>Global & Regional Air Quality Rankings</span>
          </h2>
          <p className="text-xs text-[#58645C] mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse inline-block" />
            Live data · Open-Meteo Air Quality API
            {lastFetched && <span className="text-[#89938A]">· Updated {lastFetched}</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            disabled={globalLoading}
            aria-label="Refresh leaderboard"
            className="p-2 rounded-xl bg-[#EEF1E8] hover:bg-[#A8B99A]/30 border border-[#E3E6DC] transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#173D32] ${globalLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Tab Filters */}
          <div className="flex items-center rounded-xl bg-[#EEF1E8] p-1 border border-[#E3E6DC]">
            <button
              onClick={() => setFilterMode('mostPolluted')}
              className={`px-3 py-1.5 text-xs font-semibold font-heading rounded-lg transition-all ${
                filterMode === 'mostPolluted'
                  ? 'bg-[#173D32] text-[#F7F5ED] shadow-soft'
                  : 'text-[#58645C] hover:text-[#173D32]'
              }`}
            >
              Most Polluted
            </button>
            <button
              onClick={() => setFilterMode('cleanest')}
              className={`px-3 py-1.5 text-xs font-semibold font-heading rounded-lg transition-all ${
                filterMode === 'cleanest'
                  ? 'bg-[#173D32] text-[#F7F5ED] shadow-soft'
                  : 'text-[#58645C] hover:text-[#173D32]'
              }`}
            >
              Cleanest Cities
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#26332D]">
          <thead className="bg-[#EEF1E8] text-[#173D32] uppercase font-mono text-[10px]">
            <tr>
              <th className="p-3.5 rounded-l-xl">Rank</th>
              <th className="p-3.5">City</th>
              <th className="p-3.5">Live AQI</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">PM2.5</th>
              <th className="p-3.5 rounded-r-xl text-right">Load</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3E6DC]">
            {displayedList.map((c) => {
              const cat = !c.loading && !c.error ? getAQICategory(c.aqi) : 'Moderate';
              const color = AQI_CATEGORIES[cat].color;

              return (
                <tr key={c.name} className="hover:bg-[#EEF1E8]/50 transition-colors">
                  <td className="p-3.5 font-mono text-[#89938A] font-bold">#{c.rank}</td>
                  <td className="p-3.5">
                    <span className="font-bold font-heading text-[#173D32] text-sm block">{c.name}</span>
                    <span className="text-[11px] text-[#58645C] flex items-center gap-1">
                      <Globe className="w-3 h-3" /> {c.country}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-base">
                    {c.loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#A8B99A]" />
                    ) : c.error ? (
                      <span className="text-[#89938A] flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />—</span>
                    ) : (
                      <span style={{ color }}>{c.aqi}</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {!c.loading && !c.error && (
                      <span
                        className="px-2.5 py-1 rounded-full text-[10px] font-semibold font-heading border"
                        style={{ backgroundColor: `${color}15`, borderColor: `${color}35`, color }}
                      >
                        {c.category}
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 font-mono text-[#58645C]">
                    {c.loading ? '—' : c.error ? '—' : `${c.pm25} µg/m³`}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleSelectCity(c)}
                      disabled={c.loading || c.error}
                      className="px-3 py-1.5 rounded-xl bg-[#173D32] hover:bg-[#245543] text-[#F7F5ED] text-xs font-semibold font-heading transition-colors inline-flex items-center gap-1 shadow-soft disabled:opacity-40"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3 text-[#65B9C9]" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-[#89938A] flex items-center gap-1.5">
        <Globe className="w-3 h-3" />
        Real-time measurements via Open-Meteo Air Quality API (open-meteo.com) · No API key required · Data updated every 5 minutes
      </p>
    </div>
  );
};

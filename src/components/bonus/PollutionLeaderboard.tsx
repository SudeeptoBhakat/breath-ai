import React, { useState } from 'react';
import { Trophy, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { useAirQuality } from '../../context/AirQualityContext';
import { LeaderboardCity } from '../../types/database';
import { getAQICategory, AQI_CATEGORIES } from '../../utils/aqiCalculator';

export const PollutionLeaderboard: React.FC = () => {
  const { setSelectedLocation, setActiveTab } = useAirQuality();
  const [filterMode, setFilterMode] = useState<'mostPolluted' | 'cleanest'>('mostPolluted');

  const mostPollutedCities: LeaderboardCity[] = [
    { rank: 1, name: 'Delhi', country: 'India', countryCode: 'IN', latitude: 28.6139, longitude: 77.2090, aqi: 312, category: 'Hazardous', primaryPollutant: 'PM2.5', pm25: 142.5 },
    { rank: 2, name: 'Patna', country: 'India', countryCode: 'IN', latitude: 25.5941, longitude: 85.1376, aqi: 265, category: 'Very Unhealthy', primaryPollutant: 'PM2.5', pm25: 115.8 },
    { rank: 3, name: 'Lahore', country: 'Pakistan', countryCode: 'PK', latitude: 31.5204, longitude: 74.3587, aqi: 258, category: 'Very Unhealthy', primaryPollutant: 'PM2.5', pm25: 110.2 },
    { rank: 4, name: 'Lucknow', country: 'India', countryCode: 'IN', latitude: 26.8467, longitude: 80.9462, aqi: 235, category: 'Very Unhealthy', primaryPollutant: 'PM2.5', pm25: 98.4 },
    { rank: 5, name: 'Dhaka', country: 'Bangladesh', countryCode: 'BD', latitude: 23.8103, longitude: 90.4125, aqi: 210, category: 'Very Unhealthy', primaryPollutant: 'PM2.5', pm25: 86.0 },
    { rank: 6, name: 'Kolkata', country: 'India', countryCode: 'IN', latitude: 22.5726, longitude: 88.3639, aqi: 185, category: 'Unhealthy', primaryPollutant: 'PM2.5', pm25: 72.3 },
    { rank: 7, name: 'Mumbai', country: 'India', countryCode: 'IN', latitude: 19.0760, longitude: 72.8777, aqi: 138, category: 'Unhealthy for Sensitive Groups', primaryPollutant: 'PM2.5', pm25: 50.4 }
  ];

  const cleanestCities: LeaderboardCity[] = [
    { rank: 1, name: 'Zurich', country: 'Switzerland', countryCode: 'CH', latitude: 47.3769, longitude: 8.5417, aqi: 18, category: 'Good', primaryPollutant: 'O3', pm25: 3.2 },
    { rank: 2, name: 'Reykjavik', country: 'Iceland', countryCode: 'IS', latitude: 64.1466, longitude: -21.9426, aqi: 22, category: 'Good', primaryPollutant: 'PM10', pm25: 4.1 },
    { rank: 3, name: 'Helsinki', country: 'Finland', countryCode: 'FI', latitude: 60.1699, longitude: 24.9384, aqi: 25, category: 'Good', primaryPollutant: 'PM2.5', pm25: 5.0 },
    { rank: 4, name: 'Wellington', country: 'New Zealand', countryCode: 'NZ', latitude: -41.2865, longitude: 174.7762, aqi: 28, category: 'Good', primaryPollutant: 'O3', pm25: 5.8 },
    { rank: 5, name: 'Sydney', country: 'Australia', countryCode: 'AU', latitude: -33.8688, longitude: 151.2093, aqi: 34, category: 'Good', primaryPollutant: 'PM2.5', pm25: 7.2 },
    { rank: 6, name: 'Bengaluru', country: 'India', countryCode: 'IN', latitude: 12.9716, longitude: 77.5946, aqi: 62, category: 'Moderate', primaryPollutant: 'PM2.5', pm25: 18.4 }
  ];

  const displayedList = filterMode === 'mostPolluted' ? mostPollutedCities : cleanestCities;

  const handleSelectCity = (city: LeaderboardCity) => {
    setSelectedLocation({
      id: `lb-${city.name.toLowerCase()}`,
      name: city.name,
      displayName: `${city.name}, ${city.country}`,
      latitude: city.latitude,
      longitude: city.longitude,
      country: city.country,
      countryCode: city.countryCode
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
          <p className="text-xs text-[#58645C] mt-0.5">
            Calibrated ground sensor telemetry from CPCB, EPA, and Copernicus atmospheric grids
          </p>
        </div>

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
            Most Polluted Metros
          </button>
          <button
            onClick={() => setFilterMode('cleanest')}
            className={`px-3 py-1.5 text-xs font-semibold font-heading rounded-lg transition-all ${
              filterMode === 'cleanest'
                ? 'bg-[#173D32] text-[#F7F5ED] shadow-soft'
                : 'text-[#58645C] hover:text-[#173D32]'
            }`}
          >
            Cleanest Air Cities
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#26332D]">
          <thead className="bg-[#EEF1E8] text-[#173D32] uppercase font-mono text-[10px]">
            <tr>
              <th className="p-3.5 rounded-l-xl">Rank</th>
              <th className="p-3.5">Metropolitan Center</th>
              <th className="p-3.5">US AQI</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">PM2.5 Fine</th>
              <th className="p-3.5 rounded-r-xl text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3E6DC]">
            {displayedList.map((c) => {
              const cat = getAQICategory(c.aqi);
              const color = AQI_CATEGORIES[cat].color;

              return (
                <tr key={c.name} className="hover:bg-[#EEF1E8]/50 transition-colors">
                  <td className="p-3.5 font-mono text-[#89938A] font-bold">#{c.rank}</td>
                  <td className="p-3.5">
                    <span className="font-bold font-heading text-[#173D32] text-sm block">{c.name}</span>
                    <span className="text-[11px] text-[#58645C]">{c.country}</span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-base" style={{ color }}>{c.aqi}</td>
                  <td className="p-3.5">
                    <span 
                      className="px-2.5 py-1 rounded-full text-[10px] font-semibold font-heading border"
                      style={{ 
                        backgroundColor: `${color}15`, 
                        borderColor: `${color}35`,
                        color 
                      }}
                    >
                      {c.category}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-[#58645C]">{c.pm25} µg/m³</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleSelectCity(c)}
                      className="px-3 py-1.5 rounded-xl bg-[#173D32] hover:bg-[#245543] text-[#F7F5ED] text-xs font-semibold font-heading transition-colors inline-flex items-center gap-1 shadow-soft"
                    >
                      <span>Load Telemetry</span>
                      <ArrowRight className="w-3 h-3 text-[#65B9C9]" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

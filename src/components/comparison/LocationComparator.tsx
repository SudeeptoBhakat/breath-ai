import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Trophy, 
  Plus, 
  Trash2, 
  Loader2, 
  Check,
  CheckCircle2,
  Sparkles 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PRESET_CITIES, searchLocations } from '../../services/geocodingService';
import { fetchAirQualityData } from '../../services/openMeteoService';
import { LocationData, CurrentAirQuality } from '../../types/aqi';
import { getAQICategory, AQI_CATEGORIES } from '../../utils/aqiCalculator';

interface ComparisonItem {
  location: LocationData;
  data: CurrentAirQuality | null;
  loading: boolean;
  error?: string;
}

export const LocationComparator: React.FC = () => {
  const [comparedCities, setComparedCities] = useState<ComparisonItem[]>([
    { location: PRESET_CITIES[0], data: null, loading: true }, // Delhi
    { location: PRESET_CITIES[1], data: null, loading: true }, // Mumbai
    { location: PRESET_CITIES[2], data: null, loading: true }  // Bengaluru
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    comparedCities.forEach((item, index) => {
      if (!item.data && item.loading) {
        fetchAirQualityData(item.location.latitude, item.location.longitude)
          .then(res => {
            setComparedCities(prev => {
              const copy = [...prev];
              copy[index] = { ...copy[index], data: res.current, loading: false };
              return copy;
            });
          })
          .catch(() => {
            setComparedCities(prev => {
              const copy = [...prev];
              copy[index] = { ...copy[index], loading: false, error: 'Failed to fetch' };
              return copy;
            });
          });
      }
    });
  }, [comparedCities]);

  const handleAddCity = (loc: LocationData) => {
    if (comparedCities.some(c => c.location.name === loc.name)) return;
    if (comparedCities.length >= 4) {
      alert('You can compare up to 4 cities simultaneously.');
      return;
    }
    setComparedCities(prev => [...prev, { location: loc, data: null, loading: true }]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveCity = (index: number) => {
    if (comparedCities.length <= 2) {
      alert('Keep at least 2 locations to perform a comparison.');
      return;
    }
    setComparedCities(prev => prev.filter((_, i) => i !== index));
  };

  const validData = comparedCities.filter(c => c.data !== null);
  let cleanAirWinner: ComparisonItem | null = null;
  if (validData.length > 0) {
    cleanAirWinner = validData.reduce((prev, curr) => 
      (curr.data!.aqi < prev.data!.aqi) ? curr : prev
    );
  }

  const chartData = validData.map(c => ({
    name: c.location.name,
    AQI: c.data!.aqi,
    'PM2.5': c.data!.pollutants.pm2_5?.value || 0,
    'PM10': c.data!.pollutants.pm10?.value || 0
  }));

  return (
    <div className="space-y-6">
      
      <div className="bg-white border border-[#E3E6DC] rounded-3xl p-6 sm:p-8 shadow-card">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold font-heading text-[#173D32] tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8B5E3C]" />
              <span>Multi-City Air Quality Comparator</span>
            </h2>
            <p className="text-xs text-[#58645C] mt-0.5">
              Side-by-side variance analysis comparing real-time ground telemetry across global metropolitan centers
            </p>
          </div>

          {/* Add City Search Bar */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="+ Compare another city..."
              value={searchQuery}
              onChange={async (e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val.length >= 2) {
                  setIsSearching(true);
                  const res = await searchLocations(val);
                  setSearchResults(res);
                  setIsSearching(false);
                } else {
                  setSearchResults([]);
                }
              }}
              className="w-full text-xs px-3.5 py-2.5 bg-[#F7F5ED] border border-[#E3E6DC] rounded-xl text-[#26332D] placeholder-[#89938A] focus:outline-none focus:border-[#173D32]"
            />

            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E3E6DC] rounded-xl shadow-card z-20 max-h-48 overflow-y-auto">
                {searchResults.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => handleAddCity(loc)}
                    className="w-full text-left px-3.5 py-2 text-xs hover:bg-[#EEF1E8] flex items-center justify-between text-[#26332D] border-b border-[#E3E6DC]/40 last:border-b-0"
                  >
                    <span>{loc.displayName}</span>
                    <Plus className="w-3.5 h-3.5 text-[#173D32]" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Clean Air Winner Highlight */}
        {cleanAirWinner && cleanAirWinner.data && (
          <div className="mb-6 p-4 rounded-2xl bg-[#EEF1E8] border border-[#2D6A4F]/30 flex items-center justify-between gap-4 text-xs shadow-soft">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white text-[#2D6A4F] shadow-soft">
                <Trophy className="w-5 h-5 text-[#2D6A4F]" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D6A4F] font-heading block">
                  Clean Air Leader
                </span>
                <p className="text-sm font-semibold font-heading text-[#173D32]">
                  {cleanAirWinner.location.name} has the cleanest ambient air among compared locations
                </p>
                <p className="text-[#58645C] text-[11px] mt-0.5">
                  Real-time AQI is {cleanAirWinner.data.aqi} ({cleanAirWinner.data.category}) with fine PM2.5 at {cleanAirWinner.data.pollutants.pm2_5?.value} µg/m³.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Side-by-Side City Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {comparedCities.map((item, index) => {
            const isWinner = cleanAirWinner?.location.name === item.location.name;

            return (
              <div
                key={item.location.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                  isWinner
                    ? 'bg-white border-[#2D6A4F] shadow-card ring-1 ring-[#2D6A4F]/20'
                    : 'bg-white border-[#E3E6DC] shadow-soft'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold font-heading text-[#173D32] text-sm">{item.location.name}</h4>
                      <p className="text-[10px] text-[#89938A]">{item.location.country}</p>
                    </div>
                    {comparedCities.length > 2 && (
                      <button
                        onClick={() => handleRemoveCity(index)}
                        className="text-[#89938A] hover:text-[#A83232] p-0.5 transition-colors"
                        title="Remove city"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {item.loading ? (
                    <div className="py-6 text-center text-xs text-[#58645C] flex items-center justify-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#173D32]" />
                      <span>Fetching telemetry...</span>
                    </div>
                  ) : item.data ? (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span 
                          className="text-3xl font-bold font-mono font-heading"
                          style={{ color: item.data.categoryInfo.color }}
                        >
                          {item.data.aqi}
                        </span>
                        <span className="text-[11px] font-semibold font-heading" style={{ color: item.data.categoryInfo.color }}>
                          {item.data.category}
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-[#E3E6DC] text-[11px]">
                        <div className="flex justify-between text-[#26332D]">
                          <span className="text-[#58645C]">PM2.5:</span>
                          <span className="font-mono">{item.data.pollutants.pm2_5?.value} µg/m³</span>
                        </div>
                        <div className="flex justify-between text-[#26332D]">
                          <span className="text-[#58645C]">PM10:</span>
                          <span className="font-mono">{item.data.pollutants.pm10?.value} µg/m³</span>
                        </div>
                        <div className="flex justify-between text-[#26332D]">
                          <span className="text-[#58645C]">NO₂:</span>
                          <span className="font-mono">{item.data.pollutants.no2?.value} µg/m³</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="py-4 text-xs text-[#A83232]">Telemetry unavailable</p>
                  )}
                </div>

                {isWinner && (
                  <div className="mt-3.5 pt-2 border-t border-[#2D6A4F]/20 text-[10px] font-bold text-[#2D6A4F] uppercase tracking-wider text-center font-heading">
                    ★ Best Air Quality Score ★
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparative Bar Chart */}
        {chartData.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#E3E6DC]">
            <h4 className="text-xs font-semibold font-heading text-[#173D32] mb-3">
              Comparative Pollutant Breakdown (Concentrations)
            </h4>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF1E8" />
                  <XAxis dataKey="name" stroke="#89938A" fontSize={11} />
                  <YAxis stroke="#89938A" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E3E6DC', borderRadius: '14px', fontSize: '11px', boxShadow: '0 8px 30px rgba(23,61,50,0.06)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="AQI" fill="#173D32" radius={[6, 6, 0, 0]} name="US AQI Score" />
                  <Bar dataKey="PM2.5" fill="#A83232" radius={[6, 6, 0, 0]} name="PM2.5 (µg/m³)" />
                  <Bar dataKey="PM10" fill="#65B9C9" radius={[6, 6, 0, 0]} name="PM10 (µg/m³)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

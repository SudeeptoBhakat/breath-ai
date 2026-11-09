import React from 'react';
import { Compass, Sparkles, ArrowRight, ShieldCheck, Leaf } from 'lucide-react';
import { useAirQuality } from '../../context/AirQualityContext';

interface SanctuarySpot {
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  estimatedAqi: number;
  whyClean: string;
  approxDistanceKm: number;
  image: string;
}

export const CleanAirFinder: React.FC = () => {
  const { selectedLocation, currentData, setSelectedLocation, setActiveTab } = useAirQuality();
  const currentAqi = currentData?.aqi || 191;

  const sanctuaries: SanctuarySpot[] = [
    {
      name: 'Rishikesh Foothills',
      region: 'Uttarakhand',
      country: 'India',
      latitude: 30.0869,
      longitude: 78.2676,
      estimatedAqi: 52,
      whyClean: 'Himalayan mountain updrafts and elevation rise above the winter inversion smog layer.',
      approxDistanceKm: 240,
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=85'
    },
    {
      name: 'Shimla Heights',
      region: 'Himachal Pradesh',
      country: 'India',
      latitude: 31.1048,
      longitude: 77.1734,
      estimatedAqi: 35,
      whyClean: 'Alpine pine forest canopy and high-altitude mountain winds above surface smoke.',
      approxDistanceKm: 340,
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85'
    },
    {
      name: 'Panchgani / Mahabaleshwar',
      region: 'Maharashtra',
      country: 'India',
      latitude: 17.9237,
      longitude: 73.8016,
      estimatedAqi: 44,
      whyClean: 'Western Ghats foliage and coastal mountain breeze ventilation corridor.',
      approxDistanceKm: 260,
      image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=85'
    },
    {
      name: 'Coorg (Madikeri)',
      region: 'Karnataka',
      country: 'India',
      latitude: 12.4244,
      longitude: 75.7382,
      estimatedAqi: 28,
      whyClean: 'Extensive rainforest canopy, coffee plantations, and zero industrial combustion.',
      approxDistanceKm: 250,
      image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=85'
    },
    {
      name: 'Ooty (Nilgiris)',
      region: 'Tamil Nadu',
      country: 'India',
      latitude: 11.4102,
      longitude: 76.6950,
      estimatedAqi: 30,
      whyClean: 'High-altitude Nilgiri plateau with pristine unpolluted air currents.',
      approxDistanceKm: 270,
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85'
    }
  ];

  const handleSelectSanctuary = (spot: SanctuarySpot) => {
    setSelectedLocation({
      id: `sanc-${spot.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: spot.name,
      displayName: `${spot.name}, ${spot.region}, ${spot.country}`,
      latitude: spot.latitude,
      longitude: spot.longitude,
      country: spot.country,
      countryCode: 'IN'
    });
    setActiveTab('dashboard');
  };

  return (
    <div className="bg-white border border-[#E3E6DC] rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold font-heading text-[#173D32] tracking-tight flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#8B5E3C]" />
            <span>Clean Air Sanctuary Finder</span>
          </h2>
          <p className="text-xs text-[#58645C] mt-0.5">
            Discover accessible mountain, coastal, and rainforest retreats with pristine breathable air
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-[#EEF1E8] border border-[#E3E6DC] text-xs">
          <span className="text-[#58645C]">Current Base: </span>
          <span className="font-semibold font-heading text-[#173D32]">{selectedLocation.name} ({currentAqi} AQI)</span>
        </div>
      </div>

      {/* Grid of Sanctuaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sanctuaries.map((spot) => {
          const improvement = Math.max(0, Math.round(((currentAqi - spot.estimatedAqi) / currentAqi) * 100));

          return (
            <article
              key={spot.name}
              className="group overflow-hidden rounded-2xl bg-[#EEF1E8]/40 border border-[#E3E6DC] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
            >
              <div className="relative h-36 overflow-hidden">
                <img src={spot.image} alt={`${spot.name} landscape`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#173D32]/55 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/90 text-[#173D32] backdrop-blur-sm font-mono">~{spot.estimatedAqi} AQI</span>
              </div>
              <div className="p-5 flex flex-1 flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold font-heading text-[#173D32] text-sm">{spot.name}</h3>
                    <p className="text-[11px] text-[#58645C]">{spot.region}, {spot.country}</p>
                  </div>
                </div>

                {improvement > 0 && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#2D6A4F]/10 text-[#2D6A4F] font-heading">
                    <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>{improvement}% Cleaner Air Than Current Zone</span>
                  </div>
                )}

                <p className="text-xs text-[#58645C] mt-3 leading-relaxed">
                  {spot.whyClean}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[#E3E6DC] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#89938A] font-mono">
                  ~{spot.approxDistanceKm} km corridor
                </span>

                <button
                  onClick={() => handleSelectSanctuary(spot)}
                  className="px-3 py-1.5 rounded-xl bg-[#173D32] hover:bg-[#245543] text-[#F7F5ED] font-semibold text-xs font-heading transition-colors flex items-center gap-1 shadow-soft"
                >
                  <span>Inspect Telemetry</span>
                  <ArrowRight className="w-3 h-3 text-[#65B9C9]" />
                </button>
              </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

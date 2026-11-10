import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  X, 
  Trash2, 
  ArrowRight, 
  Plus, 
  Globe, 
  MapPin, 
  Check, 
  Loader2,
  ExternalLink 
} from 'lucide-react';
import { useAirQuality } from '../../context/AirQualityContext';
import { UserFavoriteLocation } from '../../types/database';
import { getAQICategory, AQI_CATEGORIES } from '../../utils/aqiCalculator';

interface SavedLocationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FavoriteLiveInfo extends UserFavoriteLocation {
  liveAqi?: number;
  liveCategory?: string;
  loadingAqi?: boolean;
}

export const SavedLocationsModal: React.FC<SavedLocationsModalProps> = ({ isOpen, onClose }) => {
  const { 
    favorites, 
    selectedLocation, 
    setSelectedLocation, 
    setActiveTab, 
    toggleFavorite, 
    removeFavorite,
    isFavorite 
  } = useAirQuality();

  const [itemsWithAqi, setItemsWithAqi] = useState<FavoriteLiveInfo[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const initial: FavoriteLiveInfo[] = favorites.map(f => ({
      ...f,
      loadingAqi: true
    }));
    setItemsWithAqi(initial);

    // Fetch lightweight current live AQI for each saved location
    favorites.forEach(async (fav, idx) => {
      try {
        const res = await fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${fav.latitude.toFixed(4)}&longitude=${fav.longitude.toFixed(4)}&current=us_aqi&timezone=auto`
        );
        if (res.ok) {
          const data = await res.json();
          const aqi = Math.round(data?.current?.us_aqi || 0);
          const cat = getAQICategory(aqi);

          setItemsWithAqi(prev => {
            const next = [...prev];
            const targetIdx = next.findIndex(item => item.name.toLowerCase() === fav.name.toLowerCase());
            if (targetIdx !== -1) {
              next[targetIdx] = {
                ...next[targetIdx],
                liveAqi: aqi,
                liveCategory: cat,
                loadingAqi: false
              };
            }
            return next;
          });
        }
      } catch {
        setItemsWithAqi(prev => {
          const next = [...prev];
          const targetIdx = next.findIndex(item => item.name.toLowerCase() === fav.name.toLowerCase());
          if (targetIdx !== -1) {
            next[targetIdx] = { ...next[targetIdx], loadingAqi: false };
          }
          return next;
        });
      }
    });
  }, [isOpen, favorites]);

  if (!isOpen) return null;

  const handleSelect = (fav: UserFavoriteLocation) => {
    setSelectedLocation({
      id: fav.id || `fav-${fav.name.toLowerCase()}`,
      name: fav.name,
      displayName: fav.displayName || `${fav.name}, ${fav.country}`,
      latitude: fav.latitude,
      longitude: fav.longitude,
      country: fav.country,
      countryCode: ''
    });
    setActiveTab('dashboard');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#173D32]/70 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white border border-[#E3E6DC] rounded-3xl shadow-card p-5 sm:p-6 flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E3E6DC] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#EEF1E8] text-[#173D32] border border-[#E3E6DC]">
              <Bookmark className="w-5 h-5 text-[#8B5E3C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-heading text-[#173D32]">Saved Monitored Cities</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#173D32]/10 text-[#173D32] font-mono">
                  {favorites.length} saved
                </span>
              </div>
              <p className="text-[11px] text-[#58645C] mt-0.5">Quick access to your prioritized metropolitan air monitors</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 text-[#89938A] hover:text-[#26332D] rounded-xl hover:bg-[#EEF1E8] transition-colors"
            aria-label="Close saved locations"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar: Add Current */}
        <div className="py-3 border-b border-[#E3E6DC] flex items-center justify-between gap-2 flex-shrink-0">
          <div className="text-xs">
            <span className="text-[#58645C]">Current view: </span>
            <strong className="text-[#173D32] font-heading">{selectedLocation.name}</strong>
          </div>

          <button
            onClick={toggleFavorite}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-heading transition-colors flex items-center gap-1.5 ${
              isFavorite
                ? 'bg-[#EEF1E8] text-[#8B5E3C] hover:bg-[#A8B99A]/40'
                : 'bg-[#173D32] text-white hover:bg-[#245543] shadow-soft'
            }`}
          >
            {isFavorite ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved to Favorites</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Save Current City</span>
              </>
            )}
          </button>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 min-h-[220px] max-h-[50vh] pr-1">
          {favorites.length === 0 ? (
            <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF1E8] flex items-center justify-center text-[#A8B99A]">
                <MapPin className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold font-heading text-[#173D32]">No saved locations yet</p>
              <p className="text-[11px] text-[#58645C] max-w-xs">
                Click the bookmark icon in the header or button above to pin cities for 1-click telemetry comparison.
              </p>
            </div>
          ) : (
            (itemsWithAqi.length > 0 ? itemsWithAqi : favorites).map((fav) => {
              const live = itemsWithAqi.find(i => i.name.toLowerCase() === fav.name.toLowerCase());
              const cat = live?.liveCategory ? AQI_CATEGORIES[live.liveCategory as keyof typeof AQI_CATEGORIES] : null;
              const isSelected = selectedLocation.name.toLowerCase() === fav.name.toLowerCase();

              return (
                <div
                  key={fav.id || fav.name}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#EEF1E8]/70 border-[#173D32]/40 shadow-soft'
                      : 'bg-white border-[#E3E6DC] hover:border-[#A8B99A]/60'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold font-heading text-[#173D32] truncate">
                        {fav.name}
                      </h4>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#173D32] text-white">
                          Active
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[11px] text-[#58645C] truncate mt-0.5">
                      {fav.displayName || fav.country}
                    </p>

                    {live?.liveAqi !== undefined && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                        <span 
                          className="font-mono font-bold"
                          style={{ color: cat?.color || '#173D32' }}
                        >
                          {live.liveAqi} AQI
                        </span>
                        <span className="text-[#89938A]">&bull;</span>
                        <span className="text-[10px] text-[#58645C] font-heading font-medium">
                          {live.liveCategory}
                        </span>
                      </div>
                    )}
                    {live?.loadingAqi && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-[#89938A]">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Checking live air...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleSelect(fav)}
                      className="px-3 py-1.5 rounded-xl bg-[#173D32] hover:bg-[#245543] text-[#F7F5ED] text-xs font-semibold font-heading transition-colors flex items-center gap-1 shadow-soft"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#65B9C9]" />
                    </button>

                    <button
                      onClick={() => removeFavorite(fav.name)}
                      title={`Remove ${fav.name} from saved`}
                      aria-label={`Remove ${fav.name} from saved`}
                      className="p-1.5 rounded-xl text-[#89938A] hover:text-[#C53030] hover:bg-[#C53030]/10 border border-[#E3E6DC] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E3E6DC] flex items-center justify-between text-[11px] text-[#89938A] flex-shrink-0">
          <span>Synced locally & via Supabase</span>
          <span className="text-[#173D32] font-medium">BreatheAI Personal Network</span>
        </div>

      </div>
    </div>
  );
};

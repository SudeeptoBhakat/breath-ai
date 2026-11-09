import React, { useState } from 'react';
import { ChevronRight, X, AlertTriangle } from 'lucide-react';
import { useAirQuality } from '../../context/AirQualityContext';

export const DiwaliBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { currentData, setActiveTab } = useAirQuality();

  if (!isVisible) return null;

  const aqi = currentData?.aqi ?? 0;
  const isHighSmog = aqi > 150;

  return (
    <div className="bg-[#173D32] border-b border-[#245543] px-4 py-2 text-xs text-[#F7F5ED]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#65B9C9] animate-pulse flex-shrink-0" />
          <div className="text-[#A8B99A]">
            <span className="font-semibold font-heading text-white mr-1.5">Live environmental coverage</span>
            <span className="text-[#F7F5ED]/90 hidden md:inline">
              Ground-station measurements and local weather context, in one place.
            </span>
            {isHighSmog && (
              <span className="inline-flex items-center gap-1 ml-2 text-[#E2F3F6] bg-[#245543] px-2 py-0.5 rounded-full text-[11px] font-medium border border-[#65B9C9]/30">
                <AlertTriangle className="w-3.5 h-3.5 text-[#65B9C9]" /> Elevated Winter Particulates
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setActiveTab('health')}
            className="text-[#65B9C9] hover:text-white font-medium flex items-center gap-0.5 text-xs transition-colors"
          >
            <span className="font-heading">View health guidance</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-[#A8B99A] hover:text-white transition-colors"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

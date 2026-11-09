import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Info, Wind, ShieldCheck } from 'lucide-react';
import { useAirQuality } from '../../context/AirQualityContext';
import { PollutantDetail } from '../../types/aqi';

export const PollutantGrid: React.FC = () => {
  const { currentData, isLoading } = useAirQuality();
  const [activeCode, setActiveCode] = useState<string | null>(null);

  if (isLoading || !currentData) return null;

  const pollutants = Object.values(currentData.pollutants);

  return (
    <div className="space-y-4">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <h2 className="text-base font-bold font-heading text-[#173D32] tracking-tight flex items-center gap-2">
            <span>Atmospheric Pollutant Telemetry</span>
            <span className="text-[10px] font-medium font-sans px-2.5 py-0.5 rounded-full bg-[#EEF1E8] text-[#173D32] border border-[#E3E6DC]">
              Ground Sensors
            </span>
          </h2>
          <p className="text-xs text-[#58645C] mt-0.5">
            Calibrated concentrations evaluated against World Health Organization 24-hour guidelines
          </p>
        </div>

      </div>

      {/* Grid of Pollutants: 14-20px radius, white/soft surface, thin border */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {pollutants.map((item) => {
          const isExpanded = activeCode === item.code;
          const ratio = item.ratioToWho;

          // Organic severity styling
          let badgeClass = 'bg-[#EEF1E8] text-[#2D6A4F] border-[#A8B99A]/50';
          let progressColor = 'bg-[#2D6A4F]';
          if (ratio > 3.0) {
            badgeClass = 'bg-[#A83232]/10 text-[#A83232] border-[#A83232]/30';
            progressColor = 'bg-[#A83232]';
          } else if (ratio > 1.2) {
            badgeClass = 'bg-[#C08532]/10 text-[#C08532] border-[#C08532]/30';
            progressColor = 'bg-[#C08532]';
          }

          return (
            <div
              key={item.code}
              onClick={() => setActiveCode(isExpanded ? null : item.code)}
              onMouseEnter={() => setActiveCode(item.code)}
              onMouseLeave={() => setActiveCode(null)}
              onFocus={() => setActiveCode(item.code)}
              onBlur={() => setActiveCode(null)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setActiveCode(isExpanded ? null : item.code);
                }
              }}
              aria-expanded={isExpanded}
              className={`pollutant-card p-4 rounded-2xl border transition-all duration-300 cursor-pointer outline-none ${
                isExpanded
                  ? 'bg-white border-[#173D32] shadow-card ring-1 ring-[#173D32]/20 -translate-y-1'
                  : 'bg-white hover:bg-[#F7F5ED]/60 border-[#E3E6DC] hover:border-[#A8B99A] shadow-soft'
              }`}
            >
              {/* Header: Chemical Formula & WHO Ratio Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-base font-bold font-mono text-[#173D32] tracking-wide block">
                    {item.formula}
                  </span>
                  <span className="text-[11px] text-[#58645C] truncate max-w-[110px] block mt-0.5">
                    {item.name}
                  </span>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeClass} font-heading`}>
                  {ratio > 1 ? `${ratio}x WHO` : '✓ Optimal'}
                </span>
              </div>

              {/* Concentration Measurement */}
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-[#26332D] tracking-tight">
                  {item.value}
                </span>
                <span className="text-[11px] text-[#89938A] font-mono">{item.unit}</span>
              </div>

              {/* Progress Bar against WHO Guideline */}
              <div className="mt-3 w-full bg-[#EEF1E8] rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                  style={{ width: `${Math.min(100, (ratio / 4) * 100)}%` }}
                />
              </div>

              {/* Guideline Threshold Footer */}
              <div className="flex items-center justify-between text-[10px] text-[#89938A] mt-2.5">
                <span>WHO Limit: {item.whoLimit} {item.unit}</span>
                <span className="font-medium text-[#173D32] flex items-center gap-0.5">
                  {isExpanded ? (
                    <>
                      <span>Less</span>
                      <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <span>Details</span>
                      <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </span>
              </div>

              {/* Collapsible Clinical Details */}
              {isExpanded && (
                <div className="pollutant-detail mt-3 pt-3 border-t border-[#E3E6DC] text-xs text-[#58645C] space-y-2 animate-fadeIn">
                  <p className="leading-relaxed">{item.description}</p>
                  <p className="text-[11px] text-[#26332D] bg-[#EEF1E8] p-2 rounded-xl border border-[#E3E6DC]">
                    <strong className="text-[#173D32]">Health context:</strong> {item.healthEffects}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import { CloudSun, Droplets, Wind, Info, Compass, ShieldAlert } from 'lucide-react';
import { useAirQuality } from '../../context/AirQualityContext';

export const WeatherCard: React.FC = () => {
  const { weatherData, isLoading } = useAirQuality();

  if (isLoading || !weatherData) return null;

  const {
    temperature,
    humidity,
    windSpeed,
    windDirection,
    weatherDescription,
    inversionRisk,
    ventilationIndex
  } = weatherData;

  let riskBadge = 'bg-[#EEF1E8] text-[#2D6A4F] border-[#A8B99A]/50';
  if (inversionRisk === 'Severe') {
    riskBadge = 'bg-[#A83232]/10 text-[#A83232] border-[#A83232]/30';
  } else if (inversionRisk === 'High') {
    riskBadge = 'bg-[#C08532]/10 text-[#C08532] border-[#C08532]/30';
  }

  return (
    <div className="bg-white border border-[#E3E6DC] rounded-2xl p-6 shadow-card space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold font-heading text-[#173D32] flex items-center gap-2">
            <CloudSun className="w-4 h-4 text-[#8B5E3C]" />
            <span>Atmospheric Dispersion & Micro-Meteorology</span>
          </h3>
          <p className="text-xs text-[#58645C] mt-0.5">
            Boundary layers, surface wind circulation, and particulate trapping potential
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#58645C]">Thermal Inversion:</span>
          <span className={`px-2.5 py-0.5 text-xs font-semibold font-heading rounded-full border ${riskBadge}`}>
            {inversionRisk} Risk
          </span>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        
        {/* Temperature */}
        <div className="p-3.5 rounded-2xl bg-[#EEF1E8]/50 border border-[#E3E6DC]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#58645C] font-medium">Temperature</span>
            <span className="w-2 h-2 rounded-full bg-[#8B5E3C]" />
          </div>
          <span className="text-2xl font-bold font-mono text-[#26332D] mt-1.5 block">
            {temperature}°C
          </span>
          <span className="text-[10px] text-[#89938A]">{weatherDescription}</span>
        </div>

        {/* Humidity */}
        <div className="p-3.5 rounded-2xl bg-[#EEF1E8]/50 border border-[#E3E6DC]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#58645C] font-medium">Relative Humidity</span>
            <Droplets className="w-3.5 h-3.5 text-[#65B9C9]" />
          </div>
          <span className="text-2xl font-bold font-mono text-[#26332D] mt-1.5 block">
            {humidity}%
          </span>
          <span className="text-[10px] text-[#89938A]">
            {humidity > 65 ? 'Hygroscopic Smog Trap' : 'Normal Moisture'}
          </span>
        </div>

        {/* Surface Wind */}
        <div className="p-3.5 rounded-2xl bg-[#EEF1E8]/50 border border-[#E3E6DC]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#58645C] font-medium">Surface Wind</span>
            <Wind className="w-3.5 h-3.5 text-[#2D6A4F]" />
          </div>
          <span className="text-2xl font-bold font-mono text-[#26332D] mt-1.5 block">
            {windSpeed} <span className="text-xs font-normal text-[#89938A]">km/h</span>
          </span>
          <span className="text-[10px] text-[#89938A]">
            {windSpeed < 8 ? 'Stagnant (Low flushing)' : 'Active Dispersal'}
          </span>
        </div>

        {/* Natural Ventilation Index */}
        <div className="p-3.5 rounded-2xl bg-[#EEF1E8]/50 border border-[#E3E6DC]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#58645C] font-medium">Ventilation Index</span>
            <Compass className="w-3.5 h-3.5 text-[#173D32]" />
          </div>
          <span className="text-2xl font-bold font-mono text-[#173D32] mt-1.5 block">
            {ventilationIndex}
          </span>
          <span className="text-[10px] text-[#89938A]">Wind Vector: {windDirection}°</span>
        </div>

      </div>

      {/* Advisory Insight */}
      <div className="p-3.5 rounded-xl bg-[#EEF1E8] border border-[#E3E6DC] text-xs text-[#26332D] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#173D32] flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {windSpeed < 8
            ? `Calm horizontal winds (${windSpeed} km/h) combined with autumn night cooling create a nocturnal boundary inversion. Microscopic PM2.5 and pyrotechnic sulfur smoke stay trapped close to the ground rather than dispersing upwards.`
            : `Wind speeds of ${windSpeed} km/h are providing mechanical mixing to help clear combustion particulates.`}
        </p>
      </div>

    </div>
  );
};

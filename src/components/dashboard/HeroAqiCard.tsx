import React from 'react';
import {
  Clock,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  Share2,
  Sparkles,
  Info,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { useAirQuality } from '../../context/AirQualityContext';
import { formatDateTime } from '../../utils/formatters';

interface HeroAqiCardProps {
  onOpenAiChat: () => void;
  onOpenShareModal: () => void;
}

const getConditionVisual = (weatherCode: number, aqi: number) => {
  if (aqi > 150) {
    return {
      image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=70',
      label: 'Urban air conditions'
    };
  }
  if (weatherCode >= 51) {
    return {
      image: 'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=900&q=70',
      label: 'Rain and cloud cover'
    };
  }
  if (weatherCode >= 45) {
    return {
      image: 'https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?auto=format&fit=crop&w=900&q=70',
      label: 'Low visibility conditions'
    };
  }
  return {
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=70',
    label: 'Clear outdoor conditions'
  };
};

export const HeroAqiCard: React.FC<HeroAqiCardProps> = ({ onOpenAiChat, onOpenShareModal }) => {
  const { selectedLocation, currentData, weatherData, isLoading, error, setActiveTab } = useAirQuality();

  if (isLoading) {
    return (
      <div className="bg-white border border-[#E3E6DC] rounded-2xl p-8 animate-pulse shadow-card flex flex-col md:flex-row items-center justify-between gap-6 min-h-[300px]">
        <div className="w-full md:w-2/3 space-y-4">
          <div className="h-4 w-32 bg-[#EEF1E8] rounded-full" />
          <div className="h-10 w-3/4 bg-[#EEF1E8] rounded-xl" />
          <div className="h-4 w-full bg-[#EEF1E8] rounded-lg" />
          <div className="h-4 w-2/3 bg-[#EEF1E8] rounded-lg" />
        </div>
        <div className="w-40 h-40 rounded-2xl bg-[#EEF1E8]" />
      </div>
    );
  }

  if (error || !currentData) {
    return (
      <div className="bg-white border border-[#A83232]/20 rounded-2xl p-8 text-center min-h-[220px] flex flex-col items-center justify-center shadow-card">
        <AlertTriangle className="w-10 h-10 text-[#A83232] mb-3" />
        <h3 className="text-base font-bold font-heading text-[#26332D]">Real-Time Telemetry Temporarily Unavailable</h3>
        <p className="text-xs text-[#58645C] max-w-md mt-1">
          {error || 'Unable to connect to authentic ground station sensors. Please verify connection or select a different city.'}
        </p>
      </div>
    );
  }

  const { aqi, category, categoryInfo, dominantPollutant, lastUpdated, pollutants } = currentData;
  const clampedAqi = Math.max(0, Math.min(500, aqi));
  const scalePercent = (clampedAqi / 500) * 100;
  const conditionVisual = getConditionVisual(weatherData?.weatherCode ?? 0, aqi);

  return (
    <div className="space-y-6">
      
      {/* Editorial Hero Banner: Premium Organic Technology (Nature × Tech) */}
      <div className="city-hero relative overflow-hidden rounded-[28px] border border-white/70 p-6 sm:p-10 shadow-card">
        <img
          src={conditionVisual.image}
          alt={conditionVisual.label}
          loading="lazy"
          decoding="async"
          className="city-hero-image absolute inset-0 w-full h-full object-cover"
        />
        <div className="city-hero-image-overlay absolute inset-0 pointer-events-none" />
        {/* Subtle Decorative Airflow & Nature Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#65B9C9]/10 via-[#A8B99A]/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-gradient-to-tr from-[#173D32]/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Mission & Location Telemetry Summary */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Organic Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF1E8] border border-[#A8B99A]/40 text-xs text-[#173D32]">
              <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse" />
              <span className="font-semibold font-heading">Live local air quality</span>
              <span className="text-[#89938A]">•</span>
              <span className="text-[#58645C] text-[11px]">Updated from available stations</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-white/70 text-[11px] text-[#173D32] backdrop-blur-md">
              <Thermometer className="w-3.5 h-3.5 text-[#8B5E3C]" />
              <span className="font-semibold">{weatherData?.temperature ?? 26}°C</span>
              <span className="opacity-40">•</span>
              <span>{weatherData?.weatherDescription ?? 'Local conditions'}</span>
            </div>

            {/* Editorial Main Headline (Manrope 700/800) */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-[#173D32] tracking-tight leading-[1.15]">
              Your air, clearly<br />
              <span className="text-[#8B5E3C]">understood.</span>
            </h1>

            {/* Subtitle in Inter */}
            <p className="text-sm sm:text-base text-[#58645C] max-w-xl leading-relaxed font-normal">
              A calm, practical view of outdoor air conditions in {selectedLocation.name}—with the details you need to plan your day with confidence.
            </p>

            {/* Location Pill & Source Attribution */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#58645C]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-[#E3E6DC] text-[#26332D] font-medium shadow-soft">
                <MapPin className="w-3.5 h-3.5 text-[#173D32]" />
                <span>{selectedLocation.name}</span>
                <span className="text-[10px] text-[#89938A] font-mono">({selectedLocation.countryCode})</span>
              </span>

              <span className="inline-flex items-center gap-1 text-[11px] text-[#89938A]">
                <Clock className="w-3 h-3 text-[#A8B99A]" />
                Updated {formatDateTime(lastUpdated)}
              </span>

              <span className="inline-flex items-center gap-1 text-[11px] text-[#89938A] hidden sm:inline-flex">
                <ShieldCheck className="w-3 h-3 text-[#2D6A4F]" />
                Source-aware monitoring
              </span>
            </div>

            {/* CTAs: Solid Forest Green CTA + Secondary Outline CTA */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={onOpenAiChat}
                className="px-5 py-2.5 rounded-xl bg-[#173D32] hover:bg-[#245543] text-[#F7F5ED] text-xs sm:text-sm font-semibold font-heading transition-all shadow-card hover:shadow-card-hover flex items-center gap-2 hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-[#65B9C9]" />
                <span>Ask about today’s air</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-80" />
              </button>

              <button
                onClick={() => setActiveTab('map')}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#EEF1E8] text-[#173D32] border border-[#A8B99A] text-xs sm:text-sm font-medium font-heading transition-colors shadow-soft"
              >
                Explore the map
              </button>

              <button
                onClick={onOpenShareModal}
                className="p-2.5 rounded-xl bg-white hover:bg-[#EEF1E8] text-[#58645C] hover:text-[#173D32] border border-[#E3E6DC] transition-colors shadow-soft"
                title="Share Air Quality Report"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Right Column: Live AQI Metric Card & Scale */}
          <div className="lg:col-span-5">
            <div className="glass-surface rounded-2xl p-6 space-y-5 transition-transform duration-300 hover:-translate-y-1">
              
              {/* Header with Severity Indicator */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#89938A] uppercase tracking-wider font-heading block">
                    Air quality now
                  </span>
                  <p className="text-xs text-[#58645C] mt-0.5 font-medium">{selectedLocation.name} · nearest reporting station</p>
                </div>
                
                <span 
                  className="px-3 py-1 rounded-full text-xs font-semibold font-heading"
                  style={{
                    backgroundColor: `${categoryInfo.color}15`,
                    color: categoryInfo.color,
                    border: `1px solid ${categoryInfo.color}30`
                  }}
                >
                  {category}
                </span>
              </div>

              {/* Large AQI Counter with Spectrum */}
              <div className="flex items-baseline justify-between pt-1">
                <div className="flex items-baseline gap-2">
                  <span 
                    className="text-6xl sm:text-7xl font-extrabold tracking-tight font-heading font-mono"
                    style={{ color: categoryInfo.color }}
                  >
                    {aqi}
                  </span>
                  <div className="text-xs text-[#89938A] font-medium leading-tight">
                    <span>US AQI</span>
                    <span className="block text-[10px] text-[#A8B99A]">scale 0–500</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#89938A] uppercase font-bold block">Dominant Driver</span>
                  <span className="text-sm font-bold font-mono text-[#8B5E3C]">{dominantPollutant}</span>
                  <span className="text-[11px] text-[#58645C] block">
                    {pollutants.pm2_5?.value ?? 0} µg/m³
                  </span>
                </div>
              </div>

              {/* Natural AQI Gradient Scale Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="relative h-2 w-full rounded-full overflow-hidden flex bg-[#EEF1E8]">
                  <div className="h-full bg-[#2D6A4F] w-[10%]" title="Good (0-50)" />
                  <div className="h-full bg-[#C08532] w-[10%]" title="Moderate (51-100)" />
                  <div className="h-full bg-[#B8652B] w-[10%]" title="Sensitive (101-150)" />
                  <div className="h-full bg-[#A83232] w-[10%]" title="Unhealthy (151-200)" />
                  <div className="h-full bg-[#6A3D73] w-[20%]" title="Very Unhealthy (201-300)" />
                  <div className="h-full bg-[#4A1D28] w-[40%]" title="Hazardous (301-500)" />
                </div>

                {/* Needle Indicator Pin */}
                <div className="relative w-full h-2.5">
                  <div 
                    className="absolute top-0 -translate-x-1/2 w-2.5 h-2.5 rounded-full border-2 border-white shadow-md transition-all duration-500"
                    style={{ 
                      left: `${scalePercent}%`,
                      backgroundColor: categoryInfo.color
                    }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-[#89938A] font-mono">
                  <span>0 (Clean)</span>
                  <span>100</span>
                  <span>200</span>
                  <span>300</span>
                  <span>500 (Hazardous)</span>
                </div>
              </div>

              {/* Actionable Health Guideline Pill */}
              <div 
                className="p-3.5 rounded-xl border"
                style={{
                  backgroundColor: `${categoryInfo.color}08`,
                  borderColor: `${categoryInfo.color}25`
                }}
              >
                <p className="text-xs text-[#26332D] leading-relaxed">
                  <strong className="font-semibold" style={{ color: categoryInfo.color }}>
                    What this means:
                  </strong>{' '}
                  {categoryInfo.description} {categoryInfo.activityRecommendations.sensitiveGroups}
                </p>
              </div>

              {/* Environmental Metrics (Temp, Humidity, Wind) */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#E3E6DC]">
                <div className="p-2 rounded-xl bg-[#EEF1E8]/60 text-center">
                  <Thermometer className="w-3.5 h-3.5 text-[#8B5E3C] mx-auto mb-0.5" />
                  <span className="text-xs font-bold text-[#26332D] font-mono block">
                    {weatherData?.temperature ?? 26}°C
                  </span>
                  <span className="text-[10px] text-[#89938A]">Temp</span>
                </div>

                <div className="p-2 rounded-xl bg-[#EEF1E8]/60 text-center">
                  <Droplets className="w-3.5 h-3.5 text-[#65B9C9] mx-auto mb-0.5" />
                  <span className="text-xs font-bold text-[#26332D] font-mono block">
                    {weatherData?.humidity ?? 70}%
                  </span>
                  <span className="text-[10px] text-[#89938A]">Humidity</span>
                </div>

                <div className="p-2 rounded-xl bg-[#EEF1E8]/60 text-center">
                  <Wind className="w-3.5 h-3.5 text-[#2D6A4F] mx-auto mb-0.5" />
                  <span className="text-xs font-bold text-[#26332D] font-mono block">
                    {weatherData?.windSpeed ?? 6} km/h
                  </span>
                  <span className="text-[10px] text-[#89938A]">Surface Wind</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudFog, 
  Moon, 
  Wind, 
  Droplets, 
  Compass, 
  ShieldAlert, 
  Sparkles, 
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAirQuality } from '../../context/AirQualityContext';

// Puffy Material You Cloud Icon
const PuffyCloud: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style }) => (
  <svg
    viewBox="0 0 100 60"
    fill="currentColor"
    className={className}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M25 50h55a15 15 0 0 0 4-29.5A22 22 0 0 0 42 16a20 20 0 0 0-21 16A16 16 0 0 0 25 50z" />
  </svg>
);

export const WeatherCard: React.FC = () => {
  const { weatherData, selectedLocation, isLoading } = useAirQuality();
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Weather state & dynamic theme computation
  const weatherState = useMemo(() => {
    if (!weatherData) return null;

    const { weatherCode, windSpeed, humidity, inversionRisk } = weatherData;
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour >= 19;

    // Conditions:
    const isRain = (weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82);
    const isFogOrSmog = weatherCode === 45 || weatherCode === 48 || inversionRisk === 'Severe';
    const isCloudy = weatherCode === 2 || weatherCode === 3;
    const isClear = weatherCode === 0 || weatherCode === 1;

    let theme: 'sunny' | 'partly-cloudy' | 'cloudy' | 'hazy' | 'rainy' | 'night' = 'sunny';
    let conditionTitle = 'Sunny & Clear';
    let conditionPill = 'Pleasant & Bright';
    let gradientBg = 'from-[#1E6FE3] via-[#43A0F7] to-[#80C6FD]';
    let cardGlass = 'bg-white/20 border-white/25 text-white';

    if (isNight) {
      theme = 'night';
      conditionTitle = isClear ? 'Clear Night' : 'Cloudy Night';
      conditionPill = 'Calm Evening';
      gradientBg = 'from-[#0B132B] via-[#1C2541] to-[#3A506B]';
      cardGlass = 'bg-white/10 border-white/15 text-white';
    } else if (isRain) {
      theme = 'rainy';
      conditionTitle = 'Rain & Fresh Showers';
      conditionPill = 'Air Scrubbing Active';
      gradientBg = 'from-[#2B3E51] via-[#486581] to-[#627D98]';
      cardGlass = 'bg-white/15 border-white/20 text-white';
    } else if (isFogOrSmog) {
      theme = 'hazy';
      conditionTitle = 'Hazy & Stagnant';
      conditionPill = 'Smog Layer Trap';
      gradientBg = 'from-[#52525B] via-[#71717A] to-[#94A3B8]';
      cardGlass = 'bg-white/15 border-white/20 text-white';
    } else if (isCloudy) {
      theme = 'cloudy';
      conditionTitle = 'Soft Clouds & Calm';
      conditionPill = 'Diffuse Light';
      gradientBg = 'from-[#2F6EB4] via-[#548ECF] to-[#9DC3EE]';
      cardGlass = 'bg-white/20 border-white/25 text-white';
    } else {
      theme = 'sunny';
      conditionTitle = windSpeed > 12 ? 'Sunny & Breezy' : 'Sunny & Warm';
      conditionPill = 'High Visibility';
      gradientBg = 'from-[#1E6FE3] via-[#3FA3F9] to-[#7EC3FC]';
      cardGlass = 'bg-white/20 border-white/30 text-white';
    }

    // Friendly 1-sentence micro-meteorology translation
    let simpleInsight = '';
    if (inversionRisk === 'Severe' || (windSpeed < 6 && humidity > 65)) {
      simpleInsight = `Calm winds (${windSpeed} km/h) are keeping smoke and fine dust trapped near the ground today. Avoid outdoor smoke exposure.`;
    } else if (windSpeed < 9) {
      simpleInsight = `Light breeze in ${selectedLocation.name}. Outdoor air is relatively still; smoke from vehicles and biomass will linger.`;
    } else if (isRain) {
      simpleInsight = `Rain droplets are acting as a natural wet scrubber, pulling suspended particulates from the atmosphere to the ground.`;
    } else {
      simpleInsight = `Active winds (${windSpeed} km/h) are naturally ventilating the city, helping disperse smoke and dust aloft.`;
    }

    return {
      theme,
      isNight,
      conditionTitle,
      conditionPill,
      gradientBg,
      cardGlass,
      simpleInsight
    };
  }, [weatherData, selectedLocation.name]);

  if (isLoading || !weatherData || !weatherState) return null;

  const {
    temperature,
    humidity,
    windSpeed,
    windDirection,
    weatherDescription,
    inversionRisk,
    ventilationIndex
  } = weatherData;

  const {
    theme,
    isNight,
    conditionTitle,
    conditionPill,
    gradientBg,
    cardGlass,
    simpleInsight
  } = weatherState;

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradientBg} text-white shadow-xl border border-white/30 transition-all duration-700`}>
      
      {/* ─── DYNAMIC SKY LAYER: Animated Clouds & Heavenly Bodies ────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
        
        {/* Soft Ambient Radial Glow */}
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
        
        {/* Sun / Moon Display */}
        {isNight ? (
          <div className="absolute top-6 right-8 sm:right-14 opacity-90 transition-transform duration-1000">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-100 via-slate-100 to-white shadow-[0_0_35px_rgba(254,243,199,0.45)] flex items-center justify-center overflow-hidden">
                <div className="absolute w-3.5 h-3.5 rounded-full bg-slate-300/40 top-3 left-4" />
                <div className="absolute w-2.5 h-2.5 rounded-full bg-slate-300/30 bottom-4 right-5" />
                <div className="absolute w-2 h-2 rounded-full bg-slate-300/25 top-8 right-3" />
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute top-6 right-8 sm:right-14 transition-transform duration-1000">
            <div className="relative flex items-center justify-center">
              {/* Rotating sun rays */}
              <div className="absolute w-28 h-28 sm:w-32 sm:h-32 text-amber-200/50 animate-sun-rays pointer-events-none">
                <svg viewBox="0 0 100 100" fill="currentColor">
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                    <rect
                      key={angle}
                      x="48"
                      y="4"
                      width="4"
                      height="14"
                      rx="2"
                      transform={`rotate(${angle} 50 50)`}
                    />
                  ))}
                </svg>
              </div>
              {/* Pulsing Sun Orb */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-100 shadow-[0_0_45px_rgba(251,191,36,0.7)] animate-sun-pulse" />
            </div>
          </div>
        )}

        {/* Twinkling stars if Night */}
        {isNight && (
          <>
            <span className="absolute top-8 left-1/4 w-1.5 h-1.5 rounded-full bg-white animate-star" style={{ animationDelay: '0s' }} />
            <span className="absolute top-16 left-1/3 w-1 h-1 rounded-full bg-amber-100 animate-star" style={{ animationDelay: '1.2s' }} />
            <span className="absolute top-10 left-2/3 w-2 h-2 rounded-full bg-white animate-star" style={{ animationDelay: '0.6s' }} />
            <span className="absolute top-24 left-1/2 w-1.5 h-1.5 rounded-full bg-cyan-100 animate-star" style={{ animationDelay: '1.8s' }} />
          </>
        )}

        {/* Raindrops if Rainy */}
        {theme === 'rainy' && (
          <div className="absolute inset-0">
            {[10, 25, 42, 58, 73, 88].map((left, idx) => (
              <span
                key={idx}
                className="absolute top-4 w-0.5 h-6 bg-cyan-200/60 rounded-full animate-raindrop"
                style={{ left: `${left}%`, animationDelay: `${idx * 0.25}s` }}
              />
            ))}
          </div>
        )}

        {/* ── Continuous Moving Fluffy Clouds (Parallax Layering) ── */}
        {/* Layer 1: Foreground fast cloud */}
        <div className="absolute top-4 w-36 h-20 text-white/80 animate-cloud-fast drop-shadow-md" style={{ animationDelay: '-4s' }}>
          <PuffyCloud className="w-full h-full" />
        </div>

        {/* Layer 2: Midground medium cloud */}
        <div className="absolute top-10 w-48 h-28 text-white/60 animate-cloud-medium drop-shadow-sm" style={{ animationDelay: '-14s' }}>
          <PuffyCloud className="w-full h-full" />
        </div>

        {/* Layer 3: High background slow cloud */}
        <div className="absolute top-1 w-60 h-32 text-white/35 animate-cloud-slow" style={{ animationDelay: '-26s' }}>
          <PuffyCloud className="w-full h-full" />
        </div>

        {/* Extra puffy cloud cluster drifting in lower sky */}
        <div className="absolute top-14 w-40 h-24 text-white/50 animate-cloud-slow" style={{ animationDelay: '-6s' }}>
          <PuffyCloud className="w-full h-full" />
        </div>
      </div>

      {/* ─── FOREGROUND CONTENT: Google Weather Minimal & Clean ──────── */}
      <div className="relative z-10 p-5 sm:p-7 space-y-6">
        
        {/* Google Weather Style Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-semibold tracking-wide text-white shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Atmospheric Weather</span>
            </span>
            <span className="text-xs text-white/80 hidden sm:inline-block font-medium">
              {selectedLocation.name}
            </span>
          </div>

          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-xs font-medium text-white shadow-sm">
            {conditionPill}
          </span>
        </div>

        {/* Weather Hero: Big Temperature & Condition */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl sm:text-7xl font-extrabold tracking-tight font-heading text-white drop-shadow-md">
                {temperature}°
              </span>
              <span className="text-xl sm:text-2xl font-medium text-white/90">
                C
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold font-heading text-white mt-1 drop-shadow-sm">
              {conditionTitle}
            </h3>
            
            <p className="text-xs sm:text-sm text-white/85 font-medium mt-0.5">
              {weatherDescription} • Feels like {temperature + (humidity > 60 ? 1 : 0)}°
            </p>
          </div>

          {/* Quick Dispersal Health Badge */}
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-2xl sm:self-end">
            <ShieldAlert className={`w-4 h-4 ${inversionRisk === 'Severe' ? 'text-rose-300' : inversionRisk === 'High' ? 'text-amber-300' : 'text-emerald-300'}`} />
            <div className="text-left">
              <p className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">Pollutant Flushing</p>
              <p className="text-xs font-bold text-white">
                {inversionRisk === 'Low' ? 'Active Dispersal (Safe)' : `${inversionRisk} Inversion Risk`}
              </p>
            </div>
          </div>
        </div>

        {/* ─── 4 Material You Glanceable Metric Pills ─────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 pt-1">
          
          {/* Surface Wind */}
          <div className={`p-3.5 rounded-2xl ${cardGlass} backdrop-blur-md transition-all duration-200 hover:bg-white/25 hover:scale-[1.02]`}>
            <div className="flex items-center justify-between text-white/80">
              <span className="text-[11px] font-medium tracking-wide">Wind Speed</span>
              <Wind className="w-4 h-4" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono tracking-tight">{windSpeed}</span>
              <span className="text-xs text-white/75 font-sans">km/h</span>
            </div>
            <span className="text-[10px] text-white/80 font-medium block mt-0.5">
              {windSpeed < 6 ? 'Calm (Smoke traps)' : windSpeed < 14 ? 'Light breeze' : 'Active clearing'}
            </span>
          </div>

          {/* Humidity */}
          <div className={`p-3.5 rounded-2xl ${cardGlass} backdrop-blur-md transition-all duration-200 hover:bg-white/25 hover:scale-[1.02]`}>
            <div className="flex items-center justify-between text-white/80">
              <span className="text-[11px] font-medium tracking-wide">Humidity</span>
              <Droplets className="w-4 h-4 text-cyan-200" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono tracking-tight">{humidity}</span>
              <span className="text-xs text-white/75 font-sans">%</span>
            </div>
            <span className="text-[10px] text-white/80 font-medium block mt-0.5">
              {humidity > 70 ? 'Moisture holds smog' : 'Comfortable'}
            </span>
          </div>

          {/* Natural Ventilation */}
          <div className={`p-3.5 rounded-2xl ${cardGlass} backdrop-blur-md transition-all duration-200 hover:bg-white/25 hover:scale-[1.02]`}>
            <div className="flex items-center justify-between text-white/80">
              <span className="text-[11px] font-medium tracking-wide">Ventilation</span>
              <Compass className="w-4 h-4 text-emerald-200" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono tracking-tight">{ventilationIndex}</span>
            </div>
            <span className="text-[10px] text-white/80 font-medium block mt-0.5">
              Direction: {windDirection}° ({getCompassDirection(windDirection)})
            </span>
          </div>

          {/* Smoke Trapping / Inversion */}
          <div className={`p-3.5 rounded-2xl ${cardGlass} backdrop-blur-md transition-all duration-200 hover:bg-white/25 hover:scale-[1.02]`}>
            <div className="flex items-center justify-between text-white/80">
              <span className="text-[11px] font-medium tracking-wide">Smoke Trap</span>
              <ShieldAlert className="w-4 h-4 text-amber-200" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono tracking-tight">{inversionRisk}</span>
            </div>
            <span className="text-[10px] text-white/80 font-medium block mt-0.5">
              {inversionRisk === 'Low' ? 'Clean vertical mixing' : 'Trapped near surface'}
            </span>
          </div>

        </div>

        {/* ─── Friendly 1-Sentence Takeaway (Google Weather Style) ───── */}
        <div className="bg-black/15 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 flex items-start gap-3">
          <Info className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-white/95 leading-relaxed font-medium">
            {simpleInsight}
          </p>
        </div>

        {/* Optional Expandable Technical Micro-Meteorology Drawer */}
        <div className="pt-1 flex flex-col items-center">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white transition-colors py-1 px-3 rounded-full hover:bg-white/10"
          >
            <span>{showTechnicalDetails ? 'Hide technical physics' : 'Show boundary layer physics'}</span>
            {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showTechnicalDetails && (
            <div className="w-full mt-3 p-4 rounded-2xl bg-black/25 backdrop-blur-md border border-white/20 text-xs text-white/90 space-y-2 animate-enter">
              <p className="font-semibold text-white">Atmospheric Boundary Layer Context:</p>
              <p className="leading-relaxed text-white/80">
                {windSpeed < 8
                  ? `Calm horizontal winds (${windSpeed} km/h) combined with autumn night radiative cooling create a nocturnal boundary layer thermal inversion. Combustion particulates (PM2.5) stay concentrated in the lowest 100–300 meters rather than dispersing into the upper troposphere.`
                  : `Surface wind speeds of ${windSpeed} km/h generate turbulent kinetic energy, breaking shallow inversion caps and promoting horizontal particulate dispersion across the metropolitan airshed.`}
              </p>
              <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-white/70">
                <span>Surface Azimuth: <strong>{windDirection}°</strong></span>
                <span>Ventilation Class: <strong>{ventilationIndex}</strong></span>
                <span>Moisture Saturation: <strong>{humidity}%</strong></span>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

// Helper to convert degree to friendly compass direction
function getCompassDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

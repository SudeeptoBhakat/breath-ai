import React from 'react';
import { 
  HeartPulse, 
  ShieldAlert, 
  Baby, 
  Activity, 
  Wind, 
  Home, 
  Info,
  CheckCircle2, 
  AlertCircle,
  Leaf,
  ShoppingBag,
  TreePine,
  PlayCircle,
  ExternalLink
} from 'lucide-react';
import { useAirQuality } from '../../context/AirQualityContext';
import { useLanguage } from '../../context/LanguageContext';
import { AQI_CATEGORIES } from '../../utils/aqiCalculator';

export const HealthAdvisoryCard: React.FC = () => {
  const { currentData, selectedLocation } = useAirQuality();
  const { t } = useLanguage();

  const aqi = currentData?.aqi || 191;
  const currentCategory = currentData?.category || 'Unhealthy';
  const recs = currentData?.categoryInfo.activityRecommendations || AQI_CATEGORIES['Unhealthy'].activityRecommendations;

  return (
    <div className="space-y-6">
      
      {/* Current Real-Time Health Advisory Hero */}
      <div className="bg-white border border-[#E3E6DC] rounded-3xl p-6 sm:p-8 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-[#8B5E3C]" />
              <h2 className="text-xl font-bold font-heading text-[#173D32] tracking-tight">
                {t('health.title')}: {selectedLocation.name}
              </h2>
            </div>
            <p className="text-xs text-[#58645C] mt-0.5">
              {t('health.subtitle')} • {aqi} AQI ({currentCategory})
            </p>
          </div>

          <div 
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold font-heading border"
            style={{ 
              backgroundColor: `${currentData?.categoryInfo.color || '#A83232'}15`,
              borderColor: `${currentData?.categoryInfo.color || '#A83232'}35`,
              color: currentData?.categoryInfo.color || '#A83232'
            }}
          >
            Category: {currentCategory}
          </div>
        </div>

        <div className="health-visual-callout relative mt-6 min-h-[190px] overflow-hidden rounded-2xl">
          <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85" alt="Bright, well-ventilated home interior" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b251c]/90 via-[#0b251c]/65 to-transparent" />
          <div className="relative max-w-lg p-6 sm:p-7">
            <p className="text-[11px] uppercase tracking-[.14em] font-semibold text-[#65B9C9]">Your three-step reset</p>
            <h3 className="health-visual-title mt-2 text-xl font-bold font-heading">Check. Adapt. Breathe easier.</h3>
            <p className="health-visual-copy mt-2 text-sm leading-relaxed">Check today’s AQI. Move strenuous activity indoors when it rises. Keep one room clean with filtration.</p>
          </div>
        </div>

        {/* 4 Essential Action Boxes */}
        <div className="health-guidance-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-1">
          
          {/* Outdoor Cardio */}
          <div className="health-guidance-card health-guidance-card--movement p-4 rounded-2xl bg-[#EEF1E8]/50 border border-[#E3E6DC] flex flex-col justify-between">
            <span className="health-guidance-orb" />
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 text-[#173D32] text-xs font-semibold font-heading">
                  <span className="health-guidance-icon"><Activity className="w-4 h-4" /></span>
                  <span>{t('health.exercise')}</span>
                </div>
                <span className="health-guidance-state">Activity</span>
              </div>
              <p className="text-xs text-[#58645C] leading-relaxed">
                {recs.outdoorExercise}
              </p>
            </div>
            <div className="health-guidance-action mt-4 pt-3 border-t border-[#E3E6DC] text-[11px] font-semibold text-[#173D32] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {aqi > 150 ? 'Switch to indoor workouts' : 'Safe for normal exercise'}
            </div>
          </div>

          {/* Home Ventilation */}
          <div className="health-guidance-card health-guidance-card--home p-4 rounded-2xl bg-[#EEF1E8]/50 border border-[#E3E6DC] flex flex-col justify-between">
            <span className="health-guidance-orb" />
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 text-[#173D32] text-xs font-semibold font-heading">
                  <span className="health-guidance-icon"><Home className="w-4 h-4" /></span>
                  <span>{t('health.ventilation')}</span>
                </div>
                <span className="health-guidance-state">Home</span>
              </div>
              <p className="text-xs text-[#58645C] leading-relaxed">
                {recs.ventilation}
              </p>
            </div>
            <div className="health-guidance-action mt-4 pt-3 border-t border-[#E3E6DC] text-[11px] font-semibold text-[#173D32] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {aqi > 150 ? 'Seal perimeter windows' : 'Open during sunny hours'}
            </div>
          </div>

          {/* Mask Protocol */}
          <div className="health-guidance-card health-guidance-card--mask p-4 rounded-2xl bg-[#EEF1E8]/50 border border-[#E3E6DC] flex flex-col justify-between">
            <span className="health-guidance-orb" />
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 text-[#173D32] text-xs font-semibold font-heading">
                  <span className="health-guidance-icon"><ShieldAlert className="w-4 h-4" /></span>
                  <span>{t('health.masks')}</span>
                </div>
                <span className="health-guidance-state">Outdoors</span>
              </div>
              <p className="text-xs text-[#58645C] leading-relaxed">
                {recs.maskRequired 
                  ? 'Certified N95 / FFP2 respirator mask strongly advised outdoors with a tight nose bridge seal.' 
                  : 'Mask not required for general public under current ambient conditions.'}
              </p>
            </div>
            <div className="health-guidance-action mt-4 pt-3 border-t border-[#E3E6DC] text-[11px] font-semibold text-[#173D32] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {recs.maskRequired ? 'Certified N95 advised' : 'Clean ambient air'}
            </div>
          </div>

          {/* HEPA Filtration */}
          <div className="health-guidance-card health-guidance-card--filter p-4 rounded-2xl bg-[#EEF1E8]/50 border border-[#E3E6DC] flex flex-col justify-between">
            <span className="health-guidance-orb" />
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 text-[#173D32] text-xs font-semibold font-heading">
                  <span className="health-guidance-icon"><Wind className="w-4 h-4" /></span>
                  <span>{t('health.purifiers')}</span>
                </div>
                <span className="health-guidance-state">Indoors</span>
              </div>
              <p className="text-xs text-[#58645C] leading-relaxed">
                {recs.airPurifier}
              </p>
            </div>
            <div className="health-guidance-action mt-4 pt-3 border-t border-[#E3E6DC] text-[11px] font-semibold text-[#173D32] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {aqi > 150 ? 'Run continuous Auto / High' : 'Optional night mode'}
            </div>
          </div>

        </div>
      </div>

      {/* Sensitive Demographics Guide */}
      <div className="bg-white border border-[#E3E6DC] rounded-3xl p-6 sm:p-8 shadow-card">
        <h3 className="text-base font-bold font-heading text-[#173D32] mb-4 flex items-center gap-2">
          <Baby className="w-4 h-4 text-[#8B5E3C]" />
          <span>{t('health.vulnerable')}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#58645C]">
          <div className="p-4 rounded-2xl bg-[#EEF1E8]/40 border border-[#E3E6DC]">
            <h4 className="font-bold font-heading text-[#173D32] text-sm">Children & Infants</h4>
            <p className="mt-1.5 leading-relaxed">
              Keep outdoor play shorter when the AQI rises. Choose indoor movement on poor-air days.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#EEF1E8]/40 border border-[#E3E6DC]">
            <h4 className="font-bold font-heading text-[#173D32] text-sm">Asthmatics & Respiratory Patients</h4>
            <p className="mt-1.5 leading-relaxed">
              Follow your care plan, keep rescue medication close, and reduce outdoor exposure early.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#EEF1E8]/40 border border-[#E3E6DC]">
            <h4 className="font-bold font-heading text-[#173D32] text-sm">Elderly & Cardiac Patients</h4>
            <p className="mt-1.5 leading-relaxed">
              Keep exertion low outdoors and use a cleaner indoor room for rest and recovery.
            </p>
          </div>
        </div>
      </div>

      {/* Full Standard EPA & CPCB Scale Spectrum */}
      <div className="bg-white border border-[#E3E6DC] rounded-3xl p-6 sm:p-8 shadow-card">
        <h3 className="text-base font-bold font-heading text-[#173D32] mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-[#65B9C9]" />
          <span>Complete US EPA & Indian CPCB Air Quality Index Spectrum</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#26332D]">
            <thead className="bg-[#EEF1E8] text-[#173D32] uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3.5 rounded-l-xl">Category</th>
                <th className="p-3.5">AQI Range</th>
                <th className="p-3.5">Health Implication</th>
                <th className="p-3.5 rounded-r-xl">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E6DC]">
              {Object.values(AQI_CATEGORIES).map(cat => (
                <tr key={cat.name} className="hover:bg-[#EEF1E8]/50 transition-colors">
                  <td className="p-3.5 font-semibold text-[#173D32] flex items-center gap-2 font-heading">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span>{cat.name}</span>
                  </td>
                  <td className="p-3.5 font-mono">{cat.range[0]} – {cat.range[1]}</td>
                  <td className="p-3.5 text-[#58645C] max-w-xs leading-relaxed">{cat.healthImplications}</td>
                  <td className="p-3.5 text-[#58645C]">{cat.activityRecommendations.outdoorExercise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Watch & Act */}
      <section className="bg-white border border-[#E3E6DC] rounded-3xl p-6 sm:p-8 shadow-card">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
          <div>
            <p className="eyebrow">Watch & act</p>
            <h3 className="mt-1 text-xl font-bold font-heading text-[#173D32]">Practical guidance for poor-air days.</h3>
            <p className="mt-1 text-xs text-[#58645C]">A pair of helpful explainers, followed by simple ways to improve your indoor and outdoor environment.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#58645C]"><PlayCircle className="w-4 h-4 text-[#65B9C9]" /> Educational resources</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <article className="overflow-hidden rounded-2xl border border-[#E3E6DC] bg-[#EEF1E8]/40 flex flex-col justify-between">
            <div className="aspect-video bg-[#173D32]">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/HKyLG5at4jg"
                title="Delhi Air Pollution: How to Protect Yourself from Smog & Poor AQI? | Dr. Aarti Vashisht"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <div className="p-4 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-semibold font-heading text-sm text-[#173D32]">Protect yourself from smog & poor AQI</h4>
                <p className="mt-1 text-xs leading-relaxed text-[#58645C]">A doctor-led overview of reducing exposure during high-pollution conditions in Delhi.</p>
              </div>
              <a
                href="https://www.youtube.com/watch?v=HKyLG5at4jg"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 p-2 text-[#58645C] hover:text-[#173D32] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-[#E3E6DC]"
                title="Watch on YouTube"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </article>

          <article className="overflow-hidden rounded-2xl border border-[#E3E6DC] bg-[#EEF1E8]/40 flex flex-col justify-between">
            <div className="aspect-video bg-[#173D32]">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/yNnb_F1MqvE"
                title="How to Protect Yourself From Bad Air Quality"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <div className="p-4 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-semibold font-heading text-sm text-[#173D32]">How to protect yourself from bad air quality</h4>
                <p className="mt-1 text-xs leading-relaxed text-[#58645C]">Clear everyday habits for home, commuting, and outdoor activity when the air is poor.</p>
              </div>
              <a
                href="https://www.youtube.com/watch?v=yNnb_F1MqvE"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 p-2 text-[#58645C] hover:text-[#173D32] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-[#E3E6DC]"
                title="Watch on YouTube"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </article>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="health-action-card rounded-2xl border border-[#E3E6DC] bg-[#EEF1E8]/45 p-5">
            <div className="flex items-center gap-2 text-[#173D32]"><ShoppingBag className="w-4 h-4 text-[#8B5E3C]" /><h4 className="font-semibold font-heading text-sm">A sensible clean-air kit</h4></div>
            <div className="mt-3 space-y-2.5 text-xs leading-relaxed text-[#58645C]">
              <p><strong className="text-[#173D32]">True HEPA purifier</strong><span> — size it for your room and check filter availability.</span></p>
              <p><strong className="text-[#173D32]">N95 / FFP2 mask</strong><span> — use for essential outdoor trips on poor-air days.</span></p>
              <p><strong className="text-[#173D32]">PM2.5 monitor</strong><span> — verify that your clean room is improving.</span></p>
            </div>
          </div>
          <div className="health-action-card rounded-2xl border border-[#E3E6DC] bg-[#EEF1E8]/45 p-5">
            <div className="flex items-center gap-2 text-[#173D32]"><TreePine className="w-4 h-4 text-[#2D6A4F]" /><h4 className="font-semibold font-heading text-sm">Plant for lasting shade & resilience</h4></div>
            <div className="mt-3 space-y-2.5 text-xs leading-relaxed text-[#58645C]">
              <p><strong className="text-[#173D32]">Plant native trees</strong><span> — select species that thrive in your local climate.</span></p>
              <p><strong className="text-[#173D32]">Care after planting</strong><span> — watering and protection are what help saplings survive.</span></p>
              <p><strong className="text-[#173D32]">Add shade at home</strong><span> — plants improve comfort; filtration handles indoor particles.</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing health note */}
      <div className="p-6 rounded-3xl bg-[#173D32] text-[#F7F5ED] text-xs">
        <div className="flex items-center gap-2 mb-2">
          <Leaf className="w-4 h-4 text-[#A8B99A]" />
          <h3 className="font-bold font-heading text-white text-sm">
            Small choices, cleaner air
          </h3>
        </div>
        <p className="text-[#A8B99A] leading-relaxed max-w-3xl">
          Better air begins with knowing when to reduce exposure, ventilate intentionally, and move activities indoors. BreatheAI translates changing conditions into practical decisions for your home and routine.
        </p>
      </div>

    </div>
  );
};

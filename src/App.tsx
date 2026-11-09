import React, { useEffect, useState, Suspense, lazy } from 'react';
import { AirQualityProvider, useAirQuality } from './context/AirQualityContext';
import { AlertProvider } from './context/AlertContext';
import { Navbar } from './components/layout/Navbar';
import { DiwaliBanner } from './components/layout/DiwaliBanner';
import { Footer } from './components/layout/Footer';
import { HeroAqiCard } from './components/dashboard/HeroAqiCard';
import { PollutantGrid } from './components/dashboard/PollutantGrid';
import { WeatherCard } from './components/dashboard/WeatherCard';
import { AirQualityMap } from './components/map/AirQualityMap';

// Lazy-load non-initial tabs and heavy modals to keep the initial JS bundle ultra-fast
const HistoricalTracker = lazy(() => import('./components/analytics/HistoricalTracker').then(m => ({ default: m.HistoricalTracker })));
const ForecastView = lazy(() => import('./components/analytics/ForecastView').then(m => ({ default: m.ForecastView })));
const LocationComparator = lazy(() => import('./components/comparison/LocationComparator').then(m => ({ default: m.LocationComparator })));
const PollutionLeaderboard = lazy(() => import('./components/bonus/PollutionLeaderboard').then(m => ({ default: m.PollutionLeaderboard })));
const HealthAdvisoryCard = lazy(() => import('./components/health/HealthAdvisoryCard').then(m => ({ default: m.HealthAdvisoryCard })));
const CleanAirFinder = lazy(() => import('./components/bonus/CleanAirFinder').then(m => ({ default: m.CleanAirFinder })));
const BreatheAiChat = lazy(() => import('./components/bonus/BreatheAiChat').then(m => ({ default: m.BreatheAiChat })));
const SmartAlertModal = lazy(() => import('./components/bonus/SmartAlertModal').then(m => ({ default: m.SmartAlertModal })));
const ShareCardModal = lazy(() => import('./components/bonus/ShareCardModal').then(m => ({ default: m.ShareCardModal })));

const TabSuspenseFallback: React.FC = () => (
  <div className="bg-white border border-[#E3E6DC] rounded-3xl p-12 shadow-card flex flex-col items-center justify-center min-h-[380px] space-y-4">
    <div className="w-9 h-9 rounded-full border-3 border-[#173D32] border-t-transparent animate-spin" />
    <p className="text-xs font-semibold text-[#58645C] font-heading tracking-wide">
      Loading analytics telemetry...
    </p>
  </div>
);

const AppContent: React.FC = () => {
  const { activeTab, currentData } = useAirQuality();
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    localStorage.getItem('breathe-theme') === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
    localStorage.setItem('breathe-theme', theme);
  }, [theme]);

  return (
    <div
      className="glass-app min-h-screen flex flex-col bg-[#F7F5ED] text-[#26332D] font-sans selection:bg-[#173D32] selection:text-[#F7F5ED]"
      style={{ '--city-aqi': currentData?.categoryInfo.color ?? '#65B9C9' } as React.CSSProperties & { '--city-aqi': string }}
    >

      {/* Top Notification Banner */}
      <DiwaliBanner />

      {/* Primary Sticky Header */}
      <Navbar
        onOpenAiChat={() => setIsAiOpen(true)}
        onOpenAlertModal={() => setIsAlertOpen(true)}
        onOpenShareModal={() => setIsShareOpen(true)}
        theme={theme}
        onToggleTheme={() => setTheme(current => current === 'light' ? 'dark' : 'light')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-5 sm:px-8 lg:px-10 py-8 sm:py-10">
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-enter">
            <HeroAqiCard
              onOpenAiChat={() => setIsAiOpen(true)}
              onOpenShareModal={() => setIsShareOpen(true)}
            />
            <PollutantGrid />
            <WeatherCard />
            <section className="pt-3">
              <div className="mb-4">
                <p className="eyebrow">Explore your surroundings</p>
                <h2 className="mt-1 text-2xl font-bold font-heading text-[#173D32]">See the air beyond your street.</h2>
              </div>
              <AirQualityMap />
            </section>
          </div>
        )}

        {activeTab === 'history' && (
          <Suspense fallback={<TabSuspenseFallback />}>
            <div className="space-y-10 animate-enter">
              <HistoricalTracker />
              <ForecastView />
            </div>
          </Suspense>
        )}

        {activeTab === 'comparison' && (
          <Suspense fallback={<TabSuspenseFallback />}>
            <div className="space-y-10 animate-enter">
              <LocationComparator />
              <PollutionLeaderboard />
            </div>
          </Suspense>
        )}

        {activeTab === 'health' && (
          <Suspense fallback={<TabSuspenseFallback />}>
            <div className="space-y-10 animate-enter">
              <HealthAdvisoryCard />
              <CleanAirFinder />
            </div>
          </Suspense>
        )}
      </main>

      {/* Interactive Modals (mounted lazily on demand) */}
      {isAiOpen && (
        <Suspense fallback={null}>
          <BreatheAiChat isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
        </Suspense>
      )}
      {isAlertOpen && (
        <Suspense fallback={null}>
          <SmartAlertModal isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)} />
        </Suspense>
      )}
      {isShareOpen && (
        <Suspense fallback={null}>
          <ShareCardModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
        </Suspense>
      )}

      {/* Deep Forest Green Footer */}
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AlertProvider>
      <AirQualityProvider>
        <AppContent />
      </AirQualityProvider>
    </AlertProvider>
  );
};

export default App;

import React, { useEffect, useState } from 'react';
import { AirQualityProvider, useAirQuality } from './context/AirQualityContext';
import { AlertProvider } from './context/AlertContext';
import { Navbar } from './components/layout/Navbar';
import { DiwaliBanner } from './components/layout/DiwaliBanner';
import { Footer } from './components/layout/Footer';
import { HeroAqiCard } from './components/dashboard/HeroAqiCard';
import { PollutantGrid } from './components/dashboard/PollutantGrid';
import { WeatherCard } from './components/dashboard/WeatherCard';
import { AirQualityMap } from './components/map/AirQualityMap';
import { HistoricalTracker } from './components/analytics/HistoricalTracker';
import { ForecastView } from './components/analytics/ForecastView';
import { LocationComparator } from './components/comparison/LocationComparator';
import { HealthAdvisoryCard } from './components/health/HealthAdvisoryCard';
import { PollutionLeaderboard } from './components/bonus/PollutionLeaderboard';
import { CleanAirFinder } from './components/bonus/CleanAirFinder';
import { BreatheAiChat } from './components/bonus/BreatheAiChat';
import { SmartAlertModal } from './components/bonus/SmartAlertModal';
import { ShareCardModal } from './components/bonus/ShareCardModal';

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
          <div className="space-y-10 animate-enter">
            <HistoricalTracker />
            <ForecastView />
          </div>
        )}
        {activeTab === 'comparison' && (
          <div className="space-y-10 animate-enter">
            <LocationComparator />
            <PollutionLeaderboard />
          </div>
        )}
        {activeTab === 'health' && (
          <div className="space-y-10 animate-enter">
            <HealthAdvisoryCard />
            <CleanAirFinder />
          </div>
        )}
      </main>

      {/* Interactive Modals */}
      <BreatheAiChat isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
      <SmartAlertModal isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)} />
      <ShareCardModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />

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

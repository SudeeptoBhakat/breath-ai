import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  MapPin,
  Bell,
  Share2,
  Sparkles,
  Navigation,
  Bookmark,
  BookmarkCheck,
  Activity,
  Map as MapIcon,
  TrendingUp,
  Calendar,
  Layers,
  HeartPulse,
  Trophy,
  Compass,
  X,
  Loader2,
  Wind,
  Sun,
  Moon
} from 'lucide-react';
import { useAirQuality, ActiveTab } from '../../context/AirQualityContext';
import { searchLocations, PRESET_CITIES } from '../../services/geocodingService';
import { LocationData } from '../../types/aqi';

interface NavbarProps {
  onOpenAiChat: () => void;
  onOpenAlertModal: () => void;
  onOpenShareModal: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAiChat,
  onOpenAlertModal,
  onOpenShareModal,
  theme,
  onToggleTheme
}) => {
  const {
    selectedLocation,
    setSelectedLocation,
    activeTab,
    setActiveTab,
    locateMe,
    isLocating,
    currentData,
    isFavorite,
    toggleFavorite
  } = useAirQuality();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpenDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (val.trim().length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await searchLocations(val);
        setSearchResults(results);
        setIsSearching(false);
        setIsOpenDropdown(true);
      }, 250);
    } else {
      setSearchResults([]);
      setIsSearching(false);
      setIsOpenDropdown(false);
    }
  };

  const handleSelectLocation = (loc: LocationData) => {
    setSelectedLocation(loc);
    setSearchQuery('');
    setIsOpenDropdown(false);
  };

  const navTabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard',  label: 'Overview',              icon: <Activity className="w-4 h-4" /> },
    { id: 'history',    label: 'Air patterns',          icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'comparison', label: 'Compare & rankings',    icon: <Layers className="w-4 h-4" /> },
    { id: 'health',     label: 'Health & escapes',      icon: <HeartPulse className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F7F5ED]/95 backdrop-blur-xl border-b border-[#E3E6DC]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* Primary Navbar Bar */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between min-h-[64px] sm:h-[72px] py-3 sm:py-0 gap-3 sm:gap-6">

          {/* Logo & Brand: Premium Organic Nature x Tech */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none flex-shrink-0 group"
            onClick={() => setActiveTab('dashboard')}
          >
            <img
              src="/logo.png"
              alt="BreatheAI"
              className="h-8 sm:h-11 w-auto object-contain"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          </div>

          {/* Search Bar - Warm & Minimal */}
          <div className="relative order-3 sm:order-none basis-full sm:basis-auto flex-1 max-w-none sm:max-w-sm mx-0 sm:mx-2" ref={dropdownRef}>
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-[#89938A] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => { if (searchResults.length > 0 || searchQuery.length === 0) setIsOpenDropdown(true); }}
                placeholder="Search a city or station"
                className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-white text-[#26332D] placeholder-[#89938A] border border-[#E3E6DC] rounded-lg shadow-soft focus:outline-none focus:border-[#173D32] focus:ring-1 focus:ring-[#173D32]/20 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="absolute right-3 text-[#89938A] hover:text-[#26332D]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown Menu */}
            {isOpenDropdown && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-[#E3E6DC] rounded-2xl shadow-card overflow-hidden z-50 max-h-80 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-xs text-[#58645C] flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#173D32]" />
                    <span>Searching global environmental network...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    <div className="px-4 py-1.5 text-[10px] font-bold text-[#89938A] uppercase tracking-wider">
                      Search Results
                    </div>
                    {searchResults.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => handleSelectLocation(loc)}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#EEF1E8] flex items-center justify-between text-xs transition-colors border-b border-[#E3E6DC]/40 last:border-b-0"
                      >
                        <div className="flex items-center gap-2.5">
                          <MapPin className="w-3.5 h-3.5 text-[#173D32] flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-[#26332D]">{loc.name}</p>
                            <p className="text-[11px] text-[#58645C]">{loc.displayName}</p>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F7F5ED] text-[#173D32] font-mono border border-[#E3E6DC]">
                          {loc.countryCode || loc.country}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-2">
                    <div className="px-4 py-1.5 text-[10px] font-bold text-[#89938A] uppercase tracking-wider">
                      Popular Monitored Metros
                    </div>
                    {PRESET_CITIES.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => handleSelectLocation(loc)}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#EEF1E8] flex items-center justify-between text-xs transition-colors"
                      >
                        <span className="text-[#26332D] font-medium">{loc.displayName}</span>
                        <span className="text-[#89938A] text-[10px] font-mono">{loc.country}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Controls & Primary Action Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Locate Me Button */}
            <button
              onClick={() => locateMe()}
              disabled={isLocating}
              title="Detect my current location"
              className="p-2.5 sm:px-3 sm:py-2.5 text-xs font-medium rounded-lg bg-white hover:bg-[#EEF1E8] text-[#26332D] border border-[#E3E6DC] transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLocating ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#173D32]" />
              ) : (
                <Navigation className="w-4 h-4 text-[#173D32]" />
              )}
              <span className="hidden lg:inline text-[#26332D]">Locate</span>
            </button>

            {/* Favorite Bookmark */}
            <button
              onClick={toggleFavorite}
              title={isFavorite ? 'Remove from saved' : 'Save location'}
              className="hidden sm:block p-2.5 rounded-lg bg-white hover:bg-[#EEF1E8] text-[#58645C] hover:text-[#173D32] border border-[#E3E6DC] transition-colors"
            >
              {isFavorite ? (
                <BookmarkCheck className="w-4 h-4 text-[#8B5E3C]" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            {/* Alerts */}
            <button
              onClick={onOpenAlertModal}
              title="Smart AQI Alerts"
              className="p-2.5 rounded-lg bg-white hover:bg-[#EEF1E8] text-[#58645C] hover:text-[#173D32] border border-[#E3E6DC] transition-colors"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Share Card */}
            <button
              onClick={onOpenShareModal}
              title="Export report card"
              className="hidden sm:block p-2.5 rounded-lg bg-white hover:bg-[#EEF1E8] text-[#58645C] hover:text-[#173D32] border border-[#E3E6DC] transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleTheme}
              title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
              aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
              className="p-2.5 rounded-lg bg-white hover:bg-[#EEF1E8] text-[#58645C] hover:text-[#173D32] border border-[#E3E6DC] transition-all hover:-translate-y-0.5"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Primary Forest Green CTA Button */}
            <button
              onClick={onOpenAiChat}
              className="ml-0 sm:ml-1 px-2.5 sm:px-3.5 py-2.5 text-xs font-semibold rounded-lg bg-[#173D32] hover:bg-[#245543] text-[#F7F5ED] transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#65B9C9]" />
              <span className="hidden sm:inline font-heading">Ask BreatheAI</span>
            </button>
          </div>

        </div>

        {/* Clean Segmented Tab Navigation: Manrope/Inter */}
        <nav aria-label="Application sections" className="flex items-center justify-start sm:justify-center space-x-1 overflow-x-auto py-2.5 border-t border-[#E3E6DC] scrollbar-none">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#173D32] text-[#F7F5ED] font-semibold'
                    : 'text-[#58645C] hover:text-[#173D32] hover:bg-[#EEF1E8]'
                }`}
              >
                {tab.icon}
                <span className="font-heading">{tab.label}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
};

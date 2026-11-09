import React, { useState, useRef, useEffect } from 'react';
import { Languages, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SupportedLanguage } from '../../i18n/translations';

export const LanguageSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage, languages, currentLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
        className="p-2 sm:px-2.5 sm:py-2 rounded-lg bg-white hover:bg-[#EEF1E8] text-[#26332D] border border-[#E3E6DC] transition-all flex items-center gap-1.5 shadow-soft focus:outline-none focus:ring-1 focus:ring-[#173D32]"
      >
        <Languages className="w-4 h-4 text-[#173D32]" />
        <span className="text-xs font-semibold font-heading hidden sm:inline">
          {currentLanguage.shortLabel}
        </span>
        <ChevronDown className="w-3 h-3 text-[#89938A]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-[#E3E6DC] shadow-card py-2 z-50 animate-enter focus:outline-none">
          <div className="px-3 py-1.5 text-[10px] font-bold text-[#89938A] uppercase tracking-wider font-heading border-b border-[#E3E6DC]/40 mb-1">
            Choose Language
          </div>
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-[#EEF1E8] text-[#173D32] font-bold'
                    : 'text-[#26332D] hover:bg-[#F7F5ED]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <div>
                    <span className="block font-heading">{lang.nativeName}</span>
                    <span className="block text-[10px] text-[#89938A]">{lang.name}</span>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#2D6A4F]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

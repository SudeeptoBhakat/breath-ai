import React from 'react';
import { ArrowUpRight, Leaf, ShieldCheck, Wind } from 'lucide-react';

export const Footer: React.FC = () => (
  <footer className="footer-atmosphere relative mt-20 bg-[#173D32] text-[#F7F5ED] overflow-hidden">
    <img
      src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2200&q=85"
      alt="Forest canopy in soft light"
      className="footer-atmosphere-image absolute inset-0 w-full h-full object-cover"
      loading="lazy"
    />
    <div className="footer-atmosphere-overlay absolute inset-0 pointer-events-none" />
    <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-14 pb-7">
      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_.65fr_.65fr] gap-10 pb-12 border-b border-white/10">
        <div>
          <img src="/logo.png" alt="BreatheAI" className="h-12 w-auto object-contain brightness-0 invert" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#C4D1BA]">
            Clear air intelligence for everyday decisions—built around your location, your routines, and your wellbeing.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#65B9C9]/30 bg-white/5 px-3 py-1.5 text-[11px] text-[#C4D1BA]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#65B9C9] animate-pulse" />
            Live local conditions
          </div>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[.14em] font-semibold text-[#65B9C9]">Built for clarity</p>
          <ul className="mt-4 space-y-3 text-sm text-[#C4D1BA]">
            <li className="flex items-center gap-2"><Wind className="w-4 h-4" /> Local air conditions</li>
            <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Practical health guidance</li>
            <li className="flex items-center gap-2"><Leaf className="w-4 h-4" /> Cleaner-air escapes</li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[.14em] font-semibold text-[#65B9C9]">Data & standards</p>
          <p className="mt-4 text-sm leading-relaxed text-[#C4D1BA]">Measurements are enriched with weather context and interpreted against widely used air-quality guidance.</p>
          <a href="https://aqicn.org/faq/2015-09-18/map-web-service-real-time-air-quality-tile-api/" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-white hover:text-[#65B9C9] transition-colors">
            Data sources <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
      <div className="pt-6 flex flex-col sm:flex-row gap-3 items-center justify-between text-[11px] text-[#A8B99A]">
        <span>© 2026 BreatheAI. Designed for healthier days outdoors.</span>
        <span className="text-[#C4D1BA]">Breathe smarter. Live better.</span>
      </div>
    </div>
  </footer>
);

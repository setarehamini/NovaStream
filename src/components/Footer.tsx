import React from 'react';
import { Play, Film, Tv, Search, ShieldCheck } from 'lucide-react';
import { Language, RouteState, Theme } from '../types';
import { translations } from '../i18n/translations';

interface FooterProps {
  onNavigate: (route: RouteState) => void;
  language: Language;
  theme: Theme;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, language, theme }) => {
  const t = translations[language];

  return (
    <footer
      id="main-footer"
      className={`mt-20 border-t transition-colors ${
        theme === 'dark'
          ? 'bg-slate-950 border-slate-800 text-slate-400'
          : 'bg-slate-100/80 border-slate-200 text-slate-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-md">
                <Play className="w-4 h-4 text-white fill-white translate-x-0.5" />
              </div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-rose-500 via-rose-400 to-amber-400 bg-clip-text text-transparent">
                NOV<span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>A</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed max-w-md opacity-85">
              {t.tagline}. {t.footerDisclaimer}
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-500">
              <ShieldCheck className="w-4 h-4" />
              <span>Free High-Speed Video Player Integration</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate({ view: 'home' })}
                  className="hover:text-rose-500 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 opacity-70" /> {t.home}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ view: 'movies' })}
                  className="hover:text-rose-500 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Film className="w-3.5 h-3.5 opacity-70" /> {t.movies}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ view: 'series' })}
                  className="hover:text-rose-500 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Tv className="w-3.5 h-3.5 opacity-70" /> {t.series}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ view: 'search' })}
                  className="hover:text-rose-500 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 opacity-70" /> {t.search}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            © {new Date().getFullYear()} Nova Cinema. {t.footerRights}
          </div>
          <div className="flex items-center gap-4">
            <span className="opacity-75">EN / فارسی Supported</span>
            <span>•</span>
            <span className="opacity-75">Instant Streaming</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

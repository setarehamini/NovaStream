import React from 'react';
import { Home, Film, Tv, Search, ShieldCheck } from 'lucide-react';
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
          : 'bg-slate-100 border-slate-200 text-slate-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Info - Matching header styling & clickable home navigation */}
          <div className="md:col-span-2 space-y-4">
            <button
              id="footer-brand-logo-btn"
              onClick={() => onNavigate({ view: 'home' })}
              className="flex items-center gap-2.5 group cursor-pointer focus:outline-hidden text-left rtl:text-right"
              title="NovaFlix Home"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
                <Film className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col text-left rtl:text-right">
                <span className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Nova<span className="text-indigo-500">Flix</span>
                </span>
              </div>
            </button>
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
                  id="footer-nav-home"
                  onClick={() => onNavigate({ view: 'home' })}
                  className="hover:text-indigo-400 transition-colors flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Home className="w-4 h-4 text-indigo-400" /> {t.home}
                </button>
              </li>
              <li>
                <button
                  id="footer-nav-movies"
                  onClick={() => onNavigate({ view: 'movies' })}
                  className="hover:text-indigo-400 transition-colors flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Film className="w-4 h-4 opacity-70 hover:opacity-100" /> {t.movies}
                </button>
              </li>
              <li>
                <button
                  id="footer-nav-series"
                  onClick={() => onNavigate({ view: 'series' })}
                  className="hover:text-indigo-400 transition-colors flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Tv className="w-4 h-4 opacity-70 hover:opacity-100" /> {t.series}
                </button>
              </li>
              <li>
                <button
                  id="footer-nav-search"
                  onClick={() => onNavigate({ view: 'search' })}
                  className="hover:text-indigo-400 transition-colors flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Search className="w-4 h-4 opacity-70 hover:opacity-100" /> {t.search}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            © {new Date().getFullYear()} NovaFlix Cinema. {t.footerRights}
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

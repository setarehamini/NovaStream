import React, { useState } from 'react';
import { Film, Tv, Search, Moon, Sun, Globe, Menu, X, Play, Bookmark, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { Language, RouteState, Theme } from '../types';
import { translations } from '../i18n/translations';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentRoute: RouteState;
  onNavigate: (route: RouteState) => void;
  language: Language;
  onToggleLanguage: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { user, isAuthenticated, watchlist, logout, openAuthModal } = useAuth();
  const t = translations[language];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      onNavigate({ view: 'search', query: quickSearch.trim() });
      setQuickSearch('');
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: t.home, view: 'home' as const, icon: Play },
    { label: t.movies, view: 'movies' as const, icon: Film },
    { label: t.series, view: 'series' as const, icon: Tv },
    { label: t.watchlist, view: 'watchlist' as const, icon: Bookmark, badge: watchlist.length },
    { label: t.search, view: 'search' as const, icon: Search },
  ];

  return (
    <header
      id="main-navbar"
      className={`sticky top-0 z-50 transition-colors duration-300 backdrop-blur-md border-b ${
        theme === 'dark'
          ? 'bg-slate-950/85 border-slate-800/80 text-slate-100'
          : 'bg-white/90 border-slate-200/90 text-slate-800 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          id="brand-logo-btn"
          onClick={() => onNavigate({ view: 'home' })}
          className="flex items-center gap-2.5 group cursor-pointer focus:outline-hidden"
          title="NovaStream Home"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/25 group-hover:scale-105 transition-transform duration-200">
            <Play className="w-5 h-5 text-white fill-white translate-x-0.5" />
          </div>
          <div className="flex flex-col text-left rtl:text-right">
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-rose-500 via-rose-400 to-amber-400 bg-clip-text text-transparent">
              NOVA<span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>STREAM</span>
            </span>
            <span className="text-[10px] font-medium tracking-widest uppercase opacity-70 -mt-1">
              CINEMA & TV
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav id="desktop-navigation" className="hidden md:flex items-center gap-1.5">
          {navLinks.map(link => {
            const isActive = currentRoute.view === link.view;
            const Icon = link.icon;
            return (
              <button
                key={link.view}
                id={`nav-link-${link.view}`}
                onClick={() => onNavigate({ view: link.view })}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 cursor-pointer relative ${
                  isActive
                    ? 'bg-rose-500/15 text-rose-500 font-semibold'
                    : theme === 'dark'
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-500' : 'opacity-70'}`} />
                <span>{link.label}</span>
                {typeof link.badge === 'number' && link.badge > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-bold">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Search & Controls */}
        <div className="hidden sm:flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              id="navbar-search-input"
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder={t.searchPlaceholder.slice(0, 22) + "..."}
              className={`w-40 lg:w-56 pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-1.5 text-xs rounded-full border transition-all duration-200 focus:outline-hidden focus:w-52 lg:focus:w-64 ${
                theme === 'dark'
                  ? 'bg-slate-900/90 border-slate-700/70 text-slate-200 placeholder-slate-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'bg-slate-100 border-slate-300 text-slate-800 placeholder-slate-500 focus:border-rose-500 focus:bg-white focus:ring-1 focus:ring-rose-500'
              }`}
            />
            <Search className="w-3.5 h-3.5 absolute left-3 rtl:left-auto rtl:right-3 top-2.5 opacity-50" />
          </form>

          {/* Language Switcher */}
          <button
            id="toggle-language-btn"
            onClick={onToggleLanguage}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 text-slate-200'
                : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
            title="Switch Language (English / Persian)"
          >
            <Globe className="w-3.5 h-3.5 text-rose-500" />
            <span>{language === 'en' ? 'فارسی' : 'EN'}</span>
          </button>

          {/* Dark / Light Mode Switcher */}
          <button
            id="toggle-theme-btn"
            onClick={onToggleTheme}
            className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 text-amber-400'
                : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Auth Button: Sign In or User Profile */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-2 pl-2 pr-3 rtl:pr-2 rtl:pl-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-colors ${
                  theme === 'dark'
                    ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-rose-500'
                    : 'border-slate-300 bg-slate-50 text-slate-800 hover:border-rose-500'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center text-[11px] font-bold">
                  {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{user?.name || user?.email?.split('@')[0]}</span>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div
                  className={`absolute ltr:right-0 rtl:left-0 mt-2 w-48 rounded-2xl border shadow-xl py-2 z-50 transition-all ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-700/50 text-xs">
                    <p className="font-bold truncate">{user?.name || 'NovaStream Member'}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      onNavigate({ view: 'watchlist' });
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-xs flex items-center gap-2.5 hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer text-left rtl:text-right"
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>{t.watchlist}</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-xs flex items-center gap-2.5 text-rose-500 hover:bg-rose-500/10 cursor-pointer text-left rtl:text-right"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.signOut}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-xs shadow-md shadow-rose-500/25 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t.signIn}</span>
            </button>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden items-center gap-2">
          {!isAuthenticated && (
            <button
              onClick={() => openAuthModal('login')}
              className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t.signIn}</span>
            </button>
          )}
          <button
            id="mobile-theme-toggle"
            onClick={onToggleTheme}
            className="p-2 text-slate-400 hover:text-slate-100"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-slate-800/40"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          id="mobile-drawer"
          className={`sm:hidden px-4 pt-2 pb-6 border-b transition-all ${
            theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              id="mobile-search-input"
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 text-sm rounded-lg border ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
            <Search className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-3 opacity-50" />
          </form>

          <div className="flex flex-col gap-1">
            {navLinks.map(link => {
              const isActive = currentRoute.view === link.view;
              const Icon = link.icon;
              return (
                <button
                  key={link.view}
                  onClick={() => {
                    onNavigate({ view: link.view });
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between text-left rtl:text-right ${
                    isActive
                      ? 'bg-rose-500/15 text-rose-500 font-semibold'
                      : theme === 'dark'
                      ? 'text-slate-300 hover:bg-slate-900'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {typeof link.badge === 'number' && link.badge > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-bold">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-3 py-2.5 rounded-lg text-sm font-medium text-rose-500 flex items-center gap-3 text-left rtl:text-right mt-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.signOut} ({user?.name || user?.email?.split('@')[0]})</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  openAuthModal('login');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-3 py-2.5 rounded-lg text-sm font-semibold bg-rose-600 text-white flex items-center justify-center gap-2 mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{t.signIn} / {t.signUp}</span>
              </button>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
            <button
              onClick={() => {
                onToggleLanguage();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-sm font-medium text-rose-500"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'en' ? 'تغییر به فارسی (Persian)' : 'Switch to English'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};


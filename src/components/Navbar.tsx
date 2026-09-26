import React, { useState, useRef, useEffect } from 'react';
import { Film, Tv, Search, Moon, Sun, Globe, Menu, X, Home, Bookmark, Clock, Heart, History, LogIn, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
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
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, watchlist, watchLater, favorites, history, logout, openAuthModal } = useAuth();
  const t = translations[language];

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      onNavigate({ view: 'search', query: quickSearch.trim() });
      setQuickSearch('');
      setIsMobileMenuOpen(false);
    }
  };

  // Main navigation items for media catalog (clean & focused)
  const navLinks = [
    { label: t.home, view: 'home' as const, icon: Home },
    { label: t.movies, view: 'movies' as const, icon: Film },
    { label: t.series, view: 'series' as const, icon: Tv },
    { label: t.search, view: 'search' as const, icon: Search },
  ];

  return (
    <header
      id="main-navbar"
      className={`sticky top-0 z-50 transition-colors duration-300 backdrop-blur-md border-b ${
        theme === 'dark'
          ? 'bg-slate-950/95 border-slate-800/80 text-slate-100 shadow-xl'
          : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo - NovaFlix Modern Gradient Wordmark */}
        <button
          id="brand-logo-btn"
          onClick={() => onNavigate({ view: 'home' })}
          className="flex items-center gap-2.5 group cursor-pointer focus:outline-hidden"
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

        {/* Desktop Navigation Links */}
        <nav id="desktop-navigation" className="hidden md:flex items-center gap-1">
          {navLinks.map(link => {
            const isActive = currentRoute.view === link.view;
            const Icon = link.icon;
            return (
              <button
                key={link.view}
                id={`nav-link-${link.view}`}
                onClick={() => onNavigate({ view: link.view })}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                    : theme === 'dark'
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'opacity-70'}`} />
                <span>{link.label}</span>
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
              className={`w-40 lg:w-56 pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-1.5 text-sm font-medium rounded-xl border transition-all duration-200 focus:outline-hidden focus:w-52 lg:focus:w-64 ${
                theme === 'dark'
                  ? 'bg-slate-900/80 border-slate-700/80 text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500'
              }`}
            />
            <Search className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-2.5 opacity-50" />
          </form>

          {/* Language Switcher */}
          <button
            id="toggle-language-btn"
            onClick={onToggleLanguage}
            className={`px-3 py-1.5 rounded-xl border text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-200'
                : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
            }`}
            title="Switch Language (English / Persian)"
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>{language === 'en' ? 'فارسی' : 'EN'}</span>
          </button>

          {/* Dark / Light Mode Switcher */}
          <button
            id="toggle-theme-btn"
            onClick={onToggleTheme}
            className={`p-2 rounded-xl border text-sm transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-amber-400'
                : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
            }`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Auth Button: Sign In or User Profile */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                id="user-profile-menu-btn"
                type="button"
                aria-haspopup="true"
                aria-expanded={isUserMenuOpen}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsUserMenuOpen((prev) => !prev);
                }}
                className={`flex items-center gap-2 pl-2 pr-3 rtl:pr-2 rtl:pl-3 py-1.5 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                  isUserMenuOpen || currentRoute.view === 'account'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 ring-2 ring-indigo-500/20 font-bold'
                    : theme === 'dark'
                    ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-indigo-500'
                    : 'border-slate-300 bg-white text-slate-800 hover:border-indigo-500'
                }`}
                title={t.myAccount}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-lg object-cover shadow-xs border border-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-xs shrink-0">
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="max-w-[110px] truncate">{user?.name || user?.email?.split('@')[0]}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180 text-indigo-400' : 'text-slate-400'}`} />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div
                  className={`absolute ltr:right-0 rtl:left-0 top-full mt-2 w-60 rounded-2xl border shadow-2xl py-2 z-50 transition-all ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-200 shadow-black/80' : 'bg-white border-slate-200 text-slate-800 shadow-xl'
                  }`}
                >
                  <div
                    onClick={() => {
                      onNavigate({ view: 'account', tab: 'profile' });
                      setIsUserMenuOpen(false);
                    }}
                    className={`px-4 py-2.5 border-b cursor-pointer transition-colors flex items-center gap-3 ${
                      theme === 'dark' ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name || 'User'}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-700"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs truncate">{user?.name || 'Nova Member'}</p>
                      <p className={`text-[11px] truncate ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{user?.email}</p>
                      <span className="inline-block mt-0.5 text-[10px] font-semibold text-indigo-400">
                        {t.myAccount} →
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onNavigate({ view: 'account', tab: 'profile' });
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-xs flex items-center gap-2.5 hover:bg-indigo-600/10 hover:text-indigo-400 cursor-pointer text-left rtl:text-right"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>{t.accountOverview}</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate({ view: 'account', tab: 'watchlist' });
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-xs flex items-center justify-between hover:bg-indigo-600/10 hover:text-indigo-400 cursor-pointer text-left rtl:text-right"
                  >
                    <div className="flex items-center gap-2.5">
                      <Bookmark className="w-4 h-4 text-indigo-400" />
                      <span>{t.watchlist}</span>
                    </div>
                    {watchlist.length > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {watchlist.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onNavigate({ view: 'account', tab: 'watchlater' });
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-xs flex items-center justify-between hover:bg-indigo-600/10 hover:text-indigo-400 cursor-pointer text-left rtl:text-right"
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>{t.watchLater}</span>
                    </div>
                    {watchLater.length > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {watchLater.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onNavigate({ view: 'account', tab: 'favorites' });
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-xs flex items-center justify-between hover:bg-indigo-600/10 hover:text-indigo-400 cursor-pointer text-left rtl:text-right"
                  >
                    <div className="flex items-center gap-2.5">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>{t.favorites}</span>
                    </div>
                    {favorites.length > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {favorites.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onNavigate({ view: 'account', tab: 'history' });
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-xs flex items-center justify-between hover:bg-indigo-600/10 hover:text-indigo-400 cursor-pointer text-left rtl:text-right"
                  >
                    <div className="flex items-center gap-2.5">
                      <History className="w-4 h-4 text-slate-400" />
                      <span>{t.history}</span>
                    </div>
                    {history.length > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {history.length}
                      </span>
                    )}
                  </button>

                  <div className={`my-1 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`} />

                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-xs flex items-center gap-2.5 cursor-pointer text-left rtl:text-right ${
                      theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                    }`}
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
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all"
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
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
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
              className={`w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 text-sm rounded-xl border ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-400 focus:border-indigo-500'
                  : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-indigo-500'
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
                  className={`w-full px-3 py-2.5 rounded-md text-sm font-medium flex items-center justify-between text-left rtl:text-right ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 font-bold'
                      : theme === 'dark'
                      ? 'text-slate-300 hover:bg-slate-900'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                </button>
              );
            })}

            {isAuthenticated ? (
              <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col gap-1">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  {t.myAccount}
                </div>
                <button
                  onClick={() => {
                    onNavigate({ view: 'account', tab: 'profile' });
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-md text-sm font-medium flex items-center gap-3 text-left rtl:text-right hover:bg-slate-800/40"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>{t.accountOverview} ({user?.name || user?.email?.split('@')[0]})</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate({ view: 'account', tab: 'watchlist' });
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-md text-sm font-medium flex items-center justify-between text-left rtl:text-right hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3">
                    <Bookmark className="w-4 h-4 text-indigo-400" />
                    <span>{t.watchlist}</span>
                  </div>
                  {watchlist.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-bold">
                      {watchlist.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    onNavigate({ view: 'account', tab: 'watchlater' });
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-md text-sm font-medium flex items-center justify-between text-left rtl:text-right hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>{t.watchLater}</span>
                  </div>
                  {watchLater.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-bold">
                      {watchLater.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    onNavigate({ view: 'account', tab: 'favorites' });
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-md text-sm font-medium flex items-center justify-between text-left rtl:text-right hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>{t.favorites}</span>
                  </div>
                  {favorites.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-bold">
                      {favorites.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    onNavigate({ view: 'account', tab: 'history' });
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-md text-sm font-medium flex items-center justify-between text-left rtl:text-right hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3">
                    <History className="w-4 h-4 text-slate-400" />
                    <span>{t.history}</span>
                  </div>
                  {history.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-bold">
                      {history.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2.5 rounded-md text-sm font-medium text-slate-400 hover:text-white flex items-center gap-3 text-left rtl:text-right mt-1 hover:bg-slate-800/60"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.signOut}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  openAuthModal('login');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-3 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white flex items-center justify-center gap-2 mt-2 shadow-lg shadow-indigo-600/25"
              >
                <LogIn className="w-4 h-4" />
                <span>{t.signIn} / {t.signUp}</span>
              </button>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                onToggleLanguage();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-sm font-medium text-indigo-400"
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


import React, { useState, useEffect, useCallback } from 'react';
import { RouteState, Language, Theme } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { MoviesView } from './views/MoviesView';
import { SeriesView } from './views/SeriesView';
import { MovieDetailsView } from './views/MovieDetailsView';
import { SeriesDetailsView } from './views/SeriesDetailsView';
import { WatchMovieView } from './views/WatchMovieView';
import { WatchTvView } from './views/WatchTvView';
import { ActorDetailsView } from './views/ActorDetailsView';
import { AdvancedSearchView } from './views/AdvancedSearchView';
import { WatchlistView } from './views/WatchlistView';
import { AccountView } from './views/AccountView';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';

export default function App() {
  // Routing state
  const [currentRoute, setCurrentRoute] = useState<RouteState>(() => parseLocation(window.location.pathname, window.location.search));
  // Language state (en or fa)
  const [language, setLanguage] = useState<Language>('en');
  // Theme state (dark or light)
  const [theme, setTheme] = useState<Theme>('dark');

  // Synchronize HTML dir and lang attributes
  useEffect(() => {
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language === 'fa' ? 'fa' : 'en';
  }, [language]);

  // Synchronize Theme class on root/body
  useEffect(() => {
    if (theme === 'dark') {
      document.body.className = "bg-slate-950 text-slate-100 antialiased selection:bg-rose-500 selection:text-white";
    } else {
      document.body.className = "bg-slate-50 text-slate-900 antialiased selection:bg-rose-500 selection:text-white";
    }
  }, [theme]);

  // Parse path to RouteState
  function parseLocation(pathname: string, search: string): RouteState {
    const params = new URLSearchParams(search);
    const query = params.get('q') || '';

    const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
    const parts = cleanPath.split('/');

    if (parts[0] === 'movies') {
      return { view: 'movies', query: params.get('genre') || '' };
    }
    if (parts[0] === 'series') {
      return { view: 'series' };
    }
    if (parts[0] === 'account') {
      const tabParam = params.get('tab') as any;
      return { view: 'account', tab: tabParam || 'profile' };
    }
    if (parts[0] === 'watchlist') {
      return { view: 'account', tab: 'watchlist' };
    }
    if (parts[0] === 'history') {
      return { view: 'account', tab: 'history' };
    }
    if (parts[0] === 'movie' && parts[1]) {
      return { view: 'movie-detail', id: parseInt(parts[1], 10) };
    }
    if (parts[0] === 'tv' && parts[1]) {
      return { view: 'series-detail', id: parseInt(parts[1], 10) };
    }
    if (parts[0] === 'actors' && parts[1]) {
      return { view: 'actor-detail', id: parseInt(parts[1], 10) };
    }
    if (parts[0] === 'watch') {
      if (parts[1] === 'movie' && parts[2]) {
        return { view: 'watch-movie', id: parseInt(parts[2], 10) };
      }
      if (parts[1] === 'tv' && parts[2]) {
        return {
          view: 'watch-tv',
          id: parseInt(parts[2], 10),
          season: parseInt(parts[3] || '1', 10),
          episode: parseInt(parts[4] || '1', 10),
        };
      }
    }
    if (parts[0] === 'search') {
      return { view: 'search', query };
    }

    return { view: 'home' };
  }

  // Handle URL change
  const navigate = useCallback((route: RouteState) => {
    let url = '/';
    if (route.view === 'movies') {
      url = route.query ? `/movies?genre=${encodeURIComponent(route.query)}` : '/movies';
    } else if (route.view === 'series') {
      url = '/series';
    } else if (route.view === 'account') {
      url = route.tab ? `/account?tab=${route.tab}` : '/account';
    } else if (route.view === 'watchlist') {
      url = '/account?tab=watchlist';
    } else if (route.view === 'history') {
      url = '/account?tab=history';
    } else if (route.view === 'movie-detail' && route.id) {
      url = `/movie/${route.id}`;
    } else if (route.view === 'series-detail' && route.id) {
      url = `/tv/${route.id}`;
    } else if (route.view === 'actor-detail' && route.id) {
      url = `/actors/${route.id}`;
    } else if (route.view === 'watch-movie' && route.id) {
      url = `/watch/movie/${route.id}`;
    } else if (route.view === 'watch-tv' && route.id) {
      url = `/watch/tv/${route.id}/${route.season || 1}/${route.episode || 1}`;
    } else if (route.view === 'search') {
      url = route.query ? `/search?q=${encodeURIComponent(route.query)}` : '/search';
    }

    window.history.pushState(null, '', url);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen to browser popstate (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(parseLocation(window.location.pathname, window.location.search));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'fa' : 'en'));
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <AuthProvider>
      <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>
        {/* Global Auth Modal */}
        <AuthModal language={language} theme={theme} />

        {/* Global Navbar */}
        <Navbar
          currentRoute={currentRoute}
          onNavigate={navigate}
          language={language}
          onToggleLanguage={handleToggleLanguage}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Main Content Area */}
        <main className="flex-1">
          {currentRoute.view === 'home' && (
            <HomeView
              onNavigate={navigate}
              language={language}
              theme={theme}
            />
          )}

          {currentRoute.view === 'movies' && (
            <MoviesView
              onNavigate={navigate}
              language={language}
              theme={theme}
              initialGenreId={currentRoute.query}
            />
          )}

          {currentRoute.view === 'series' && (
            <SeriesView
              onNavigate={navigate}
              language={language}
              theme={theme}
            />
          )}

          {(currentRoute.view === 'account' || currentRoute.view === 'watchlist' || currentRoute.view === 'history') && (
            <AccountView
              initialTab={currentRoute.tab || (currentRoute.view === 'watchlist' ? 'watchlist' : currentRoute.view === 'history' ? 'history' : 'profile')}
              onNavigate={navigate}
              language={language}
              onToggleLanguage={handleToggleLanguage}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />
          )}

          {currentRoute.view === 'movie-detail' && currentRoute.id && (
            <MovieDetailsView
              id={currentRoute.id}
              onNavigate={navigate}
              language={language}
              theme={theme}
            />
          )}

          {currentRoute.view === 'series-detail' && currentRoute.id && (
            <SeriesDetailsView
              id={currentRoute.id}
              onNavigate={navigate}
              language={language}
              theme={theme}
            />
          )}

          {currentRoute.view === 'watch-movie' && currentRoute.id && (
            <WatchMovieView
              id={currentRoute.id}
              onNavigate={navigate}
              language={language}
              theme={theme}
            />
          )}

          {currentRoute.view === 'watch-tv' && currentRoute.id && (
            <WatchTvView
              id={currentRoute.id}
              season={currentRoute.season || 1}
              episode={currentRoute.episode || 1}
              onNavigate={navigate}
              language={language}
              theme={theme}
            />
          )}

          {currentRoute.view === 'actor-detail' && currentRoute.id && (
            <ActorDetailsView
              id={currentRoute.id}
              onNavigate={navigate}
              language={language}
              theme={theme}
            />
          )}

          {currentRoute.view === 'search' && (
            <AdvancedSearchView
              initialQuery={currentRoute.query}
              onNavigate={navigate}
              language={language}
              theme={theme}
            />
          )}
        </main>

        {/* Global Footer */}
        <Footer
          onNavigate={navigate}
          language={language}
          theme={theme}
        />
      </div>
    </AuthProvider>
  );
}

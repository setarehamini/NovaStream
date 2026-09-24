import React, { useState } from 'react';
import { Bookmark, Heart, History, Trash2, Play, Film, Tv, Sparkles, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RouteState, Language, Theme, UserWatchlistItem, UserHistoryItem } from '../types';
import { translations } from '../i18n/translations';
import { TMDBService } from '../services';

interface WatchlistViewProps {
  initialTab?: 'watchlist' | 'favorites' | 'history';
  onNavigate: (route: RouteState) => void;
  language: Language;
  theme: Theme;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  initialTab = 'watchlist',
  onNavigate,
  language,
  theme,
}) => {
  const {
    user,
    isAuthenticated,
    watchlist,
    favorites,
    history,
    removeFromWatchlist,
    removeFromFavorites,
    clearHistory,
    openAuthModal,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'watchlist' | 'favorites' | 'history'>(initialTab);
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');

  const t = translations[language];

  // If not authenticated, show sign-in callout
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/10">
          <Bookmark className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
          {t.watchlist}
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto mb-8">
          {language === 'fa'
            ? 'برای دسترسی به لیست تماشا، علاقه‌مندی‌ها و تاریخچه مشاهده در تمامی دستگاه‌ها، لطفاً وارد حساب کاربری خود شوید.'
            : 'Sign in to sync your personal Watchlist, favorites, and watch history across all your devices.'}
        </p>
        <button
          onClick={() => openAuthModal('login', 'Sign in to access your Watchlist and saved streaming history.')}
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-sm shadow-xl shadow-indigo-500/25 transition-all cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>{t.signIn} / {t.signUp}</span>
        </button>
      </div>
    );
  }

  // Current items based on tab
  const rawItems = activeTab === 'watchlist' ? watchlist : activeTab === 'favorites' ? favorites : history;
  const filteredItems = rawItems.filter((item) => {
    if (filterType === 'all') return true;
    return item.mediaType === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-screen">
      {/* Header and User Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {t.library}
            </span>
            <span className="text-xs text-slate-400">
              {user?.name || user?.email}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {activeTab === 'watchlist' ? t.watchlist : activeTab === 'favorites' ? t.favorites : t.history}
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className={`flex items-center gap-1.5 p-1.5 rounded-2xl border ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'watchlist'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>{t.watchlist}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === 'watchlist' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              {watchlist.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>{t.favorites}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === 'favorites' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              {favorites.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{t.history}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              {history.length}
            </span>
          </button>
        </div>
      </div>

      {/* Sub-bar: Filter pills & History Clear action */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              filterType === 'all'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                : theme === 'dark' ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-700 hover:text-slate-950'
            }`}
          >
            {t.all} ({rawItems.length})
          </button>
          <button
            onClick={() => setFilterType('movie')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              filterType === 'movie'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                : theme === 'dark' ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-700 hover:text-slate-950'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>{t.movies}</span>
          </button>
          <button
            onClick={() => setFilterType('tv')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              filterType === 'tv'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                : theme === 'dark' ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-700 hover:text-slate-950'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>{t.series}</span>
          </button>
        </div>

        {activeTab === 'history' && history.length > 0 && (
          <button
            onClick={() => clearHistory()}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 font-semibold cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.clearHistory}</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 ? (
        <div className={`p-12 sm:p-16 rounded-3xl border text-center ${
          theme === 'dark' ? 'bg-slate-900/50 border-slate-800/80' : 'bg-white border-slate-200'
        }`}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-500/10 flex items-center justify-center text-slate-400">
            {activeTab === 'watchlist' ? <Bookmark className="w-8 h-8" /> : activeTab === 'favorites' ? <Heart className="w-8 h-8" /> : <History className="w-8 h-8" />}
          </div>
          <h3 className="text-lg sm:text-xl font-bold mb-2">
            {activeTab === 'watchlist' ? t.emptyWatchlist : activeTab === 'favorites' ? t.emptyWatchlist : t.emptyHistory}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-6">
            {activeTab === 'watchlist'
              ? t.emptyWatchlistDesc
              : activeTab === 'favorites'
              ? (language === 'fa' ? 'عناوینی که قلب می‌زنید اینجا ذخیره می‌شوند.' : 'Titles you favorite will appear here for fast access.')
              : (language === 'fa' ? 'عناوینی که شروع به تماشا می‌کنید اینجا ثبت می‌شوند.' : 'Movies and episodes you stream will be remembered here.')}
          </p>
          <button
            onClick={() => onNavigate({ view: 'movies' })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{language === 'fa' ? 'کاوش فیلم‌ها و سریال‌ها' : 'Discover Movies & Shows'}</span>
          </button>
        </div>
      ) : (
        /* Items Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {filteredItems.map((item) => {
            const isMovie = item.mediaType === 'movie';
            const displayTitle = item.title || item.name || 'Untitled';
            const posterUrl = TMDBService.getImageUrl(item.posterPath, 'w342');
            const releaseYear = (('releaseDate' in item ? item.releaseDate : '') || ('firstAirDate' in item ? item.firstAirDate : ''))?.split('-')[0] || '';
            const voteAvg = 'voteAverage' in item && typeof item.voteAverage === 'number' ? item.voteAverage : undefined;

            return (
              <div
                key={item.id}
                className={`group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                {/* Poster */}
                <div
                  className="relative aspect-2/3 bg-slate-950 overflow-hidden cursor-pointer"
                  onClick={() => {
                    if (isMovie) {
                      onNavigate({ view: 'watch-movie', id: item.mediaId });
                    } else {
                      const hist = item as any;
                      onNavigate({
                        view: 'watch-tv',
                        id: item.mediaId,
                        season: hist.season || 1,
                        episode: hist.episode || 1,
                      });
                    }
                  }}
                >
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={displayTitle}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-500">
                      <Film className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs line-clamp-2">{displayTitle}</span>
                    </div>
                  )}

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Media Type Badge */}
                  <span className="absolute top-2.5 ltr:left-2.5 rtl:right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/10">
                    {isMovie ? t.movies : t.series}
                  </span>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (activeTab === 'watchlist') {
                        removeFromWatchlist(item.mediaType, item.mediaId);
                      } else if (activeTab === 'favorites') {
                        removeFromFavorites(item.mediaType, item.mediaId);
                      }
                    }}
                    className="absolute top-2.5 ltr:right-2.5 rtl:left-2.5 p-1.5 rounded-full bg-black/70 backdrop-blur-md text-slate-300 hover:text-red-400 hover:bg-black/90 transition-colors cursor-pointer"
                    title={t.removeFromWatchlist}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-3 flex flex-col flex-1 justify-between">
                  <div>
                    <h4
                      onClick={() => {
                        if (isMovie) {
                          onNavigate({ view: 'movie-detail', id: item.mediaId });
                        } else {
                          onNavigate({ view: 'series-detail', id: item.mediaId });
                        }
                      }}
                      className="font-bold text-xs sm:text-sm line-clamp-1 hover:text-indigo-400 transition-colors cursor-pointer"
                      title={displayTitle}
                    >
                      {displayTitle}
                    </h4>

                    {/* Sub info */}
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      {releaseYear && <span>{releaseYear}</span>}
                      {voteAvg !== undefined && (
                        <span>★ {voteAvg.toFixed(1)}</span>
                      )}
                      {(item as any).season && (
                        <span className="text-indigo-400 font-semibold">
                          S{(item as any).season} E{(item as any).episode}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Direct Watch Button */}
                  <button
                    onClick={() => {
                      if (isMovie) {
                        onNavigate({ view: 'watch-movie', id: item.mediaId });
                      } else {
                        const hist = item as any;
                        onNavigate({
                          view: 'watch-tv',
                          id: item.mediaId,
                          season: hist.season || 1,
                          episode: hist.episode || 1,
                        });
                      }
                    }}
                    className="mt-2.5 w-full py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{t.watchNow}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

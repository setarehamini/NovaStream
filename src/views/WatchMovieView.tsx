import React, { useState, useEffect } from 'react';
import { ArrowLeft, Server, Star, Calendar, Maximize2, Minimize2, AlertCircle, Lock, Bookmark, Heart, Check, Sparkles, LogIn } from 'lucide-react';
import { MovieDetails, RouteState, Theme, Language } from '../types';
import { MovieService, TMDBService, VideoService } from '../services';
import { StreamServer } from '../services/videoService';
import { MovieCard } from '../components/MovieCard';
import { translations } from '../i18n/translations';
import { useAuth } from '../context/AuthContext';

interface WatchMovieViewProps {
  id: number;
  onNavigate: (route: RouteState) => void;
  language: Language;
  theme: Theme;
}

export const WatchMovieView: React.FC<WatchMovieViewProps> = ({
  id,
  onNavigate,
  language,
  theme,
}) => {
  const {
    isAuthenticated,
    openAuthModal,
    logWatchHistory,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  } = useAuth();

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeServer, setActiveServer] = useState<StreamServer>('vidcore');
  const [isWideTheater, setIsWideTheater] = useState(false);
  const hasLoggedRef = React.useRef<number | null>(null);

  const t = translations[language];

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    window.scrollTo(0, 0);

    async function loadMovie() {
      try {
        const langParam = language === 'fa' ? 'fa-IR' : 'en-US';
        const data = await MovieService.getDetails(id, langParam);
        if (isMounted) setMovie(data);
      } catch (err) {
        console.error("WatchMovie load error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadMovie();
    return () => { isMounted = false; };
  }, [id, language]);

  // Log watch history to database once authenticated and movie loaded
  useEffect(() => {
    if (isAuthenticated && movie && hasLoggedRef.current !== id) {
      hasLoggedRef.current = id;
      logWatchHistory({
        mediaId: id,
        mediaType: 'movie',
        title: movie.title,
        posterPath: movie.poster_path,
        progressPercent: 100,
      });
    }
  }, [isAuthenticated, movie, id, logWatchHistory]);

  const embedUrl = VideoService.getMovieEmbedUrl(id, activeServer);

  const inQueue = isInWatchlist('movie', id);
  const isFav = isFavorite('movie', id);

  const handleToggleWatchlist = () => {
    if (!movie) return;
    if (inQueue) {
      removeFromWatchlist('movie', id);
    } else {
      addToWatchlist({
        mediaId: id,
        mediaType: 'movie',
        title: movie.title,
        posterPath: movie.poster_path,
        backdropPath: movie.backdrop_path,
        voteAverage: movie.vote_average,
        releaseDate: movie.release_date,
        overview: movie.overview,
      });
    }
  };

  const handleToggleFavorite = () => {
    if (!movie) return;
    if (isFav) {
      removeFromFavorites('movie', id);
    } else {
      addToFavorites({
        mediaId: id,
        mediaType: 'movie',
        title: movie.title,
        posterPath: movie.poster_path,
        backdropPath: movie.backdrop_path,
        voteAverage: movie.vote_average,
        releaseDate: movie.release_date,
        overview: movie.overview,
      });
    }
  };

  const servers: { id: StreamServer; name: string }[] = [
    { id: 'vidcore', name: t.serverPrimary },
    { id: 'vidsrc_icu', name: t.serverBackup1 },
    { id: 'vidsrc_cc', name: t.serverBackup2 },
    { id: 'embed_su', name: t.serverBackup3 },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Top Bar Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
        <button
          id="back-to-details-btn"
          onClick={() => onNavigate({ view: 'movie-detail', id })}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-rose-500 hover:text-rose-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{movie ? `${t.moreInfo}: ${movie.title}` : t.movies}</span>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Watchlist Quick Button */}
          <button
            onClick={handleToggleWatchlist}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
              inQueue
                ? 'bg-rose-600 border-rose-600 text-white'
                : theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {inQueue ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{inQueue ? t.inWatchlist : t.addToWatchlist}</span>
          </button>

          {/* Favorite Quick Button */}
          <button
            onClick={handleToggleFavorite}
            className={`p-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
              isFav
                ? 'bg-rose-500/10 border-rose-500 text-rose-500'
                : theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-500'
                : 'bg-white border-slate-300 text-slate-500 hover:text-rose-500'
            }`}
            title={t.favorites}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {/* Theater mode button */}
          <button
            id="toggle-theater-btn"
            onClick={() => setIsWideTheater(!isWideTheater)}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isWideTheater ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isWideTheater ? 'Standard View' : 'Theater View'}</span>
          </button>
        </div>
      </div>

      {/* Actual Video Streaming Player Container */}
      <div className={`${isWideTheater ? 'w-full px-2 sm:px-6' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'} transition-all duration-300`}>
        <div className="relative w-full aspect-16/9 bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80">
          {isAuthenticated ? (
            <iframe
              id="movie-streaming-iframe"
              key={`${id}-${activeServer}`}
              src={embedUrl}
              title={movie?.title || "Movie Player"}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            /* Auth Required Lock Screen */
            <div className="relative w-full h-full flex items-center justify-center p-6 overflow-hidden">
              {/* Blurred Movie Backdrop */}
              {movie?.backdrop_path && (
                <img
                  src={TMDBService.getImageUrl(movie.backdrop_path, 'original')}
                  alt="Backdrop"
                  className="absolute inset-0 w-full h-full object-cover blur-md opacity-25 scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-950/70" />

              {/* Lock Content Box */}
              <div className="relative z-10 max-w-lg text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-3xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-500 mb-4 shadow-lg shadow-rose-500/20 animate-pulse">
                  <Lock className="w-8 h-8" />
                </div>

                <span className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-2">
                  {t.streamingLocked}
                </span>

                <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
                  {movie?.title ? `${t.watchMovie}: ${movie.title}` : t.watchNow}
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 mb-6 max-w-md">
                  {t.loginRequiredDesc}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => openAuthModal('login', t.loginRequiredDesc)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-rose-500/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{t.loginRequiredToWatch}</span>
                  </button>

                  <button
                    onClick={() => openAuthModal('register', t.loginRequiredDesc)}
                    className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all hover:scale-105 backdrop-blur-md"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{t.signUp}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Server Switcher Bar */}
        <div className={`mt-4 p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500">
            <Server className="w-4 h-4" />
            <span>{t.server}:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {servers.map((srv) => (
              <button
                key={srv.id}
                id={`server-btn-${srv.id}`}
                onClick={() => {
                  if (!isAuthenticated) {
                    openAuthModal('login', t.loginRequiredDesc);
                  } else {
                    setActiveServer(srv.id);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeServer === srv.id
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : theme === 'dark'
                    ? 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                {srv.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px]">{t.streamingNotice}</span>
          </div>
        </div>
      </div>

      {/* Movie Information & Recommendations */}
      {movie && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-md bg-rose-600/20 text-rose-500 font-bold border border-rose-500/30">
                Now Streaming
              </span>
              {movie.vote_average ? (
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {movie.vote_average.toFixed(1)}
                </span>
              ) : null}
              {movie.release_date && (
                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" /> {new Date(movie.release_date).getFullYear()}
                </span>
              )}
            </div>

            <h1 className={`text-2xl sm:text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {movie.title}
            </h1>

            <p className={`text-sm leading-relaxed max-w-3xl ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              {movie.overview}
            </p>
          </div>

          {/* Recommendations / Similar Movies */}
          {movie.similar?.results && movie.similar.results.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-800/50">
              <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t.similarMovies}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {movie.similar.results.slice(0, 6).map((item) => (
                  <MovieCard
                    key={item.id}
                    item={item}
                    onNavigate={onNavigate}
                    language={language}
                    theme={theme}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

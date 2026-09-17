import React, { useState, useEffect } from 'react';
import { ArrowLeft, Server, Star, Calendar, Maximize2, Minimize2, AlertCircle } from 'lucide-react';
import { MovieDetails, RouteState, Theme, Language } from '../types';
import { MovieService, VideoService } from '../services';
import { StreamServer } from '../services/videoService';
import { MovieCard } from '../components/MovieCard';
import { translations } from '../i18n/translations';

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
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeServer, setActiveServer] = useState<StreamServer>('vidcore');
  const [isWideTheater, setIsWideTheater] = useState(false);

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

  const embedUrl = VideoService.getMovieEmbedUrl(id, activeServer);

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

      {/* Actual Video Streaming Player Container */}
      <div className={`${isWideTheater ? 'w-full px-2 sm:px-6' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'} transition-all duration-300`}>
        <div className="relative w-full aspect-16/9 bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80">
          <iframe
            id="movie-streaming-iframe"
            key={`${id}-${activeServer}`}
            src={embedUrl}
            title={movie?.title || "Movie Player"}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
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
                onClick={() => setActiveServer(srv.id)}
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
                    mediaTypeFallback="movie"
                    onNavigate={onNavigate}
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

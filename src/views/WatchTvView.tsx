import React, { useState, useEffect } from 'react';
import { ArrowLeft, Server, ChevronLeft, ChevronRight, Play, Layers, AlertCircle, Maximize2, Minimize2, Lock, Bookmark, Heart, Check, Sparkles, LogIn } from 'lucide-react';
import { Episode, RouteState, SeasonDetails, Theme, TVDetails, Language } from '../types';
import { SeriesService, TMDBService, VideoService } from '../services';
import { StreamServer } from '../services/videoService';
import { translations } from '../i18n/translations';
import { useAuth } from '../context/AuthContext';

interface WatchTvViewProps {
  id: number;
  season: number;
  episode: number;
  onNavigate: (route: RouteState) => void;
  language: Language;
  theme: Theme;
}

export const WatchTvView: React.FC<WatchTvViewProps> = ({
  id,
  season,
  episode,
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

  const [series, setSeries] = useState<TVDetails | null>(null);
  const [seasonData, setSeasonData] = useState<SeasonDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeServer, setActiveServer] = useState<StreamServer>('vidcore');
  const [isWideTheater, setIsWideTheater] = useState(false);
  const hasLoggedRef = React.useRef<string | null>(null);

  const t = translations[language];

  // Load TV Details and Season Details
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    window.scrollTo(0, 0);

    async function loadData() {
      try {
        const langParam = language === 'fa' ? 'fa-IR' : 'en-US';
        const [tvData, sData] = await Promise.all([
          SeriesService.getDetails(id, langParam),
          SeriesService.getSeasonDetails(id, season, langParam),
        ]);
        if (isMounted) {
          setSeries(tvData);
          setSeasonData(sData);
        }
      } catch (err) {
        console.error("WatchTV load error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [id, season, language]);

  const totalEpisodesInSeason = seasonData?.episodes?.length || 0;
  const currentEpData = seasonData?.episodes?.find((e: Episode) => e.episode_number === episode);

  // Log watch history to database once authenticated and series loaded
  useEffect(() => {
    const epKey = `${id}-${season}-${episode}`;
    if (isAuthenticated && series && hasLoggedRef.current !== epKey) {
      hasLoggedRef.current = epKey;
      logWatchHistory({
        mediaId: id,
        mediaType: 'tv',
        name: series.name,
        posterPath: series.poster_path,
        season,
        episode,
        episodeTitle: currentEpData?.name || `Episode ${episode}`,
        progressPercent: 100,
      });
    }
  }, [isAuthenticated, series, id, season, episode, currentEpData?.name, logWatchHistory]);

  const embedUrl = VideoService.getTvEmbedUrl(id, season, episode, activeServer);

  const inQueue = isInWatchlist('tv', id);
  const isFav = isFavorite('tv', id);

  const handleToggleWatchlist = () => {
    if (!series) return;
    if (inQueue) {
      removeFromWatchlist('tv', id);
    } else {
      addToWatchlist({
        mediaId: id,
        mediaType: 'tv',
        name: series.name,
        posterPath: series.poster_path,
        backdropPath: series.backdrop_path,
        voteAverage: series.vote_average,
        firstAirDate: series.first_air_date,
        overview: series.overview,
      });
    }
  };

  const handleToggleFavorite = () => {
    if (!series) return;
    if (isFav) {
      removeFromFavorites('tv', id);
    } else {
      addToFavorites({
        mediaId: id,
        mediaType: 'tv',
        name: series.name,
        posterPath: series.poster_path,
        backdropPath: series.backdrop_path,
        voteAverage: series.vote_average,
        firstAirDate: series.first_air_date,
        overview: series.overview,
      });
    }
  };

  const servers: { id: StreamServer; name: string }[] = [
    { id: 'vidcore', name: t.serverPrimary },
    { id: 'vidsrc_icu', name: t.serverBackup1 },
    { id: 'vidsrc_cc', name: t.serverBackup2 },
    { id: 'embed_su', name: t.serverBackup3 },
  ];

  const availableSeasons = (series?.seasons || [])
    .slice()
    .sort((a, b) => a.season_number - b.season_number);

  const hasPrevEpisode = episode > 1;
  const hasNextEpisode = episode < totalEpisodesInSeason;

  const handlePrevEpisode = () => {
    if (hasPrevEpisode) {
      onNavigate({ view: 'watch-tv', id, season, episode: episode - 1 });
    }
  };

  const handleNextEpisode = () => {
    if (hasNextEpisode) {
      onNavigate({ view: 'watch-tv', id, season, episode: episode + 1 });
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Top Bar Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
        <button
          id="back-to-tv-details-btn"
          onClick={() => onNavigate({ view: 'series-detail', id })}
          className={`flex items-center gap-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'
          }`}
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{series ? `${t.moreInfo}: ${series.name}` : t.series}</span>
        </button>

        {/* Previous & Next Episode controls in header */}
        <div className="flex items-center gap-2">
          {/* Watchlist Quick Button */}
          <button
            onClick={handleToggleWatchlist}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
              inQueue
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {inQueue ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{inQueue ? t.inWatchlist : t.addToWatchlist}</span>
          </button>

          {/* Favorite Quick Button */}
          <button
            onClick={handleToggleFavorite}
            className={`p-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
              isFav
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-500'
                : theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-rose-500'
                : 'bg-white border-slate-300 text-slate-500 hover:text-rose-500'
            }`}
            title={t.favorites}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          <button
            id="watch-prev-ep-btn"
            disabled={!hasPrevEpisode}
            onClick={handlePrevEpisode}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors ${
              !hasPrevEpisode
                ? 'opacity-40 cursor-not-allowed border-transparent text-slate-500'
                : theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white cursor-pointer'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer'
            }`}
          >
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            <span className="hidden sm:inline">{t.prevEpisode}</span>
          </button>

          <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/40">
            S{season} : E{episode}
          </span>

          <button
            id="watch-next-ep-btn"
            disabled={!hasNextEpisode}
            onClick={handleNextEpisode}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors ${
              !hasNextEpisode
                ? 'opacity-40 cursor-not-allowed border-transparent text-slate-500'
                : theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white cursor-pointer'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer'
            }`}
          >
            <span className="hidden sm:inline">{t.nextEpisode}</span>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>

          <button
            id="toggle-tv-theater-btn"
            onClick={() => setIsWideTheater(!isWideTheater)}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-semibold cursor-pointer transition-colors ml-2 ${
              theme === 'dark'
                ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
                : 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            {isWideTheater ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Actual Video Streaming Player Container */}
      <div className={`${isWideTheater ? 'w-full px-2 sm:px-6' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'} transition-all duration-300`}>
        <div className="relative w-full aspect-16/9 bg-black rounded-lg sm:rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
          {isAuthenticated ? (
            <iframe
              id="tv-streaming-iframe"
              key={`${id}-${season}-${episode}-${activeServer}`}
              src={embedUrl}
              title={series ? `${series.name} S${season}E${episode}` : "TV Player"}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            /* Auth Required Lock Screen */
            <div className="relative w-full h-full flex items-center justify-center p-6 overflow-hidden">
              {/* Blurred Series Backdrop */}
              {series?.backdrop_path && (
                <img
                  src={TMDBService.getImageUrl(series.backdrop_path, 'original')}
                  alt="Backdrop"
                  className="absolute inset-0 w-full h-full object-cover blur-md opacity-25 scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60" />

              {/* Lock Content Box */}
              <div className="relative z-10 max-w-lg text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-4 shadow-lg shadow-indigo-600/20 animate-pulse">
                  <Lock className="w-8 h-8" />
                </div>

                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
                  {t.streamingLocked}
                </span>

                <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
                  {series?.name ? `${series.name} - S${season}:E${episode}` : t.watchNow}
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 mb-6 max-w-md">
                  {t.loginRequiredDesc}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => openAuthModal('login', t.loginRequiredDesc)}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
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

        {/* Server & Next/Prev Navigation Bar */}
        <div className={`mt-4 p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <Server className="w-4 h-4" />
            <span>{t.server}:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {servers.map((srv) => (
              <button
                key={srv.id}
                id={`tv-server-btn-${srv.id}`}
                onClick={() => {
                  if (!isAuthenticated) {
                    openAuthModal('login', t.loginRequiredDesc);
                  } else {
                    setActiveServer(srv.id);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeServer === srv.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : theme === 'dark'
                    ? 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
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

      {/* Series & Current Episode Details + Season Episode List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Current Episode Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/25 font-bold uppercase tracking-wider text-[11px] shadow-sm">
                SERIES
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-bold border border-slate-700">
                {t.season} {season} • {t.episode} {episode}
              </span>
              {currentEpData?.air_date && (
                <span className="text-slate-500 text-xs">{currentEpData.air_date}</span>
              )}
            </div>

            <h1 className={`text-2xl sm:text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {series?.name}: {currentEpData?.name || `Episode ${episode}`}
            </h1>

            <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              {currentEpData?.overview || series?.overview || 'Enjoy streaming this episode.'}
            </p>
          </div>

          {/* Previous/Next episode buttons banner */}
          <div className="pt-4 flex items-center gap-3">
            <button
              disabled={!hasPrevEpisode}
              onClick={handlePrevEpisode}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer border border-slate-700"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
              <span>{t.prevEpisode}</span>
            </button>

            <button
              disabled={!hasNextEpisode}
              onClick={handleNextEpisode}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-md shadow-indigo-600/30"
            >
              <span>{t.nextEpisode}</span>
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>

        {/* Right Column: Episode Playlist */}
        <div
          className={`p-5 rounded-2xl border space-y-4 h-[480px] flex flex-col ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
              {availableSeasons.length > 1 ? (
                <select
                  id="watch-tv-season-select"
                  value={season}
                  onChange={(e) => onNavigate({ view: 'watch-tv', id, season: Number(e.target.value), episode: 1 })}
                  className={`text-xs font-bold px-2.5 py-1 rounded-xl border cursor-pointer outline-hidden ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-slate-200 focus:border-indigo-500'
                      : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500 shadow-xs'
                  }`}
                >
                  {availableSeasons.map((s) => (
                    <option key={s.id} value={s.season_number}>
                      {s.name || `${t.season} ${s.season_number}`}
                    </option>
                  ))}
                </select>
              ) : (
                <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {seasonData?.name || `${t.season} ${season}`} {t.episodes}
                </h3>
              )}
            </div>
            <span className="text-xs text-slate-500 font-mono shrink-0">
              {totalEpisodesInSeason} eps
            </span>
          </div>

          {/* Scrollable episode list */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {seasonData?.episodes?.map((ep: Episode) => {
              const isPlaying = ep.episode_number === episode;
              return (
                <div
                  key={ep.id}
                  onClick={() => onNavigate({ view: 'watch-tv', id, season, episode: ep.episode_number })}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isPlaying
                      ? 'bg-indigo-600/15 border-indigo-500/50 text-indigo-400 font-bold'
                      : theme === 'dark'
                      ? 'bg-slate-950/60 border-slate-800/70 hover:border-slate-700 text-slate-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono shrink-0 ${
                      isPlaying ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {ep.episode_number}
                    </div>
                    <span className="text-xs truncate font-medium">
                      {ep.name || `Episode ${ep.episode_number}`}
                    </span>
                  </div>

                  <Play className={`w-3.5 h-3.5 shrink-0 ${isPlaying ? 'text-indigo-400 fill-indigo-400' : 'opacity-40'}`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

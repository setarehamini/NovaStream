import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, Video, Star, Calendar, ArrowLeft, Users, Tv, Layers, ChevronLeft, ChevronRight, Bookmark, Heart, Check, Clock, Search, X, ChevronsLeft, ChevronsRight, Hash } from 'lucide-react';
import { Episode, RouteState, SeasonDetails, Theme, TVDetails, VideoItem, Language } from '../types';
import { SeriesService, TMDBService, VideoService } from '../services';
import { MovieCard } from '../components/MovieCard';
import { TrailerModal } from '../components/TrailerModal';
import { SkeletonGrid } from '../components/SkeletonGrid';
import { translations } from '../i18n/translations';
import { useAuth } from '../context/AuthContext';

interface SeriesDetailsViewProps {
  id: number;
  onNavigate: (route: RouteState) => void;
  language: Language;
  theme: Theme;
}

export const SeriesDetailsView: React.FC<SeriesDetailsViewProps> = ({
  id,
  onNavigate,
  language,
  theme,
}) => {
  const {
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    addToWatchLater,
    removeFromWatchLater,
    isInWatchLater,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  } = useAuth();
  const [series, setSeries] = useState<TVDetails | null>(null);
  const [selectedSeasonNum, setSelectedSeasonNum] = useState<number>(1);
  const [seasonData, setSeasonData] = useState<SeasonDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSeason, setIsLoadingSeason] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [trailerVideo, setTrailerVideo] = useState<VideoItem | null>(null);

  // Episode pagination and search state
  const [episodePage, setEpisodePage] = useState<number>(1);
  const [episodePageSize, setEpisodePageSize] = useState<number>(50);
  const [episodeSearch, setEpisodeSearch] = useState<string>('');
  const [jumpToEpInput, setJumpToEpInput] = useState<string>('');

  // Carousel scrolling state & refs
  const seasonsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);

  const t = translations[language];

  // Load Series Details
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    window.scrollTo(0, 0);

    async function loadSeriesData() {
      try {
        const langParam = language === 'fa' ? 'fa-IR' : 'en-US';
        const data = await SeriesService.getDetails(id, langParam);
        if (isMounted) {
          setSeries(data);
          // Pick first regular season (usually season 1, or season_number > 0)
          const validSeason = data.seasons?.find(s => s.season_number === 1) || data.seasons?.[0];
          if (validSeason) {
            setSelectedSeasonNum(validSeason.season_number);
          }

          // Trailer
          const videos = data.videos?.results || [];
          let best = VideoService.findBestTrailer(videos);
          if (!best && language === 'fa') {
            const enVideos = await VideoService.getTvVideos(id, 'en-US');
            best = VideoService.findBestTrailer(enVideos);
          }
          setTrailerVideo(best);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || t.errorLoading);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSeriesData();
    return () => { isMounted = false; };
  }, [id, language]);

  // Load Season Episodes when selected season changes
  useEffect(() => {
    let isMounted = true;
    if (!series) return;

    setIsLoadingSeason(true);
    setEpisodePage(1);
    setEpisodeSearch('');
    setJumpToEpInput('');

    async function loadSeasonEpisodes() {
      try {
        const langParam = language === 'fa' ? 'fa-IR' : 'en-US';
        const data = await SeriesService.getSeasonDetails(id, selectedSeasonNum, langParam);
        if (isMounted) {
          setSeasonData(data);
        }
      } catch (err) {
        console.error("Failed to load season details:", err);
      } finally {
        if (isMounted) setIsLoadingSeason(false);
      }
    }

    loadSeasonEpisodes();
    return () => { isMounted = false; };
  }, [id, selectedSeasonNum, series, language]);

  // Scroll button updates
  const updateScrollButtons = useCallback(() => {
    const el = seasonsScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const isRtl = language === 'fa';
    if (isRtl) {
      const absScroll = Math.abs(scrollLeft);
      setCanScrollLeft(absScroll < maxScroll - 4);
      setCanScrollRight(absScroll > 4);
    } else {
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < maxScroll - 4);
    }
  }, [language]);

  const scrollSeasons = (direction: 'left' | 'right') => {
    const el = seasonsScrollRef.current;
    if (!el) return;
    const amount = 320;
    const isRtl = language === 'fa';
    let delta = direction === 'left' ? -amount : amount;
    if (isRtl) {
      delta = direction === 'left' ? amount : -amount;
    }
    el.scrollBy({ left: delta, behavior: 'smooth' });
    setTimeout(updateScrollButtons, 350);
  };

  const handleSeasonsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = seasonsScrollRef.current;
    if (!el) return;
    if (el.scrollWidth > el.clientWidth && e.deltaY !== 0) {
      el.scrollLeft += e.deltaY;
      updateScrollButtons();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = seasonsScrollRef.current;
    if (!el) return;
    setIsDragging(true);
    setDragStartX(e.pageX - el.offsetLeft);
    setDragScrollLeft(el.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const el = seasonsScrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragStartX) * 1.5;
    el.scrollLeft = dragScrollLeft - walk;
    updateScrollButtons();
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Keep scroll indicators updated on resize or content change
  useEffect(() => {
    const handleResize = () => updateScrollButtons();
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(updateScrollButtons, 300);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [updateScrollButtons, series]);

  // Center active season tab smoothly when selected
  useEffect(() => {
    const activeTab = document.getElementById(`season-tab-${selectedSeasonNum}`);
    if (activeTab && seasonsScrollRef.current) {
      activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    const timer = setTimeout(updateScrollButtons, 350);
    return () => clearTimeout(timer);
  }, [selectedSeasonNum, updateScrollButtons]);

  // Episode pagination and search calculations
  const allEpisodes = useMemo(() => seasonData?.episodes || [], [seasonData]);

  const filteredEpisodes = useMemo(() => {
    if (!episodeSearch.trim()) return allEpisodes;
    const q = episodeSearch.toLowerCase().trim();
    return allEpisodes.filter(
      (ep) =>
        ep.episode_number.toString() === q ||
        (ep.name && ep.name.toLowerCase().includes(q)) ||
        (ep.overview && ep.overview.toLowerCase().includes(q))
    );
  }, [allEpisodes, episodeSearch]);

  const totalEpisodesCount = filteredEpisodes.length;
  const totalPages = Math.max(1, Math.ceil(totalEpisodesCount / episodePageSize));

  useEffect(() => {
    if (episodePage > totalPages) {
      setEpisodePage(1);
    }
  }, [episodePage, totalPages]);

  const paginatedEpisodes = useMemo(() => {
    const start = (episodePage - 1) * episodePageSize;
    return filteredEpisodes.slice(start, start + episodePageSize);
  }, [filteredEpisodes, episodePage, episodePageSize]);

  const handleJumpToEpisode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const epNum = parseInt(jumpToEpInput.trim(), 10);
    if (isNaN(epNum) || epNum <= 0) return;

    let targetIdx = filteredEpisodes.findIndex((ep) => ep.episode_number === epNum);
    if (targetIdx === -1 && episodeSearch) {
      setEpisodeSearch('');
      targetIdx = allEpisodes.findIndex((ep) => ep.episode_number === epNum);
    }

    if (targetIdx !== -1) {
      const targetPage = Math.floor(targetIdx / episodePageSize) + 1;
      setEpisodePage(targetPage);
      setTimeout(() => {
        const el = document.getElementById(`episode-card-${epNum}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-sky-500');
          setTimeout(() => el.classList.remove('ring-2', 'ring-sky-500'), 2500);
        }
      }, 150);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="w-full h-96 bg-slate-900 rounded-3xl animate-pulse mb-8" />
        <SkeletonGrid count={6} theme={theme} />
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <p className="text-red-400 font-bold">{error || 'TV Series not found.'}</p>
        <button
          onClick={() => onNavigate({ view: 'series' })}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm"
        >
          Back to Series
        </button>
      </div>
    );
  }

  const creators = series.created_by || [];
  const castList = (series.credits?.cast || []).slice(0, 12);
  const similarSeries = series.similar?.results || series.recommendations?.results || [];
  const backdropUrl = TMDBService.getImageUrl(series.backdrop_path, 'original');
  const posterUrl = TMDBService.getImageUrl(series.poster_path, 'w500');
  const releaseYear = series.first_air_date ? new Date(series.first_air_date).getFullYear() : 'N/A';
  const rating = series.vote_average ? series.vote_average.toFixed(1) : 'N/A';

  const allSeasons = (series.seasons || []).slice().sort((a, b) => a.season_number - b.season_number);
  const regularSeasons = allSeasons.filter(s => s.season_number > 0);
  const specialSeasons = allSeasons.filter(s => s.season_number === 0);
  const displayedSeasons = regularSeasons.length > 0 ? [...regularSeasons, ...specialSeasons] : allSeasons;

  return (
    <div className="min-h-screen pb-20">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => onNavigate({ view: 'series' })}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{t.series}</span>
        </button>
      </div>

      {/* Cinematic Hero Backdrop Area */}
      <div className="relative w-full min-h-[480px] lg:min-h-[560px] mt-4 flex items-end pb-12">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={backdropUrl}
            alt={series.name}
            className="w-full h-full object-cover object-center filter brightness-75"
            referrerPolicy="no-referrer"
          />
          <div
            className={`absolute inset-0 ${
              theme === 'dark'
                ? 'bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40'
                : 'bg-gradient-to-t from-white via-white/80 to-transparent'
            }`}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            {/* TV Poster */}
            <div className="w-48 sm:w-60 md:w-68 shrink-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800/80 bg-slate-900 group">
              <img
                src={posterUrl}
                alt={series.name}
                className="w-full aspect-2/3 object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* TV Details Info */}
            <div className="flex-1 space-y-4 text-center md:text-left rtl:md:text-right">
              {/* Badges - Modern Purple & Indigo Style matching Movie Details */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs font-semibold">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/25 shadow-sm">
                  <Tv className="w-3.5 h-3.5" />
                  <span>{t.series}</span>
                </span>

                {rating && (
                  <span className="flex items-center gap-1 text-amber-400 font-bold bg-black/50 px-2.5 py-1 rounded-xl border border-black/30">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{rating}</span>
                  </span>
                )}

                <span className={`px-2.5 py-1 rounded-xl border font-medium ${
                  theme === 'dark' ? 'border-slate-800 bg-slate-900/60 text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-700'
                }`}>
                  {releaseYear}
                </span>

                <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${
                  theme === 'dark' ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'
                }`}>
                  16+
                </span>

                <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${
                  theme === 'dark' ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'
                }`}>
                  HD
                </span>

                <span className={`px-2.5 py-1 rounded-xl border ${
                  theme === 'dark' ? 'border-slate-800 bg-slate-900/60 text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-700'
                }`}>
                  {series.number_of_seasons || 1} {t.seasons} • {series.number_of_episodes || 0} {t.episodes}
                </span>
              </div>

              {/* Title & Tagline */}
              <div>
                <h1 className={`text-3xl sm:text-5xl font-black tracking-tight leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {series.name}
                </h1>
                {series.tagline && (
                  <p className="text-sm sm:text-base italic text-indigo-400 font-medium mt-1">
                    "{series.tagline}"
                  </p>
                )}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 text-xs">
                {series.genres?.map((g) => (
                  <span
                    key={g.id}
                    className={`px-3 py-1 rounded-xl border font-medium ${
                      theme === 'dark'
                        ? 'bg-slate-800/60 text-slate-300 border-slate-700/60'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {g.name}
                  </span>
                ))}
              </div>

              {/* Action Buttons: ▶ Watch First Episode & Watch Trailer & Watchlist */}
              <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <button
                  id="watch-series-first-ep-btn"
                  onClick={() => onNavigate({ view: 'watch-tv', id: series.id, season: selectedSeasonNum, episode: 1 })}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-base flex items-center gap-2.5 shadow-xl shadow-indigo-500/25 hover:scale-102 active:scale-98 transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-white text-white" />
                  <span>{t.watchNow} ({t.season} {selectedSeasonNum} {t.episode} 1)</span>
                </button>

                {trailerVideo && (
                  <button
                    id="series-trailer-btn"
                    onClick={() => setIsTrailerOpen(true)}
                    className="px-6 py-3.5 rounded-2xl text-base font-semibold flex items-center gap-2 border bg-slate-800/80 hover:bg-slate-700 text-white border-slate-700 backdrop-blur-md transition-all cursor-pointer"
                  >
                    <Video className="w-5 h-5 text-indigo-400" />
                    <span>{t.trailer}</span>
                  </button>
                )}

                {/* Watchlist Button */}
                <button
                  id="series-watchlist-toggle-btn"
                  onClick={() => {
                    if (isInWatchlist('tv', series.id)) {
                      removeFromWatchlist('tv', series.id);
                    } else {
                      addToWatchlist({
                        mediaId: series.id,
                        mediaType: 'tv',
                        title: series.name,
                        posterPath: series.poster_path,
                        voteAverage: series.vote_average,
                        releaseDate: series.first_air_date,
                      });
                    }
                  }}
                  className={`px-5 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                    isInWatchlist('tv', series.id)
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30'
                      : theme === 'dark'
                      ? 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs'
                  }`}
                  title={isInWatchlist('tv', series.id) ? t.inWatchlist : t.addToWatchlist}
                >
                  {isInWatchlist('tv', series.id) ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-zinc-300" />
                  )}
                  <span>{isInWatchlist('tv', series.id) ? t.inWatchlist : t.addToWatchlist}</span>
                </button>

                {/* Watch Later Button */}
                <button
                  id="series-watch-later-toggle-btn"
                  onClick={() => {
                    if (isInWatchLater('tv', series.id)) {
                      removeFromWatchLater('tv', series.id);
                    } else {
                      addToWatchLater({
                        mediaId: series.id,
                        mediaType: 'tv',
                        title: series.name,
                        posterPath: series.poster_path,
                        voteAverage: series.vote_average,
                        releaseDate: series.first_air_date,
                      });
                    }
                  }}
                  className={`px-5 py-3.5 rounded-md text-sm font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                    isInWatchLater('tv', series.id)
                      ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/25'
                      : theme === 'dark'
                      ? 'bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                      : 'bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-300 shadow-xs'
                  }`}
                  title={isInWatchLater('tv', series.id) ? t.inWatchLater : t.addToWatchLater}
                >
                  <Clock className={`w-4 h-4 ${isInWatchLater('tv', series.id) ? 'text-white' : 'text-amber-500'}`} />
                  <span>{isInWatchLater('tv', series.id) ? t.inWatchLater : t.watchLater}</span>
                </button>

                {/* Favorite Heart Button */}
                <button
                  id="series-favorite-toggle-btn"
                  onClick={() => {
                    if (isFavorite('tv', series.id)) {
                      removeFromFavorites('tv', series.id);
                    } else {
                      addToFavorites({
                        mediaId: series.id,
                        mediaType: 'tv',
                        title: series.name,
                        posterPath: series.poster_path,
                        voteAverage: series.vote_average,
                        releaseDate: series.first_air_date,
                      });
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isFavorite('tv', series.id)
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-500'
                      : theme === 'dark'
                      ? 'bg-slate-800/90 hover:bg-slate-700 text-slate-400 border-slate-700'
                      : 'bg-white hover:bg-slate-100 text-slate-500 border-slate-300 shadow-xs'
                  }`}
                  title={isFavorite('tv', series.id) ? 'Favorited' : 'Add to Favorites'}
                >
                  <Heart className={`w-5 h-5 ${isFavorite('tv', series.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        {/* Overview & Creators */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h2 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t.overview}
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              {series.overview || 'No overview provided.'}
            </p>

            {/* Cast section */}
            <div className="pt-6 space-y-4">
              <div className="flex items-center gap-2 text-sky-500 font-bold text-base">
                <Users className="w-5 h-5" />
                <span>{t.cast}</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
                {castList.map((actor) => {
                  const profilePic = TMDBService.getProfileUrl(actor.profile_path);
                  return (
                    <div
                      key={actor.id}
                      onClick={() => onNavigate({ view: 'actor-detail', id: actor.id })}
                      className={`group p-2 rounded-xl border transition-all cursor-pointer text-center ${
                        theme === 'dark'
                          ? 'bg-slate-900/60 border-slate-800/80 hover:border-sky-500/50 hover:bg-slate-800/80'
                          : 'bg-white border-slate-200 hover:border-sky-500/50 hover:shadow-md'
                      }`}
                    >
                      <div className="aspect-square w-full rounded-lg overflow-hidden bg-slate-800 mb-2">
                        <img
                          src={profilePic}
                          alt={actor.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <h4 className={`text-xs font-semibold line-clamp-1 group-hover:text-sky-500 transition-colors ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                        {actor.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1">
                        {actor.character}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Key Details */}
          <div
            className={`p-6 rounded-2xl border space-y-4 h-fit ${
              theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100/70 border-slate-200'
            }`}
          >
            <h3 className={`text-sm font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Series Information
            </h3>

            {creators.length > 0 && (
              <div className="border-b border-slate-800/50 pb-3">
                <span className="text-xs text-slate-500 block">{t.creators}</span>
                <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                  {creators.map(c => c.name).join(', ')}
                </span>
              </div>
            )}

            <div className="border-b border-slate-800/50 pb-3">
              <span className="text-xs text-slate-500 block">{t.firstAirDate}</span>
              <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                {series.first_air_date || 'N/A'}
              </span>
            </div>

            <div className="border-b border-slate-800/50 pb-3">
              <span className="text-xs text-slate-500 block">{t.status}</span>
              <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                {series.status || 'Returning Series'}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">Total Seasons</span>
              <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                {series.number_of_seasons} Seasons ({series.number_of_episodes} Episodes)
              </span>
            </div>
          </div>
        </div>

        {/* Seasons & Episodes Selector Section */}
        <section id="seasons-episodes-section" className="space-y-6 pt-6 border-t border-slate-800/50">
          {/* Header with Title and Quick Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-sky-500" />
              <h2 className={`text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t.seasons} & {t.episodes}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 font-semibold border border-sky-500/25">
                {displayedSeasons.length} {t.seasons}
              </span>
            </div>

            {/* Quick Season Jump Dropdown */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="quick-season-jump-select"
                className={`text-xs font-semibold whitespace-nowrap ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-700'
                }`}
              >
                {t.season}:
              </label>
              <select
                id="quick-season-jump-select"
                value={selectedSeasonNum}
                onChange={(e) => setSelectedSeasonNum(Number(e.target.value))}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border transition-colors cursor-pointer outline-hidden ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-700 text-slate-200 focus:border-sky-500'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500 shadow-xs'
                }`}
              >
                {displayedSeasons.map((s) => (
                  <option
                    key={s.id}
                    value={s.season_number}
                    className={theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}
                  >
                    {s.name || `${t.season} ${s.season_number}`} ({s.episode_count} {t.episodes})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Full-width Scrollable Season Tabs Carousel */}
          <div className="relative w-full">
            {/* Left Scroll Chevron Button */}
            <button
              id="seasons-scroll-left-btn"
              type="button"
              onClick={() => scrollSeasons('left')}
              aria-label="Scroll seasons left"
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-900/95 hover:bg-slate-800 text-white border border-slate-700 shadow-lg shadow-black/60'
                  : 'bg-white/95 hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-md'
              }`}
            >
              <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
            </button>

            {/* Scrollable Season Tabs Strip */}
            <div
              ref={seasonsScrollRef}
              onWheel={handleSeasonsWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onScroll={updateScrollButtons}
              className={`w-full flex items-center gap-2.5 overflow-x-auto py-2.5 px-11 sm:px-12 scroll-smooth select-none cursor-grab active:cursor-grabbing ${
                theme === 'dark'
                  ? 'scrollbar-thin scrollbar-thumb-slate-700'
                  : 'scrollbar-thin scrollbar-thumb-slate-300'
              }`}
              style={{
                scrollbarWidth: 'thin',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {displayedSeasons.map((season) => {
                const isSelected = selectedSeasonNum === season.season_number;
                return (
                  <button
                    key={season.id}
                    id={`season-tab-${season.season_number}`}
                    type="button"
                    onClick={() => setSelectedSeasonNum(season.season_number)}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/35 ring-2 ring-sky-400/40'
                        : theme === 'dark'
                        ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                        : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-950 border border-slate-200 shadow-xs'
                    }`}
                  >
                    <span>{season.name || `${t.season} ${season.season_number}`}</span>
                    <span
                      className={`ml-1.5 rtl:ml-0 rtl:mr-1.5 text-[11px] px-1.5 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-sky-700/60 text-sky-100'
                          : theme === 'dark'
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {season.episode_count} eps
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Scroll Chevron Button */}
            <button
              id="seasons-scroll-right-btn"
              type="button"
              onClick={() => scrollSeasons('right')}
              aria-label="Scroll seasons right"
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-900/95 hover:bg-slate-800 text-white border border-slate-700 shadow-lg shadow-black/60'
                  : 'bg-white/95 hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-md'
              }`}
            >
              <ChevronRight className="w-5 h-5 rtl:rotate-180" />
            </button>
          </div>

          {/* Episode Search, Jump & Per-Page Controls Toolbar */}
          {!isLoadingSeason && allEpisodes.length > 0 && (
            <div
              id="episodes-toolbar"
              className={`p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 ${
                theme === 'dark'
                  ? 'bg-slate-900/60 border-slate-800'
                  : 'bg-slate-50 border-slate-200 shadow-xs'
              }`}
            >
              {/* Left: Search input */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none rtl:left-auto rtl:right-3" />
                <input
                  id="episode-search-input"
                  type="text"
                  value={episodeSearch}
                  onChange={(e) => {
                    setEpisodeSearch(e.target.value);
                    setEpisodePage(1);
                  }}
                  placeholder={t.searchEpisodes || 'Search episodes by title or #...'}
                  className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm border transition-colors outline-hidden rtl:pl-8 rtl:pr-9 ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-sky-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500 shadow-xs'
                  }`}
                />
                {episodeSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setEpisodeSearch('');
                      setEpisodePage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white rtl:right-auto rtl:left-2.5"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Right: Quick Jump & Page Size */}
              <div className="flex flex-wrap items-center gap-2.5 justify-end">
                {/* Jump to Episode form */}
                <form onSubmit={handleJumpToEpisode} className="flex items-center gap-1.5">
                  <div className="relative">
                    <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none rtl:left-auto rtl:right-2.5" />
                    <input
                      id="jump-to-episode-input"
                      type="number"
                      min={1}
                      value={jumpToEpInput}
                      onChange={(e) => setJumpToEpInput(e.target.value)}
                      placeholder={t.jumpToEpisode || 'Ep #'}
                      className={`w-24 pl-7 pr-2 py-2 rounded-xl text-xs sm:text-sm border transition-colors outline-hidden rtl:pl-2 rtl:pr-7 ${
                        theme === 'dark'
                          ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-sky-500'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500 shadow-xs'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    id="jump-to-episode-submit-btn"
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-colors cursor-pointer"
                  >
                    {t.go || 'Go'}
                  </button>
                </form>

                {/* Range Selector Dropdown for series with many episodes */}
                {totalPages > 1 && (
                  <select
                    id="quick-range-selector"
                    value={episodePage}
                    onChange={(e) => setEpisodePage(Number(e.target.value))}
                    className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors cursor-pointer outline-hidden ${
                      theme === 'dark'
                        ? 'bg-slate-900 border-slate-700 text-slate-200 focus:border-sky-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500 shadow-xs'
                    }`}
                  >
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      const fromEp = idx * episodePageSize + 1;
                      const toEp = Math.min(pageNum * episodePageSize, totalEpisodesCount);
                      return (
                        <option
                          key={pageNum}
                          value={pageNum}
                          className={theme === 'dark' ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-900'}
                        >
                          {t.page || 'Page'} {pageNum} (Ep {fromEp}–{toEp})
                        </option>
                      );
                    })}
                  </select>
                )}

                {/* Per Page Select */}
                {allEpisodes.length > 25 && (
                  <div className="flex items-center gap-1.5">
                    <select
                      id="episode-page-size-select"
                      value={episodePageSize}
                      onChange={(e) => {
                        setEpisodePageSize(Number(e.target.value));
                        setEpisodePage(1);
                      }}
                      className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer outline-hidden ${
                        theme === 'dark'
                          ? 'bg-slate-900 border-slate-700 text-slate-200 focus:border-sky-500'
                          : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500 shadow-xs'
                      }`}
                      title={t.episodesPerPage || 'Episodes per page'}
                    >
                      <option value={25} className={theme === 'dark' ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-900'}>25 / page</option>
                      <option value={50} className={theme === 'dark' ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-900'}>50 / page</option>
                      <option value={100} className={theme === 'dark' ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-900'}>100 / page</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Episode Count & Range Indicator */}
          {!isLoadingSeason && allEpisodes.length > 0 && (
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>
                {t.showingEpisodes || 'Showing episodes'}{' '}
                <strong className={theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}>
                  {totalEpisodesCount > 0 ? (episodePage - 1) * episodePageSize + 1 : 0}–{Math.min(episodePage * episodePageSize, totalEpisodesCount)}
                </strong>{' '}
                {t.of || 'of'}{' '}
                <strong className={theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}>{totalEpisodesCount}</strong>
                {episodeSearch && (
                  <span className="ml-1 text-sky-400">({t.filteredFrom || 'filtered from'} {allEpisodes.length})</span>
                )}
              </span>
              {totalPages > 1 && (
                <span>
                  {t.page || 'Page'} <strong className={theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}>{episodePage}</strong> {t.of || 'of'} {totalPages}
                </span>
              )}
            </div>
          )}

          {/* Episodes List Grid */}
          {isLoadingSeason ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-slate-900/60 animate-pulse" />
              ))}
            </div>
          ) : !seasonData || seasonData.episodes?.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No episode data available for this season.
            </div>
          ) : paginatedEpisodes.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-700/60 space-y-3">
              <p className="text-slate-400 text-sm font-medium">
                {t.noEpisodesMatchFilter || 'No episodes match your search query.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setEpisodeSearch('');
                  setEpisodePage(1);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-colors cursor-pointer"
              >
                {t.clearFilter || 'Clear Search'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedEpisodes.map((ep: Episode) => {
                const epStill = ep.still_path
                  ? TMDBService.getImageUrl(ep.still_path, 'w500')
                  : backdropUrl;

                return (
                  <div
                    key={ep.id}
                    id={`episode-card-${ep.episode_number}`}
                    className={`group p-4 rounded-2xl border transition-all flex flex-col sm:flex-row gap-4 ${
                      theme === 'dark'
                        ? 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    {/* Thumbnail with direct Play overlay */}
                    <div
                      onClick={() => onNavigate({
                        view: 'watch-tv',
                        id: series.id,
                        season: selectedSeasonNum,
                        episode: ep.episode_number,
                      })}
                      className="relative w-full sm:w-44 aspect-16/9 shrink-0 rounded-xl overflow-hidden bg-slate-800 cursor-pointer"
                    >
                      <img
                        src={epStill}
                        alt={ep.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-lg">
                          <Play className="w-4 h-4 fill-white translate-x-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white">
                        Ep {ep.episode_number}
                      </span>
                    </div>

                    {/* Episode info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-sm font-bold line-clamp-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            {ep.episode_number}. {ep.name || `Episode ${ep.episode_number}`}
                          </h4>
                          {ep.vote_average ? (
                            <span className="text-xs text-amber-400 font-semibold flex items-center gap-0.5">
                              ⭐ {ep.vote_average.toFixed(1)}
                            </span>
                          ) : null}
                        </div>

                        <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                          {ep.overview || 'No episode summary available.'}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/40">
                        <span className="text-[11px] text-slate-500">
                          {ep.air_date || 'Air date unknown'} {ep.runtime ? `• ${ep.runtime} ${t.minutes}` : ''}
                        </span>

                        <button
                          id={`watch-ep-btn-${ep.episode_number}`}
                          onClick={() => onNavigate({
                            view: 'watch-tv',
                            id: series.id,
                            season: selectedSeasonNum,
                            episode: ep.episode_number,
                          })}
                          className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>{t.watchEpisode}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Pagination Controls Bar */}
          {!isLoadingSeason && totalPages > 1 && (
            <div
              id="episodes-pagination-bar"
              className={`p-3 rounded-2xl border flex flex-wrap items-center justify-center gap-2 mt-6 ${
                theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              {/* First Page */}
              <button
                type="button"
                id="episodes-first-page-btn"
                disabled={episodePage === 1}
                onClick={() => setEpisodePage(1)}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
                }`}
                title={t.firstPage || 'First Page'}
              >
                <ChevronsLeft className="w-4 h-4 rtl:rotate-180" />
              </button>

              {/* Prev Page */}
              <button
                type="button"
                id="episodes-prev-page-btn"
                disabled={episodePage === 1}
                onClick={() => setEpisodePage((p) => Math.max(1, p - 1))}
                className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
                }`}
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                <span className="hidden sm:inline">{t.previous || 'Previous'}</span>
              </button>

              {/* Page Number Pills (Smart window around current page) */}
              <div className="flex items-center gap-1 overflow-x-auto max-w-full py-1">
                {(() => {
                  const pages: (number | string)[] = [];
                  const delta = 2; // Show 2 before and 2 after current

                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (episodePage - delta > 2) {
                      pages.push('...');
                    }
                    const start = Math.max(2, episodePage - delta);
                    const end = Math.min(totalPages - 1, episodePage + delta);
                    for (let i = start; i <= end; i++) {
                      pages.push(i);
                    }
                    if (episodePage + delta < totalPages - 1) {
                      pages.push('...');
                    }
                    pages.push(totalPages);
                  }

                  return pages.map((p, idx) => {
                    if (typeof p === 'string') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-500 font-bold">
                          ...
                        </span>
                      );
                    }

                    const isCurrent = p === episodePage;
                    return (
                      <button
                        key={`page-pill-${p}`}
                        type="button"
                        onClick={() => setEpisodePage(p)}
                        className={`min-w-9 h-9 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 ring-2 ring-sky-400/40'
                            : theme === 'dark'
                            ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700'
                            : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 shadow-xs'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Next Page */}
              <button
                type="button"
                id="episodes-next-page-btn"
                disabled={episodePage === totalPages}
                onClick={() => setEpisodePage((p) => Math.min(totalPages, p + 1))}
                className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
                }`}
              >
                <span className="hidden sm:inline">{t.next || 'Next'}</span>
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>

              {/* Last Page */}
              <button
                type="button"
                id="episodes-last-page-btn"
                disabled={episodePage === totalPages}
                onClick={() => setEpisodePage(totalPages)}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
                }`}
                title={t.lastPage || 'Last Page'}
              >
                <ChevronsRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          )}
        </section>

        {/* Similar TV Series */}
        {similarSeries.length > 0 && (
          <section id="similar-series-section" className="space-y-4 pt-6 border-t border-slate-800/50">
            <div className="flex items-center gap-2">
              <Tv className="w-5 h-5 text-sky-500" />
              <h2 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t.similarSeries}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similarSeries.slice(0, 6).map((item) => (
                <MovieCard
                  key={`sim-tv-${item.id}`}
                  item={item}
                  mediaTypeFallback="tv"
                  onNavigate={onNavigate}
                  theme={theme}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        video={trailerVideo}
        title={series.name}
        onClose={() => setIsTrailerOpen(false)}
      />
    </div>
  );
};

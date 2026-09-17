import React, { useState, useEffect } from 'react';
import { Play, Video, Star, Clock, Calendar, ArrowLeft, Users, Film, Bookmark, Heart, Check } from 'lucide-react';
import { MovieDetails, RouteState, Theme, Language, VideoItem } from '../types';
import { MovieService, TMDBService, VideoService } from '../services';
import { MovieCard } from '../components/MovieCard';
import { TrailerModal } from '../components/TrailerModal';
import { SkeletonGrid } from '../components/SkeletonGrid';
import { translations } from '../i18n/translations';
import { useAuth } from '../context/AuthContext';

interface MovieDetailsViewProps {
  id: number;
  onNavigate: (route: RouteState) => void;
  language: Language;
  theme: Theme;
}

export const MovieDetailsView: React.FC<MovieDetailsViewProps> = ({
  id,
  onNavigate,
  language,
  theme,
}) => {
  const {
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  } = useAuth();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [trailerVideo, setTrailerVideo] = useState<VideoItem | null>(null);

  const t = translations[language];

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    window.scrollTo(0, 0);

    async function loadDetails() {
      try {
        const langParam = language === 'fa' ? 'fa-IR' : 'en-US';
        const data = await MovieService.getDetails(id, langParam);
        if (isMounted) {
          setMovie(data);
          // Find trailer
          const videos = data.videos?.results || [];
          let best = VideoService.findBestTrailer(videos);
          if (!best && language === 'fa') {
            // fallback fetch english videos for trailer
            const enVideos = await VideoService.getMovieVideos(id, 'en-US');
            best = VideoService.findBestTrailer(enVideos);
          }
          setTrailerVideo(best);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || t.errorLoading);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDetails();
    return () => { isMounted = false; };
  }, [id, language]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="w-full h-96 bg-slate-900 rounded-3xl animate-pulse mb-8" />
        <SkeletonGrid count={6} theme={theme} />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <p className="text-rose-500 font-bold">{error || 'Movie not found.'}</p>
        <button
          onClick={() => onNavigate({ view: 'movies' })}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm"
        >
          Back to Movies
        </button>
      </div>
    );
  }

  const director = movie.credits?.crew?.find((c) => c.job === 'Director');
  const castList = (movie.credits?.cast || []).slice(0, 12);
  const similarMovies = movie.similar?.results || movie.recommendations?.results || [];
  const backdropUrl = TMDBService.getImageUrl(movie.backdrop_path, 'original');
  const posterUrl = TMDBService.getImageUrl(movie.poster_path, 'w500');
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

  return (
    <div className="min-h-screen pb-20">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => onNavigate({ view: 'movies' })}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{t.movies}</span>
        </button>
      </div>

      {/* Cinematic Hero Backdrop Area */}
      <div className="relative w-full min-h-[480px] lg:min-h-[560px] mt-4 flex items-end pb-12">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={backdropUrl}
            alt={movie.title}
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
            {/* Movie Poster */}
            <div className="w-48 sm:w-60 md:w-68 shrink-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800/80 bg-slate-900 group">
              <img
                src={posterUrl}
                alt={movie.title}
                className="w-full aspect-2/3 object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Movie Details Info */}
            <div className="flex-1 space-y-4 text-center md:text-left rtl:md:text-right">
              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-semibold">
                <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white uppercase tracking-wider">
                  Movie
                </span>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900/90 text-amber-400 border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{rating}</span>
                  {movie.vote_count ? <span className="opacity-70 text-[10px]">({movie.vote_count.toLocaleString()})</span> : null}
                </span>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900/80 text-slate-300 border border-slate-700/50">
                  <Calendar className="w-3.5 h-3.5 opacity-70" />
                  <span>{releaseYear}</span>
                </span>
                {movie.runtime ? (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900/80 text-slate-300 border border-slate-700/50">
                    <Clock className="w-3.5 h-3.5 opacity-70" />
                    <span>{movie.runtime} {t.minutes}</span>
                  </span>
                ) : null}
              </div>

              {/* Title & Tagline */}
              <div>
                <h1 className={`text-3xl sm:text-5xl font-black tracking-tight leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
                  {movie.title}
                </h1>
                {movie.tagline && (
                  <p className="text-sm sm:text-base italic text-rose-400 font-medium mt-1">
                    "{movie.tagline}"
                  </p>
                )}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                {movie.genres?.map((g) => (
                  <span
                    key={g.id}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      theme === 'dark'
                        ? 'bg-slate-900/80 border-slate-700 text-slate-300'
                        : 'bg-white border-slate-300 text-slate-700 shadow-xs'
                    }`}
                  >
                    {g.name}
                  </span>
                ))}
              </div>

              {/* Action Buttons: ▶ Watch Movie & Watch Trailer & Watchlist */}
              <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <button
                  id="watch-movie-action-btn"
                  onClick={() => onNavigate({ view: 'watch-movie', id: movie.id })}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-base flex items-center gap-2.5 shadow-xl shadow-rose-600/35 hover:scale-102 active:scale-98 transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>{t.watchMovie}</span>
                </button>

                {trailerVideo && (
                  <button
                    id="trailer-modal-action-btn"
                    onClick={() => setIsTrailerOpen(true)}
                    className={`px-6 py-3.5 rounded-xl text-base font-semibold flex items-center gap-2 border backdrop-blur-md transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-slate-900/80 hover:bg-slate-800 text-white border-slate-700'
                        : 'bg-white/90 hover:bg-white text-slate-900 border-slate-300 shadow-xs'
                    }`}
                  >
                    <Video className="w-5 h-5 text-rose-500" />
                    <span>{t.trailer}</span>
                  </button>
                )}

                {/* Watchlist Button */}
                <button
                  id="movie-watchlist-toggle-btn"
                  onClick={() => {
                    if (isInWatchlist('movie', movie.id)) {
                      removeFromWatchlist('movie', movie.id);
                    } else {
                      addToWatchlist({
                        mediaId: movie.id,
                        mediaType: 'movie',
                        title: movie.title,
                        posterPath: movie.poster_path,
                        voteAverage: movie.vote_average,
                        releaseDate: movie.release_date,
                      });
                    }
                  }}
                  className={`px-5 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                    isInWatchlist('movie', movie.id)
                      ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/25'
                      : theme === 'dark'
                      ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-xs'
                  }`}
                  title={isInWatchlist('movie', movie.id) ? t.inWatchlist : t.addToWatchlist}
                >
                  {isInWatchlist('movie', movie.id) ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-rose-500" />
                  )}
                  <span>{isInWatchlist('movie', movie.id) ? t.inWatchlist : t.addToWatchlist}</span>
                </button>

                {/* Favorite Heart Button */}
                <button
                  id="movie-favorite-toggle-btn"
                  onClick={() => {
                    if (isFavorite('movie', movie.id)) {
                      removeFromFavorites('movie', movie.id);
                    } else {
                      addToFavorites({
                        mediaId: movie.id,
                        mediaType: 'movie',
                        title: movie.title,
                        posterPath: movie.poster_path,
                        voteAverage: movie.vote_average,
                        releaseDate: movie.release_date,
                      });
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isFavorite('movie', movie.id)
                      ? 'bg-rose-500/20 text-rose-500 border-rose-500/50'
                      : theme === 'dark'
                      ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border-slate-700'
                      : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-300 shadow-xs'
                  }`}
                  title={isFavorite('movie', movie.id) ? 'Favorited' : 'Add to Favorites'}
                >
                  <Heart className={`w-5 h-5 ${isFavorite('movie', movie.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details & Overview Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        {/* Overview & Metadata Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Overview */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t.overview}
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              {movie.overview || 'No overview provided.'}
            </p>

            {/* Cast section */}
            <div className="pt-6 space-y-4">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-base">
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
                          ? 'bg-slate-900/60 border-slate-800/80 hover:border-rose-500/50 hover:bg-slate-800/80'
                          : 'bg-white border-slate-200 hover:border-rose-500/50 hover:shadow-md'
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
                      <h4 className={`text-xs font-semibold line-clamp-1 group-hover:text-rose-500 transition-colors ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
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
              Production Details
            </h3>

            {director && (
              <div className="border-b border-slate-800/50 pb-3">
                <span className="text-xs text-slate-500 block">{t.director}</span>
                <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                  {director.name}
                </span>
              </div>
            )}

            <div className="border-b border-slate-800/50 pb-3">
              <span className="text-xs text-slate-500 block">{t.releaseDate}</span>
              <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                {movie.release_date || 'N/A'}
              </span>
            </div>

            <div className="border-b border-slate-800/50 pb-3">
              <span className="text-xs text-slate-500 block">{t.status}</span>
              <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                {movie.status || 'Released'}
              </span>
            </div>

            {movie.budget ? (
              <div className="border-b border-slate-800/50 pb-3">
                <span className="text-xs text-slate-500 block">Budget</span>
                <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                  ${(movie.budget / 1_000_000).toFixed(1)}M USD
                </span>
              </div>
            ) : null}

            {movie.revenue ? (
              <div>
                <span className="text-xs text-slate-500 block">Box Office Revenue</span>
                <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                  ${(movie.revenue / 1_000_000).toFixed(1)}M USD
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <section id="similar-movies-section" className="space-y-4 pt-4 border-t border-slate-800/50">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-rose-500" />
              <h2 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t.similarMovies}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similarMovies.slice(0, 6).map((item) => (
                <MovieCard
                  key={`sim-${item.id}`}
                  item={item}
                  mediaTypeFallback="movie"
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
        title={movie.title}
        onClose={() => setIsTrailerOpen(false)}
      />
    </div>
  );
};

import React from 'react';
import { Star, Film, Tv } from 'lucide-react';
import { MediaItem, RouteState, Theme } from '../types';
import { TMDBService } from '../services';

interface MovieCardProps {
  item: MediaItem;
  mediaTypeFallback?: 'movie' | 'tv';
  onNavigate: (route: RouteState) => void;
  theme: Theme;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  item,
  mediaTypeFallback = 'movie',
  onNavigate,
  theme,
}) => {
  const isTV = item.media_type === 'tv' || (!item.media_type && mediaTypeFallback === 'tv') || !!item.first_air_date;
  const title = item.title || item.name || 'Untitled';
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
  const posterUrl = TMDBService.getImageUrl(item.poster_path, 'w500');

  const handleClick = () => {
    if (isTV) {
      onNavigate({ view: 'series-detail', id: item.id });
    } else {
      onNavigate({ view: 'movie-detail', id: item.id });
    }
  };

  return (
    <div
      id={`media-card-${item.id}`}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      tabIndex={0}
      role="button"
      className={`group relative flex flex-col rounded-xl overflow-hidden cursor-pointer transition-all duration-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 select-none ${
        theme === 'dark'
          ? 'bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 shadow-lg hover:shadow-2xl hover:shadow-rose-950/20 hover:-translate-y-1.5'
          : 'bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-slate-300 hover:-translate-y-1.5'
      }`}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-2/3 w-full overflow-hidden bg-slate-800">
        <img
          src={posterUrl}
          alt={title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Subtle, minimal vignette only at edges so badges pop without darkening the poster */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-black/10 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none z-10">
          {rating && Number(rating) > 0 ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-950/85 backdrop-blur-md text-amber-400 border border-amber-500/30 shadow-xs">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{rating}</span>
            </div>
          ) : <div />}

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-slate-950/85 backdrop-blur-md text-slate-200 border border-slate-700/50">
            {isTV ? (
              <span className="flex items-center gap-1 text-sky-400">
                <Tv className="w-2.5 h-2.5" /> TV
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400">
                <Film className="w-2.5 h-2.5" /> Movie
              </span>
            )}
          </div>
        </div>

        {/* Play indicator hover pulse */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl shadow-rose-600/50 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <svg className="w-6 h-6 fill-current translate-x-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Card Info Below Poster */}
      <div className="p-3 flex flex-col justify-between flex-1">
        <h3
          className={`text-sm font-semibold tracking-tight line-clamp-1 group-hover:text-rose-500 transition-colors ${
            theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
          }`}
          title={title}
        >
          {title}
        </h3>

        <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
          <span>{year || 'N/A'}</span>
          {item.vote_count ? (
            <span className="text-[11px] opacity-80">{item.vote_count.toLocaleString()} votes</span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

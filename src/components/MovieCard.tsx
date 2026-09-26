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
      className={`group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 outline-none focus:outline-none focus:ring-0 active:outline-none focus-visible:outline-none select-none ${
        theme === 'dark'
          ? 'bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1'
          : 'bg-white border border-slate-200/90 shadow-xs hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1'
      }`}
    >
      {/* Poster Image Container - Rounded-2xl with clean top badges */}
      <div className="relative aspect-2/3 w-full overflow-hidden bg-slate-950">
        <img
          src={posterUrl}
          alt={title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Subtle, minimal vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges - Exact style from user screenshot */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none z-10">
          {rating && Number(rating) > 0 ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-black/75 backdrop-blur-md text-amber-400 border border-black/40 shadow-sm">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{rating}</span>
            </div>
          ) : <div />}

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-900/85 backdrop-blur-md text-slate-200 border border-slate-700/50 shadow-sm">
            {isTV ? <Tv className="w-3 h-3 text-sky-400" /> : <Film className="w-3 h-3 text-indigo-400" />}
            <span>{isTV ? 'TV' : 'MOVIE'}</span>
          </div>
        </div>
      </div>

      {/* Card Info Below Poster - Clean Title, Year & Vote Count */}
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <h3
          className={`text-sm font-bold tracking-tight line-clamp-1 group-hover:text-indigo-400 transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}
          title={title}
        >
          {title}
        </h3>

        <div className="mt-1 flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>{year || 'N/A'}</span>
          {item.vote_count ? (
            <span className="text-[11px] text-slate-500">
              {item.vote_count.toLocaleString()} votes
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Play, Eye, Video, Star, ChevronLeft, ChevronRight, Calendar, Film, Tv } from 'lucide-react';
import { MediaItem, RouteState, Theme } from '../types';
import { TMDBService } from '../services';
import { translations } from '../i18n/translations';

interface HeroBannerProps {
  items: MediaItem[];
  onNavigate: (route: RouteState) => void;
  onOpenTrailer: (item: MediaItem) => void;
  language: 'en' | 'fa';
  theme: Theme;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  items,
  onNavigate,
  onOpenTrailer,
  language,
  theme,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const t = translations[language];

  const featuredList = items.slice(0, 6);
  const currentItem = featuredList[currentIndex];

  useEffect(() => {
    if (featuredList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [featuredList.length]);

  if (!currentItem) return null;

  const isTV = currentItem.media_type === 'tv' || !!currentItem.first_air_date;
  const title = currentItem.title || currentItem.name || '';
  const date = currentItem.release_date || currentItem.first_air_date;
  const year = date ? new Date(date).getFullYear() : '';
  const rating = currentItem.vote_average ? currentItem.vote_average.toFixed(1) : null;
  const backdropUrl = TMDBService.getImageUrl(currentItem.backdrop_path || currentItem.poster_path, 'original');

  const handleWatchNow = () => {
    if (isTV) {
      onNavigate({ view: 'watch-tv', id: currentItem.id, season: 1, episode: 1 });
    } else {
      onNavigate({ view: 'watch-movie', id: currentItem.id });
    }
  };

  const handleOpenDetails = () => {
    if (isTV) {
      onNavigate({ view: 'series-detail', id: currentItem.id });
    } else {
      onNavigate({ view: 'movie-detail', id: currentItem.id });
    }
  };

  return (
    <section id="hero-banner-section" className="relative w-full h-[520px] sm:h-[580px] lg:h-[640px] overflow-hidden select-none">
      {/* Background Image with Minimal, Non-Intrusive Shading - Click poster navigates to detail */}
      <div
        className="absolute inset-0 cursor-pointer group"
        onClick={handleOpenDetails}
        title={`View details for ${title}`}
      >
        <img
          key={currentItem.id}
          src={backdropUrl}
          alt={title}
          className="w-full h-full object-cover object-center animate-fade-in transition-transform duration-1000 group-hover:scale-102"
          referrerPolicy="no-referrer"
        />
        {/* Soft, shallow bottom gradient to blend gently with the page without covering the artwork */}
        <div
          className={`absolute inset-0 pointer-events-none ${
            theme === 'dark'
              ? 'bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent'
              : 'bg-gradient-to-t from-slate-50/70 via-slate-50/15 to-transparent'
          }`}
        />
        {/* Very light lateral wash just for text legibility while keeping the poster bright and open */}
        <div
          className={`absolute inset-0 pointer-events-none ${
            language === 'fa'
              ? theme === 'dark'
                ? 'bg-gradient-to-l from-slate-950/45 via-slate-950/10 to-transparent'
                : 'bg-gradient-to-l from-white/45 via-white/10 to-transparent'
              : theme === 'dark'
              ? 'bg-gradient-to-r from-slate-950/45 via-slate-950/10 to-transparent'
              : 'bg-gradient-to-r from-white/45 via-white/10 to-transparent'
          }`}
        />
      </div>

      {/* Hero Content */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-14 sm:pb-20 z-10 pointer-events-none">
        <div className="max-w-2xl space-y-4 pointer-events-auto">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
            {isTV ? (
              <span
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md uppercase tracking-wider text-xs font-bold transition-all shadow-md ${
                  theme === 'dark'
                    ? 'bg-sky-500/25 text-sky-300 border border-sky-400/40 backdrop-blur-md'
                    : 'bg-sky-600 text-white border border-sky-600 shadow-sky-600/20'
                }`}
              >
                <Tv className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-sky-400' : 'text-white'}`} />
                <span>{t.series}</span>
              </span>
            ) : (
              <span
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md uppercase tracking-wider text-xs font-bold transition-all shadow-md ${
                  theme === 'dark'
                    ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-400/40 backdrop-blur-md'
                    : 'bg-indigo-600 text-white border border-indigo-600 shadow-indigo-600/20'
                }`}
              >
                <Film className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-indigo-400' : 'text-white'}`} />
                <span>{t.movies}</span>
              </span>
            )}

            {rating && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-amber-400 border border-amber-500/30">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{rating}</span>
              </span>
            )}

            {year && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900/70 backdrop-blur-md text-slate-300 border border-slate-700/50">
                <Calendar className="w-3.5 h-3.5 opacity-70" />
                <span>{year}</span>
              </span>
            )}

            <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
              Ultra HD
            </span>
          </div>

          {/* Title */}
          <h1
            onClick={handleOpenDetails}
            className={`text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] cursor-pointer hover:text-indigo-400 transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-slate-950'
            }`}
          >
            {title}
          </h1>

          {/* Overview */}
          <p
            className={`text-sm sm:text-base line-clamp-3 leading-relaxed max-w-xl drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)] ${
              theme === 'dark' ? 'text-slate-100 font-normal' : 'text-slate-900 font-semibold'
            }`}
          >
            {currentItem.overview || 'Experience the latest cinematic release with seamless high-definition streaming.'}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              id="hero-watch-now-btn"
              onClick={handleWatchNow}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-lg shadow-indigo-600/35 hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>{t.watchNow}</span>
            </button>

            <button
              id="hero-watch-trailer-btn"
              onClick={() => onOpenTrailer(currentItem)}
              className={`px-5 py-3 rounded-xl text-sm sm:text-base font-semibold flex items-center gap-2 border backdrop-blur-md transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-900/80 hover:bg-slate-800 text-white border-slate-700/70 hover:border-slate-600'
                  : 'bg-white/90 hover:bg-white text-slate-900 border-slate-300 shadow-sm'
              }`}
            >
              <Video className="w-4 h-4 text-indigo-400" />
              <span>{t.trailer}</span>
            </button>
          </div>
        </div>

        {/* Carousel indicators & arrows */}
        <div className="absolute bottom-6 right-4 sm:right-8 rtl:right-auto rtl:left-4 sm:rtl:left-8 flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + featuredList.length) % featuredList.length)}
            className="p-2 rounded-full bg-slate-900/70 text-white hover:bg-indigo-600 transition-colors backdrop-blur-md border border-slate-700/50"
            title="Previous Featured"
          >
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          </button>

          <div className="flex items-center gap-1.5">
            {featuredList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-6 bg-indigo-500' : 'w-2 bg-slate-600/70 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredList.length)}
            className="p-2 rounded-full bg-slate-900/70 text-white hover:bg-indigo-600 transition-colors backdrop-blur-md border border-slate-700/50"
            title="Next Featured"
          >
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </section>
  );
};

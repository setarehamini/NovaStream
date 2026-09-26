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
      >
        <img
          key={currentItem.id}
          src={backdropUrl}
          alt={title}
          className="w-full h-full object-cover object-center animate-fade-in transition-transform duration-1000 group-hover:scale-102"
          referrerPolicy="no-referrer"
        />
        {/* Smooth deep bottom gradient to seamlessly melt into canvas */}
        <div
          className={`absolute inset-0 pointer-events-none ${
            theme === 'dark'
              ? 'bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent'
              : 'bg-gradient-to-t from-slate-50 via-slate-50/70 to-transparent'
          }`}
        />
        {/* Cinematic lateral wash for bold contrast */}
        <div
          className={`absolute inset-0 pointer-events-none ${
            language === 'fa'
              ? theme === 'dark'
                ? 'bg-gradient-to-l from-black/85 via-black/40 to-transparent'
                : 'bg-gradient-to-l from-white/85 via-white/40 to-transparent'
              : theme === 'dark'
              ? 'bg-gradient-to-r from-black/85 via-black/40 to-transparent'
              : 'bg-gradient-to-r from-white/85 via-white/40 to-transparent'
          }`}
        />
      </div>

      {/* Hero Content - Netflix Billboard Style */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-14 sm:pb-20 z-10 pointer-events-none">
        <div className="max-w-2xl space-y-3.5 pointer-events-auto">
          {/* Brand & Type Tag */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white text-[10px] sm:text-[11px] font-bold tracking-wider uppercase shadow-md shadow-indigo-600/30">
              {isTV ? t.series : t.movies}
            </span>
          </div>

          {/* Title - Clean display without pointer/hover distraction */}
          <h1
            className={`text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] cursor-default select-text ${
              theme === 'dark' ? 'text-white' : 'text-zinc-950'
            }`}
          >
            {title}
          </h1>

          {/* Metadata Row (Rating, Year, Age, HD) */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            {rating && (
              <span className="flex items-center gap-1 text-amber-400 font-bold bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{rating}</span>
              </span>
            )}

            {year && (
              <span className={theme === 'dark' ? 'text-zinc-300 font-medium' : 'text-zinc-700 font-semibold'}>
                {year}
              </span>
            )}

            <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${
              theme === 'dark'
                ? 'border-zinc-700/80 text-zinc-300 bg-zinc-900/60'
                : 'border-zinc-300 text-zinc-800 bg-zinc-200/60'
            }`}>
              16+
            </span>

            <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${
              theme === 'dark'
                ? 'border-zinc-700/80 text-zinc-300 bg-zinc-900/60'
                : 'border-zinc-300 text-zinc-800 bg-zinc-200/60'
            }`}>
              HD
            </span>
          </div>

          {/* Overview */}
          <p
            className={`text-sm sm:text-base line-clamp-3 leading-relaxed max-w-xl drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)] ${
              theme === 'dark' ? 'text-zinc-200 font-normal' : 'text-zinc-800 font-medium'
            }`}
          >
            {currentItem.overview || 'Experience the latest cinematic release with seamless high-definition streaming.'}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              id="hero-watch-now-btn"
              onClick={handleWatchNow}
              className="px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white text-white" />
              <span>{t.watchNow}</span>
            </button>

            <button
              id="hero-watch-trailer-btn"
              onClick={() => onOpenTrailer(currentItem)}
              className="px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white border border-slate-700/70 backdrop-blur-md transition-all cursor-pointer flex items-center gap-2"
              title={t.trailer}
            >
              <Video className="w-5 h-5 text-indigo-400" />
              <span className="font-semibold text-sm sm:text-base">{t.trailer}</span>
            </button>
          </div>
        </div>

        {/* Carousel indicators & arrows */}
        <div className="absolute bottom-6 right-4 sm:right-8 rtl:right-auto rtl:left-4 sm:rtl:left-8 flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + featuredList.length) % featuredList.length)}
            className="p-2 rounded-full bg-slate-900/80 text-white hover:bg-indigo-600 transition-colors backdrop-blur-md border border-slate-700/60"
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
                  currentIndex === idx ? 'w-6 bg-indigo-600' : 'w-2 bg-slate-600/70 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredList.length)}
            className="p-2 rounded-full bg-slate-900/80 text-white hover:bg-indigo-600 transition-colors backdrop-blur-md border border-slate-700/60"
            title="Next Featured"
          >
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </section>
  );
};

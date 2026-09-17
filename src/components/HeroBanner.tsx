import React, { useState, useEffect } from 'react';
import { Play, Info, Video, Star, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
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
  const backdropUrl = TMDBService.getImageUrl(currentItem.backdrop_path, 'original');

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
      {/* Background Image with Cinematic Vignettes */}
      <div className="absolute inset-0">
        <img
          key={currentItem.id}
          src={backdropUrl}
          alt={title}
          className="w-full h-full object-cover object-center animate-fade-in filter brightness-90 transition-opacity duration-1000"
          referrerPolicy="no-referrer"
        />
        {/* Gradients to fade smoothly into page background */}
        <div
          className={`absolute inset-0 ${
            theme === 'dark'
              ? 'bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent'
              : 'bg-gradient-to-t from-slate-50 via-slate-50/60 to-transparent'
          }`}
        />
        <div
          className={`absolute inset-0 ${
            language === 'fa'
              ? theme === 'dark'
                ? 'bg-gradient-to-l from-slate-950/95 via-slate-950/50 to-transparent'
                : 'bg-gradient-to-l from-white/95 via-white/50 to-transparent'
              : theme === 'dark'
              ? 'bg-gradient-to-r from-slate-950/95 via-slate-950/50 to-transparent'
              : 'bg-gradient-to-r from-white/95 via-white/50 to-transparent'
          }`}
        />
      </div>

      {/* Hero Content */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-14 sm:pb-20 z-10">
        <div className="max-w-2xl space-y-4">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded-md uppercase tracking-wider bg-rose-600 text-white shadow-md">
              {isTV ? t.series : t.movies}
            </span>

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
            className={`text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight ${
              theme === 'dark' ? 'text-white' : 'text-slate-950'
            }`}
          >
            {title}
          </h1>

          {/* Overview */}
          <p
            className={`text-sm sm:text-base line-clamp-3 leading-relaxed max-w-xl ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-700 font-medium'
            }`}
          >
            {currentItem.overview || 'Experience the latest cinematic release with seamless high-definition streaming.'}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              id="hero-watch-now-btn"
              onClick={handleWatchNow}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-lg shadow-rose-600/35 hover:scale-102 active:scale-98 transition-all cursor-pointer"
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
              <Video className="w-4 h-4 text-rose-500" />
              <span>{t.trailer}</span>
            </button>

            <button
              id="hero-details-btn"
              onClick={handleOpenDetails}
              className={`p-3 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border-slate-800'
                  : 'bg-white/70 hover:bg-white text-slate-700 border-slate-300 shadow-sm'
              }`}
              title={t.moreInfo}
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel indicators & arrows */}
        <div className="absolute bottom-6 right-4 sm:right-8 rtl:right-auto rtl:left-4 sm:rtl:left-8 flex items-center gap-3">
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + featuredList.length) % featuredList.length)}
            className="p-2 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition-colors backdrop-blur-md border border-slate-700/50"
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
                  currentIndex === idx ? 'w-6 bg-rose-500' : 'w-2 bg-slate-600/70 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredList.length)}
            className="p-2 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition-colors backdrop-blur-md border border-slate-700/50"
            title="Next Featured"
          >
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </section>
  );
};

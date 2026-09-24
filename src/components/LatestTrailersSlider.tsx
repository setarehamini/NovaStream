import React, { useState, useEffect, useRef } from 'react';
import { Play, ChevronLeft, ChevronRight, Video } from 'lucide-react';
import { MediaItem, Theme, Language } from '../types';
import { MovieService, SeriesService, TMDBService } from '../services';
import { translations } from '../i18n/translations';

interface LatestTrailersSliderProps {
  onOpenTrailer: (item: MediaItem) => void;
  language: Language;
  theme: Theme;
}

type TrailerCategory = 'popular' | 'theatres' | 'tv' | 'streaming';

export const LatestTrailersSlider: React.FC<LatestTrailersSliderProps> = ({
  onOpenTrailer,
  language,
  theme,
}) => {
  const [activeCategory, setActiveCategory] = useState<TrailerCategory>('popular');
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function fetchTrailers() {
      const langParam = language === 'fa' ? 'fa-IR' : 'en-US';
      try {
        let res;
        if (activeCategory === 'theatres') {
          res = await MovieService.getNowPlaying(1, langParam);
        } else if (activeCategory === 'tv') {
          res = await SeriesService.getOnTheAir(1, langParam);
        } else if (activeCategory === 'streaming') {
          res = await MovieService.getTopRated(1, langParam);
        } else {
          // popular
          res = await MovieService.getPopular(1, langParam);
        }

        if (isMounted) {
          // Filter to items that have backdrops
          const filtered = (res.results || []).filter((item) => Boolean(item.backdrop_path || item.poster_path));
          setItems(filtered);
        }
      } catch (err) {
        console.error('Failed to load trailers:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchTrailers();
    return () => {
      isMounted = false;
    };
  }, [activeCategory, language]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 600;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const categories: { id: TrailerCategory; label: string }[] = [
    { id: 'popular', label: language === 'fa' ? 'محبوب' : 'Popular' },
    { id: 'theatres', label: language === 'fa' ? 'روی پرده سینما' : 'In Theatres' },
    { id: 'tv', label: language === 'fa' ? 'در تلویزیون' : 'On TV' },
    { id: 'streaming', label: language === 'fa' ? 'استریم آنلاین' : 'Streaming' },
  ];

  return (
    <section id="latest-trailers-section" className="space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {t.latestTrailers}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'fa' ? 'پیش‌نمایش‌های رسمی سینما و سریال' : 'Official high-definition movie & TV trailers'}
          </p>
        </div>

        {/* Category Tabs */}
        <div
          className={`flex items-center p-1 rounded-xl border max-w-full overflow-x-auto ${
            theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div className="relative group">
        {/* Scroll Left Button */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-950/80 hover:bg-rose-600 text-white border border-slate-700/60 shadow-xl backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:opacity-0"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>

        {/* Scroll Right Button */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-950/80 hover:bg-rose-600 text-white border border-slate-700/60 shadow-xl backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:opacity-0"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 rtl:rotate-180" />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-4 overflow-x-auto scrollbar-none pb-4 pt-1 snap-x select-none"
        >
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`trailer-skeleton-${i}`}
                className="w-72 sm:w-80 shrink-0 aspect-video rounded-2xl bg-slate-800/40 animate-pulse border border-slate-800"
              />
            ))
          ) : (
            items.map((item) => {
              const title = item.title || item.name || '';
              const backdropUrl = TMDBService.getBackdropUrl(item.backdrop_path || item.poster_path, 'w780');
              const date = item.release_date || item.first_air_date;
              const year = date ? new Date(date).getFullYear() : '';

              return (
                <div
                  key={`trailer-card-${item.id}`}
                  onClick={() => onOpenTrailer(item)}
                  className="w-72 sm:w-84 shrink-0 cursor-pointer group/card flex flex-col snap-start"
                >
                  {/* Backdrop with Play Button */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-700/50 shadow-lg bg-slate-900 group-hover/card:border-rose-500/80 transition-all duration-300">
                    <img
                      src={backdropUrl}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />

                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                    {/* Center Glowing Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl shadow-rose-600/40 group-hover/card:scale-115 group-hover/card:bg-rose-500 transition-all">
                        <Play className="w-5 h-5 fill-white translate-x-0.5" />
                      </div>
                    </div>

                    {/* Type and Year Tag */}
                    <div className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 text-white border border-slate-700/50 backdrop-blur-md">
                        {item.media_type === 'tv' ? t.series : t.movies}
                      </span>
                      {year && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-950/70 text-slate-300 border border-slate-700/40 backdrop-blur-md">
                          {year}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Info */}
                  <div className="mt-2.5 px-1">
                    <h3 className={`text-sm font-bold truncate group-hover/card:text-rose-500 transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}>
                      {title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {item.overview || t.trailer}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

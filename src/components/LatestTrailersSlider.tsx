import React, { useState, useEffect, useRef } from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
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

        {/* Category Tabs - Rounded pill capsule from screenshot */}
        <div
          className={`flex items-center p-1 rounded-full border max-w-full overflow-x-auto ${
            theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                  : theme === 'dark'
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div className="relative group/slider">
        {/* Scroll Left Button */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/90 hover:bg-indigo-600 text-white border border-slate-700/60 shadow-xl backdrop-blur-md flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all cursor-pointer disabled:opacity-0"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>

        {/* Scroll Right Button */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/90 hover:bg-indigo-600 text-white border border-slate-700/60 shadow-xl backdrop-blur-md flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all cursor-pointer disabled:opacity-0"
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
                className="w-72 sm:w-84 shrink-0 aspect-video rounded-2xl bg-slate-900 animate-pulse border border-slate-800"
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
                  className="w-72 sm:w-84 shrink-0 cursor-pointer group/card flex flex-col snap-start outline-none focus:outline-none focus:ring-0 active:outline-none select-none"
                >
                  {/* Backdrop with Purple Glowing Play Button & Rounded-2xl */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800/80 shadow-lg bg-slate-900 group-hover/card:border-indigo-500/50 transition-all duration-300">
                    <img
                      src={backdropUrl}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />

                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    {/* Center Purple Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/50 group-hover/card:scale-115 group-hover/card:bg-indigo-500 transition-all">
                        <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
                      </div>
                    </div>

                    {/* Type and Year Tag */}
                    <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md text-white border border-white/10 shadow-sm">
                        {item.media_type === 'tv' ? t.series : t.movies}
                      </span>
                      {year && (
                        <span className="px-2 py-1 rounded-lg text-[10px] font-medium bg-black/75 text-slate-300 border border-white/10 backdrop-blur-md shadow-sm">
                          {year}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3
                    className={`mt-2.5 text-sm font-bold line-clamp-1 group-hover/card:text-indigo-400 transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {title}
                  </h3>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

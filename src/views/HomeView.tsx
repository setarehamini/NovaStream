import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { MediaItem, RouteState, VideoItem, Theme, Language } from '../types';
import { TrendingService, MovieService, SeriesService, VideoService } from '../services';
import { HeroBanner } from '../components/HeroBanner';
import { MovieCard } from '../components/MovieCard';
import { SkeletonGrid } from '../components/SkeletonGrid';
import { TrailerModal } from '../components/TrailerModal';
import { LatestTrailersSlider } from '../components/LatestTrailersSlider';
import { translations } from '../i18n/translations';

interface HomeViewProps {
  onNavigate: (route: RouteState) => void;
  language: Language;
  theme: Theme;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, language, theme }) => {
  const [heroItems, setHeroItems] = useState<MediaItem[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<MediaItem[]>([]);
  const [popularSeries, setPopularSeries] = useState<MediaItem[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrailer, setSelectedTrailer] = useState<{ video: VideoItem | null; title: string }>({
    video: null,
    title: '',
  });

  const t = translations[language];

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const langParam = language === 'fa' ? 'fa-IR' : 'en-US';
        const [trendingAll, moviesTrend, tvPop, moviesTop] = await Promise.all([
          TrendingService.getAllTrending('day', langParam).catch(() => []),
          MovieService.getPopular(1, langParam).then(r => r.results).catch(() => []),
          SeriesService.getPopular(1, langParam).then(r => r.results).catch(() => []),
          MovieService.getTopRated(1, langParam).then(r => r.results).catch(() => []),
        ]);

        if (isMounted) {
          setHeroItems(trendingAll.length > 0 ? trendingAll : moviesTrend);
          setTrendingMovies(moviesTrend);
          setPopularSeries(tvPop);
          setTopRatedMovies(moviesTop);
        }
      } catch (err) {
        console.error("HomeView load error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [language]);

  const handleOpenTrailer = async (item: MediaItem) => {
    const isTV = item.media_type === 'tv' || !!item.first_air_date;
    const title = item.title || item.name || '';
    const langParam = language === 'fa' ? 'fa-IR' : 'en-US';
    try {
      const videos = isTV
        ? await VideoService.getTvVideos(item.id, langParam)
        : await VideoService.getMovieVideos(item.id, langParam);

      // Try English videos if Persian returns empty
      const videoList = videos.length > 0 ? videos : isTV
        ? await VideoService.getTvVideos(item.id, 'en-US')
        : await VideoService.getMovieVideos(item.id, 'en-US');

      const best = VideoService.findBestTrailer(videoList);
      if (best) {
        setSelectedTrailer({ video: best, title });
      } else {
        alert(language === 'fa' ? 'پیش‌نمایش برای این عنوان یافت نشد.' : 'No trailer found for this title.');
      }
    } catch {
      alert('Could not load trailer.');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Banner Section */}
      {isLoading ? (
        <div className="w-full h-[520px] bg-slate-900 animate-pulse flex items-center justify-center">
          <div className="text-slate-500 font-medium text-sm">{t.loading}</div>
        </div>
      ) : (
        <HeroBanner
          items={heroItems}
          onNavigate={onNavigate}
          onOpenTrailer={handleOpenTrailer}
          language={language}
          theme={theme}
        />
      )}

      {/* Main Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-12">
        {/* Section 1: Trending Movies */}
        <section id="trending-movies-section">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t.trendingMovies}
              </h2>
              <p className="text-xs text-slate-500">{t.tagline}</p>
            </div>

            <button
              id="view-all-movies-btn"
              onClick={() => onNavigate({ view: 'movies' })}
              className="text-xs sm:text-sm font-semibold text-white/90 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer group"
            >
              <span>{t.viewAll}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>

          {isLoading ? (
            <SkeletonGrid count={6} theme={theme} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {trendingMovies.slice(0, 12).map((item) => (
                <MovieCard
                  key={`trend-${item.id}`}
                  item={item}
                  mediaTypeFallback="movie"
                  onNavigate={onNavigate}
                  theme={theme}
                />
              ))}
            </div>
          )}
        </section>

        {/* Latest Trailers Slider Section (TMDB style) */}
        <LatestTrailersSlider
          onOpenTrailer={handleOpenTrailer}
          language={language}
          theme={theme}
        />

        {/* Section 2: Popular TV Series */}
        <section id="popular-series-section">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t.popularSeries}
              </h2>
              <p className="text-xs text-slate-500">Binge-worthy drama, action, and fantasy shows</p>
            </div>

            <button
              id="view-all-series-btn"
              onClick={() => onNavigate({ view: 'series' })}
              className="text-xs sm:text-sm font-semibold text-white/90 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer group"
            >
              <span>{t.viewAll}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>

          {isLoading ? (
            <SkeletonGrid count={6} theme={theme} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {popularSeries.slice(0, 12).map((item) => (
                <MovieCard
                  key={`tv-${item.id}`}
                  item={item}
                  mediaTypeFallback="tv"
                  onNavigate={onNavigate}
                  theme={theme}
                />
              ))}
            </div>
          )}
        </section>

        {/* Section 3: Top Rated Movies */}
        <section id="top-rated-movies-section">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t.topRatedMovies}
              </h2>
              <p className="text-xs text-slate-500">Masterpieces voted by global cinema enthusiasts</p>
            </div>

            <button
              onClick={() => onNavigate({ view: 'movies' })}
              className="text-xs sm:text-sm font-semibold text-white/90 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer group"
            >
              <span>{t.viewAll}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>

          {isLoading ? (
            <SkeletonGrid count={6} theme={theme} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {topRatedMovies.slice(0, 12).map((item) => (
                <MovieCard
                  key={`top-${item.id}`}
                  item={item}
                  mediaTypeFallback="movie"
                  onNavigate={onNavigate}
                  theme={theme}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={Boolean(selectedTrailer.video)}
        video={selectedTrailer.video}
        title={selectedTrailer.title}
        onClose={() => setSelectedTrailer({ video: null, title: '' })}
      />
    </div>
  );
};

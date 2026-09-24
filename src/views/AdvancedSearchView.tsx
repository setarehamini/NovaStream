import React, { useState, useEffect } from 'react';
import { Genre, MediaItem, RouteState, Theme, Language } from '../types';
import { SearchService, MovieService, SeriesService, GenreService } from '../services';
import { MovieCard } from '../components/MovieCard';
import { SkeletonGrid } from '../components/SkeletonGrid';
import { Pagination } from '../components/Pagination';
import { MediaFilterPanel, FilterValues } from '../components/MediaFilterPanel';
import { translations } from '../i18n/translations';

interface AdvancedSearchViewProps {
  initialQuery?: string;
  onNavigate: (route: RouteState) => void;
  language: Language;
  theme: Theme;
}

export const AdvancedSearchView: React.FC<AdvancedSearchViewProps> = ({
  initialQuery = '',
  onNavigate,
  language,
  theme,
}) => {
  const t = translations[language];

  // Quick Access TMDB Category (Popular, Now Playing/Airing Today, Upcoming/On TV, Top Rated)
  const [activeQuickTag, setActiveQuickTag] = useState<string>('popular');

  // Applied Filter State
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({
    query: initialQuery,
    type: 'all',
    yearMin: 1888,
    yearMax: 2026,
    ratingMin: 1.0,
    ratingMax: 10.0,
    minVotesMin: 0,
    minVotesMax: 10000,
    language: 'all',
    certification: 'all',
    sortBy: 'popularity.desc',
    genre: null,
    isCustomFilterActive: false,
  });

  // Results & Pagination
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load genres when media type changes
  useEffect(() => {
    const langParam = language === 'fa' ? 'fa-IR' : 'en-US';
    if (appliedFilters.type === 'tv') {
      GenreService.getTvGenres(langParam).then(setGenres);
    } else {
      GenreService.getMovieGenres(langParam).then(setGenres);
    }
  }, [appliedFilters.type, language]);

  // TMDB Quick Access Category definitions
  const movieQuickTags = [
    { id: 'popular', label: language === 'fa' ? 'محبوب‌ترین‌ها' : 'Popular' },
    { id: 'now_playing', label: language === 'fa' ? 'روی پرده سینما' : 'Now Playing' },
    { id: 'upcoming', label: language === 'fa' ? 'به‌زودی' : 'Upcoming' },
    { id: 'top_rated', label: language === 'fa' ? 'برترین امتیازها' : 'Top Rated' },
  ];

  const tvQuickTags = [
    { id: 'popular', label: language === 'fa' ? 'محبوب‌ترین‌ها' : 'Popular' },
    { id: 'airing_today', label: language === 'fa' ? 'در حال پخش امروز' : 'Airing Today' },
    { id: 'on_the_air', label: language === 'fa' ? 'در حال پخش در تلویزیون' : 'On TV' },
    { id: 'top_rated', label: language === 'fa' ? 'برترین امتیازها' : 'Top Rated' },
  ];

  const currentQuickTags = appliedFilters.type === 'tv' ? tvQuickTags : movieQuickTags;

  // Apply filters from MediaFilterPanel
  const handleApplyFilters = (newFilters: FilterValues) => {
    setAppliedFilters(newFilters);
    setPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setAppliedFilters({
      query: '',
      type: 'all',
      yearMin: 1888,
      yearMax: 2026,
      ratingMin: 1.0,
      ratingMax: 10.0,
      minVotesMin: 0,
      minVotesMax: 10000,
      language: 'all',
      certification: 'all',
      sortBy: 'popularity.desc',
      genre: null,
      isCustomFilterActive: false,
    });
    setActiveQuickTag('popular');
    setPage(1);
  };

  // Quick Access tag click
  const handleQuickTagClick = (tagId: string) => {
    setActiveQuickTag(tagId);
    setAppliedFilters((prev) => ({
      ...prev,
      query: '',
      genre: null,
      isCustomFilterActive: false,
    }));
    setPage(1);
  };

  // Execute Search or Discovery
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function execute() {
      try {
        const langParam = language === 'fa' ? 'fa-IR' : 'en-US';
        let res;

        // Mode 1: Text Query
        if (appliedFilters.query) {
          const yearParam =
            appliedFilters.yearMin > 1888
              ? String(appliedFilters.yearMin)
              : appliedFilters.yearMax < 2026
              ? String(appliedFilters.yearMax)
              : undefined;

          if (appliedFilters.type === 'movie') {
            res = await SearchService.searchMovies(appliedFilters.query, page, langParam, yearParam);
          } else if (appliedFilters.type === 'tv') {
            res = await SearchService.searchSeries(appliedFilters.query, page, langParam, yearParam);
          } else {
            const multi = await SearchService.multiSearch(appliedFilters.query, page, langParam);
            const filtered = (multi.results || []).filter(
              (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
            );
            res = { ...multi, results: filtered };
          }
        }
        // Mode 2: Custom Filters
        else if (appliedFilters.isCustomFilterActive) {
          const filterPayload = {
            page,
            language: langParam,
            genres: appliedFilters.genre ? [appliedFilters.genre] : [],
            yearFrom: appliedFilters.yearMin > 1888 ? String(appliedFilters.yearMin) : undefined,
            yearTo: appliedFilters.yearMax < 2026 ? String(appliedFilters.yearMax) : undefined,
            minRating: appliedFilters.ratingMin > 1.0 ? String(appliedFilters.ratingMin) : undefined,
            maxRating: appliedFilters.ratingMax < 10.0 ? String(appliedFilters.ratingMax) : undefined,
            minVotes: appliedFilters.minVotesMin > 0 ? String(appliedFilters.minVotesMin) : undefined,
            originalLanguage: appliedFilters.language !== 'all' ? appliedFilters.language : undefined,
            certification: appliedFilters.certification !== 'all' ? appliedFilters.certification : undefined,
            sortBy: appliedFilters.sortBy,
          };

          if (appliedFilters.type === 'tv') {
            res = await SeriesService.discover(filterPayload);
          } else {
            res = await MovieService.discover(filterPayload);
          }
        }
        // Mode 3: TMDB Header Tags
        else {
          if (appliedFilters.type === 'tv') {
            switch (activeQuickTag) {
              case 'airing_today':
                res = await SeriesService.getAiringToday(page, langParam);
                break;
              case 'on_the_air':
                res = await SeriesService.getOnTheAir(page, langParam);
                break;
              case 'top_rated':
                res = await SeriesService.getTopRated(page, langParam);
                break;
              case 'popular':
              default:
                res = await SeriesService.getPopular(page, langParam);
                break;
            }
          } else {
            switch (activeQuickTag) {
              case 'now_playing':
                res = await MovieService.getNowPlaying(page, langParam);
                break;
              case 'upcoming':
                res = await MovieService.getUpcoming(page, langParam);
                break;
              case 'top_rated':
                res = await MovieService.getTopRated(page, langParam);
                break;
              case 'popular':
              default:
                res = await MovieService.getPopular(page, langParam);
                break;
            }
          }
        }

        if (isMounted) {
          setResults(res.results || []);
          setTotalPages(Math.min(res.total_pages || 1, 500));
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    execute();
    return () => {
      isMounted = false;
    };
  }, [appliedFilters, activeQuickTag, page, language]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header: Title & TMDB Category Tags (NO "Quick Access" label) */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {t.searchTitle}
          </h1>

          {/* TMDB Category Tags */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {currentQuickTags.map((qt) => {
              const isActive = !appliedFilters.query && !appliedFilters.isCustomFilterActive && activeQuickTag === qt.id;
              return (
                <button
                  key={qt.id}
                  onClick={() => handleQuickTagClick(qt.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-rose-600/30 ring-2 ring-rose-400/20'
                      : theme === 'dark'
                      ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                      : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-950 border border-slate-200'
                  }`}
                >
                  {qt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Unified Filter Panel (Same as Movies and Series pages) */}
        <MediaFilterPanel
          mediaType={appliedFilters.type}
          lockType={false}
          onTypeChange={(type) => {
            setAppliedFilters((prev) => ({ ...prev, type }));
          }}
          genres={genres}
          initialQuery={appliedFilters.query}
          initialGenreId={appliedFilters.genre}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          language={language}
          theme={theme}
        />
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
          {appliedFilters.query
            ? `Results for "${appliedFilters.query}"`
            : appliedFilters.isCustomFilterActive
            ? 'Filtered Discovery Results'
            : currentQuickTags.find((q) => q.id === activeQuickTag)?.label || 'Discovery'}
          {' '}({results.length} titles on page {page})
        </h2>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <SkeletonGrid count={18} theme={theme} />
      ) : results.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
            {t.noResults}
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No titles matched the selected year range, rating, votes, or genre. Try adjusting your parameters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {results.map((item) => (
              <MovieCard
                key={`${item.id}-${item.media_type || appliedFilters.type || 'search'}`}
                item={item}
                mediaTypeFallback={appliedFilters.type === 'all' ? undefined : appliedFilters.type}
                onNavigate={onNavigate}
                theme={theme}
              />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            language={language}
            theme={theme}
          />
        </>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Film } from 'lucide-react';
import { Genre, MediaItem, RouteState, Theme, Language } from '../types';
import { MovieService, GenreService, SearchService } from '../services';
import { MovieCard } from '../components/MovieCard';
import { SkeletonGrid } from '../components/SkeletonGrid';
import { Pagination } from '../components/Pagination';
import { MediaFilterPanel, FilterValues } from '../components/MediaFilterPanel';
import { translations } from '../i18n/translations';

interface MoviesViewProps {
  onNavigate: (route: RouteState) => void;
  language: Language;
  theme: Theme;
  initialGenreId?: string;
}

export const MoviesView: React.FC<MoviesViewProps> = ({
  onNavigate,
  language,
  theme,
  initialGenreId,
}) => {
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const t = translations[language];

  // Applied Filters State
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({
    query: '',
    type: 'movie',
    yearMin: 1888,
    yearMax: 2026,
    ratingMin: 1.0,
    ratingMax: 10.0,
    minVotesMin: 0,
    minVotesMax: 10000,
    language: 'all',
    certification: 'all',
    sortBy: 'popularity.desc',
    genre: initialGenreId ? parseInt(initialGenreId, 10) : null,
    isCustomFilterActive: !!initialGenreId,
  });

  // Fetch Genres
  useEffect(() => {
    const langParam = language === 'fa' ? 'fa-IR' : 'en-US';
    GenreService.getMovieGenres(langParam)
      .then(setGenres)
      .catch(console.error);
  }, [language]);

  // Load Movies based on applied filters and page
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    async function loadMovies() {
      try {
        const langParam = language === 'fa' ? 'fa-IR' : 'en-US';
        let res;

        if (appliedFilters.query) {
          const yearParam =
            appliedFilters.yearMin > 1888
              ? String(appliedFilters.yearMin)
              : appliedFilters.yearMax < 2026
              ? String(appliedFilters.yearMax)
              : undefined;

          res = await SearchService.searchMovies(
            appliedFilters.query,
            page,
            langParam,
            yearParam
          );
        } else if (appliedFilters.isCustomFilterActive) {
          res = await MovieService.discover({
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
          });
        } else {
          res = await MovieService.getPopular(page, langParam);
        }

        if (isMounted) {
          const formatted = (res.results || []).map((m: any) => ({
            ...m,
            media_type: 'movie' as const,
          }));
          setMovies(formatted);
          setTotalPages(Math.min(res.total_pages || 1, 500));
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || t.errorLoading);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadMovies();
    return () => {
      isMounted = false;
    };
  }, [page, appliedFilters, language, t.errorLoading]);

  const handleApplyFilters = (newFilters: FilterValues) => {
    setAppliedFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setAppliedFilters({
      query: '',
      type: 'movie',
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
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Film className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {t.movies}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {language === 'fa' ? 'کاوش و فیلتر پیشرفته برترین فیلم‌های سینمایی' : 'Discover and explore all cinematic feature films'}
          </p>
        </div>
      </div>

      {/* Unified Filter Panel (Same as Search and Series pages) */}
      <MediaFilterPanel
        mediaType="movie"
        lockType={true}
        genres={genres}
        initialQuery={appliedFilters.query}
        initialGenreId={appliedFilters.genre}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        language={language}
        theme={theme}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
          {appliedFilters.query
            ? `Results for "${appliedFilters.query}"`
            : appliedFilters.isCustomFilterActive
            ? 'Filtered Movies'
            : t.popularMovies}
          {' '}({movies.length} titles on page {page})
        </h2>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Movies Grid */}
      {isLoading ? (
        <SkeletonGrid count={18} theme={theme} />
      ) : movies.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
            {t.noResults}
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No movies matched the current filters. Try resetting the filters or adjusting the parameters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={`movie-${movie.id}`}
                item={movie}
                mediaTypeFallback="movie"
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

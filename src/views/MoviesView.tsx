import React, { useState, useEffect } from 'react';
import { Film, Search, Filter, RefreshCw } from 'lucide-react';
import { Genre, MediaItem, RouteState, Theme, Language } from '../types';
import { MovieService, GenreService, SearchService } from '../services';
import { MovieCard } from '../components/MovieCard';
import { SkeletonGrid } from '../components/SkeletonGrid';
import { Pagination } from '../components/Pagination';
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

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenreId || 'all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popularity.desc');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const t = translations[language];

  // Fetch Genres
  useEffect(() => {
    const langParam = language === 'fa' ? 'fa-IR' : 'en-US';
    GenreService.getMovieGenres(langParam)
      .then(setGenres)
      .catch(console.error);
  }, [language]);

  // Fetch Movies when filters change
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    async function loadMovies() {
      try {
        const langParam = language === 'fa' ? 'fa-IR' : 'en-US';
        let res;

        if (searchQuery.trim()) {
          res = await SearchService.searchMovies(
            searchQuery.trim(),
            page,
            langParam,
            selectedYear !== 'all' ? selectedYear : undefined
          );
        } else {
          res = await MovieService.discover({
            page,
            language: langParam,
            genreId: selectedGenre,
            year: selectedYear,
            minRating: selectedRating,
            sortBy,
          });
        }

        if (isMounted) {
          setMovies(res.results || []);
          setTotalPages(res.total_pages || 1);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || t.errorLoading);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    const timer = setTimeout(loadMovies, searchQuery ? 400 : 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [page, searchQuery, selectedGenre, selectedYear, selectedRating, sortBy, language]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('all');
    setSelectedYear('all');
    setSelectedRating('all');
    setSortBy('popularity.desc');
    setPage(1);
  };

  const yearsList = [
    { value: 'all', label: t.allYears },
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: '2021', label: '2021' },
    { value: '2020', label: '2020' },
  ];

  const ratingList = [
    { value: 'all', label: t.allRatings },
    { value: '8', label: '⭐ 8.0+' },
    { value: '7', label: '⭐ 7.0+' },
    { value: '6', label: '⭐ 6.0+' },
    { value: '5', label: '⭐ 5.0+' },
  ];

  const sortOptions = [
    { value: 'popularity.desc', label: t.sortPopularityDesc },
    { value: 'vote_average.desc', label: t.sortRatingDesc },
    { value: 'primary_release_date.desc', label: t.sortDateDesc },
    { value: 'original_title.asc', label: t.sortTitleAsc },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/40 pb-6">
        <div>
          <div className="flex items-center gap-2.5 text-rose-500 font-semibold text-xs tracking-wider uppercase mb-1">
            <Film className="w-4 h-4" />
            <span>Cinema Catalog</span>
          </div>
          <h1 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {t.movies}
          </h1>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <input
            id="movies-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder={t.searchPlaceholder}
            className={`w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 text-sm rounded-xl border transition-all ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 shadow-xs'
            }`}
          />
          <Search className="w-4 h-4 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5 opacity-50" />
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-wrap items-center gap-3 sm:gap-4 ${
          theme === 'dark' ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500 mr-2 rtl:mr-0 rtl:ml-2">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </div>

        {/* Genre Selector */}
        <select
          id="movies-genre-filter"
          value={selectedGenre}
          onChange={(e) => {
            setSelectedGenre(e.target.value);
            setPage(1);
          }}
          disabled={Boolean(searchQuery.trim())}
          className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors cursor-pointer outline-hidden disabled:opacity-50 disabled:cursor-not-allowed ${
            theme === 'dark'
              ? 'bg-slate-950 border-slate-700 text-slate-200 disabled:bg-slate-900/50'
              : 'bg-white border-slate-300 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 shadow-xs'
          }`}
        >
          <option value="all" className={theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
            {t.allGenres}
          </option>
          {genres.map((g) => (
            <option key={g.id} value={g.id} className={theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
              {g.name}
            </option>
          ))}
        </select>

        {/* Year Selector */}
        <select
          id="movies-year-filter"
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(e.target.value);
            setPage(1);
          }}
          className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors cursor-pointer outline-hidden ${
            theme === 'dark'
              ? 'bg-slate-950 border-slate-700 text-slate-200'
              : 'bg-white border-slate-300 text-slate-900 shadow-xs'
          }`}
        >
          {yearsList.map((y) => (
            <option key={y.value} value={y.value} className={theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
              {y.label}
            </option>
          ))}
        </select>

        {/* Rating Selector */}
        <select
          id="movies-rating-filter"
          value={selectedRating}
          onChange={(e) => {
            setSelectedRating(e.target.value);
            setPage(1);
          }}
          disabled={Boolean(searchQuery.trim())}
          className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors cursor-pointer outline-hidden disabled:opacity-50 disabled:cursor-not-allowed ${
            theme === 'dark'
              ? 'bg-slate-950 border-slate-700 text-slate-200 disabled:bg-slate-900/50'
              : 'bg-white border-slate-300 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 shadow-xs'
          }`}
        >
          {ratingList.map((r) => (
            <option key={r.value} value={r.value} className={theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
              {r.label}
            </option>
          ))}
        </select>

        {/* Sort Selector */}
        <select
          id="movies-sort-filter"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          disabled={Boolean(searchQuery.trim())}
          className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors cursor-pointer outline-hidden disabled:opacity-50 disabled:cursor-not-allowed ${
            theme === 'dark'
              ? 'bg-slate-950 border-slate-700 text-slate-200 disabled:bg-slate-900/50'
              : 'bg-white border-slate-300 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 shadow-xs'
          }`}
        >
          {sortOptions.map((s) => (
            <option key={s.value} value={s.value} className={theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Reset button */}
        {(selectedGenre !== 'all' || selectedYear !== 'all' || selectedRating !== 'all' || searchQuery || sortBy !== 'popularity.desc') && (
          <button
            onClick={handleResetFilters}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5 cursor-pointer ml-auto rtl:ml-0 rtl:mr-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Content Grid */}
      {error ? (
        <div className="py-16 text-center space-y-3">
          <p className="text-rose-500 font-semibold">{error}</p>
          <button
            onClick={() => setPage(1)}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium"
          >
            {t.retry}
          </button>
        </div>
      ) : isLoading ? (
        <SkeletonGrid count={18} theme={theme} />
      ) : movies.length === 0 ? (
        <div className="py-20 text-center space-y-2">
          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
            {t.noResults}
          </p>
          <p className="text-xs text-slate-500">Try adjusting your search keywords or removing filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                item={movie}
                mediaTypeFallback="movie"
                onNavigate={onNavigate}
                theme={theme}
              />
            ))}
          </div>

          {/* Pagination */}
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

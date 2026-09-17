import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Film, Tv, Sparkles } from 'lucide-react';
import { Genre, MediaItem, RouteState, Theme, Language } from '../types';
import { SearchService, MovieService, SeriesService, GenreService } from '../services';
import { MovieCard } from '../components/MovieCard';
import { SkeletonGrid } from '../components/SkeletonGrid';
import { Pagination } from '../components/Pagination';
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
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<'all' | 'movie' | 'tv'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popularity.desc');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const t = translations[language];

  // Update query if prop changes
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      setPage(1);
    }
  }, [initialQuery]);

  // Load genres based on selected type
  useEffect(() => {
    const langParam = language === 'fa' ? 'fa-IR' : 'en-US';
    if (type === 'tv') {
      GenreService.getTvGenres(langParam).then(setGenres);
    } else {
      GenreService.getMovieGenres(langParam).then(setGenres);
    }
  }, [type, language]);

  // Search execution
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function executeSearch() {
      try {
        const langParam = language === 'fa' ? 'fa-IR' : 'en-US';
        let res;

        if (query.trim()) {
          if (type === 'movie') {
            res = await SearchService.searchMovies(query, page, langParam, selectedYear !== 'all' ? selectedYear : undefined);
          } else if (type === 'tv') {
            res = await SearchService.searchSeries(query, page, langParam, selectedYear !== 'all' ? selectedYear : undefined);
          } else {
            const multi = await SearchService.multiSearch(query, page, langParam);
            const filtered = (multi.results || []).filter(
              (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
            );
            res = { ...multi, results: filtered };
          }
        } else {
          // If no search query, use discover based on type and filters!
          if (type === 'tv') {
            res = await SeriesService.discover({
              page,
              language: langParam,
              genreId: selectedGenre,
              year: selectedYear,
              minRating: selectedRating,
              sortBy,
            });
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
        }

        if (isMounted) {
          setResults(res.results || []);
          setTotalPages(res.total_pages || 1);
        }
      } catch (err) {
        console.error("Advanced search error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    const timer = setTimeout(executeSearch, query ? 350 : 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query, type, selectedGenre, selectedYear, selectedRating, sortBy, page, language]);

  const handleReset = () => {
    setQuery('');
    setType('all');
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
      {/* Title & Query input */}
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Search & Discovery Engine</span>
        </div>

        <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          {t.searchTitle}
        </h1>

        <div className="relative w-full">
          <input
            id="advanced-search-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={t.searchPlaceholder}
            className={`w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-3.5 text-base rounded-2xl border transition-all ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 shadow-md'
            }`}
          />
          <Search className="w-5 h-5 absolute left-4 rtl:left-auto rtl:right-4 top-4 text-slate-400" />
        </div>
      </div>

      {/* Advanced Filter Panel */}
      <div
        className={`p-5 rounded-2xl border flex flex-wrap items-center gap-3 sm:gap-4 transition-colors ${
          theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500 mr-2 rtl:mr-0 rtl:ml-2">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </div>

        {/* Media Type Filter Tabs (All, Movies, TV Series) */}
        <div
          className={`flex items-center p-1 rounded-xl border transition-colors ${
            theme === 'dark'
              ? 'bg-slate-950/60 border-slate-800'
              : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            id="search-type-all-btn"
            onClick={() => { setType('all'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              type === 'all'
                ? 'bg-rose-600 text-white shadow-sm'
                : theme === 'dark'
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
            }`}
          >
            {t.all}
          </button>
          <button
            id="search-type-movie-btn"
            onClick={() => { setType('movie'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              type === 'movie'
                ? 'bg-rose-600 text-white shadow-sm'
                : theme === 'dark'
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
            }`}
          >
            <Film className="w-3 h-3" />
            <span>{t.movies}</span>
          </button>
          <button
            id="search-type-tv-btn"
            onClick={() => { setType('tv'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              type === 'tv'
                ? 'bg-sky-600 text-white shadow-sm'
                : theme === 'dark'
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
            }`}
          >
            <Tv className="w-3 h-3" />
            <span>{t.series}</span>
          </button>
        </div>

        {/* Genre Selector */}
        <select
          value={selectedGenre}
          onChange={(e) => { setSelectedGenre(e.target.value); setPage(1); }}
          disabled={Boolean(query.trim())}
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
          value={selectedYear}
          onChange={(e) => { setSelectedYear(e.target.value); setPage(1); }}
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
          value={selectedRating}
          onChange={(e) => { setSelectedRating(e.target.value); setPage(1); }}
          disabled={Boolean(query.trim())}
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
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          disabled={Boolean(query.trim())}
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
        <button
          onClick={handleReset}
          className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5 cursor-pointer ml-auto rtl:ml-0 rtl:mr-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Results Header */}
      <div>
        <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
          {query ? `Results for "${query}"` : 'Recommended Discovery'} ({results.length} on page {page})
        </h2>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <SkeletonGrid count={18} theme={theme} />
      ) : results.length === 0 ? (
        <div className="py-20 text-center space-y-2">
          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
            {t.noResults}
          </p>
          <p className="text-xs text-slate-500">Try searching for other titles or altering your filter parameters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {results.map((item) => (
              <MovieCard
                key={`${item.id}-${item.media_type || 'search'}`}
                item={item}
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

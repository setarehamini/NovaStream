import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Film, Tv, Check } from 'lucide-react';
import { Genre, Language, Theme } from '../types';
import { DualRangeSlider } from './DualRangeSlider';
import { translations } from '../i18n/translations';

export interface FilterValues {
  query: string;
  type: 'all' | 'movie' | 'tv';
  yearMin: number;
  yearMax: number;
  ratingMin: number;
  ratingMax: number;
  minVotesMin: number;
  minVotesMax: number;
  language: string;
  certification: string;
  sortBy: string;
  genre: number | null;
  isCustomFilterActive: boolean;
}

interface MediaFilterPanelProps {
  mediaType: 'all' | 'movie' | 'tv';
  lockType?: boolean;
  onTypeChange?: (type: 'all' | 'movie' | 'tv') => void;
  genres: Genre[];
  initialQuery?: string;
  initialGenreId?: number | null;
  onApply: (filters: FilterValues) => void;
  onReset: () => void;
  language: Language;
  theme: Theme;
}

export const MediaFilterPanel: React.FC<MediaFilterPanelProps> = ({
  mediaType,
  lockType = false,
  onTypeChange,
  genres,
  initialQuery = '',
  initialGenreId = null,
  onApply,
  onReset,
  language,
  theme,
}) => {
  const isRtl = language === 'fa';
  const t = translations[language];

  // Draft search input
  const [searchInput, setSearchInput] = useState(initialQuery);

  // Draft filters
  const [draftType, setDraftType] = useState<'all' | 'movie' | 'tv'>(mediaType);
  const [draftYearMin, setDraftYearMin] = useState<number>(1888);
  const [draftYearMax, setDraftYearMax] = useState<number>(2026);
  const [draftRatingMin, setDraftRatingMin] = useState<number>(1.0);
  const [draftRatingMax, setDraftRatingMax] = useState<number>(10.0);
  const [draftMinVotesMin, setDraftMinVotesMin] = useState<number>(0);
  const [draftMinVotesMax, setDraftMinVotesMax] = useState<number>(10000);
  const [draftLanguage, setDraftLanguage] = useState<string>('all');
  const [draftCertification, setDraftCertification] = useState<string>('all');
  const [draftSortBy, setDraftSortBy] = useState<string>('popularity.desc');
  const [draftGenre, setDraftGenre] = useState<number | null>(initialGenreId);

  useEffect(() => {
    if (initialQuery !== undefined) {
      setSearchInput(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (initialGenreId !== undefined && initialGenreId !== null) {
      setDraftGenre(initialGenreId);
    }
  }, [initialGenreId]);

  useEffect(() => {
    setDraftType(mediaType);
  }, [mediaType]);

  const handleTypeSelect = (type: 'all' | 'movie' | 'tv') => {
    setDraftType(type);
    if (onTypeChange) onTypeChange(type);
  };

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const isCustom =
      draftGenre !== null ||
      draftYearMin > 1888 ||
      draftYearMax < 2026 ||
      draftRatingMin > 1.0 ||
      draftRatingMax < 10.0 ||
      draftMinVotesMin > 0 ||
      draftMinVotesMax < 10000 ||
      draftLanguage !== 'all' ||
      draftCertification !== 'all' ||
      draftSortBy !== 'popularity.desc';

    onApply({
      query: searchInput.trim(),
      type: draftType,
      yearMin: draftYearMin,
      yearMax: draftYearMax,
      ratingMin: draftRatingMin,
      ratingMax: draftRatingMax,
      minVotesMin: draftMinVotesMin,
      minVotesMax: draftMinVotesMax,
      language: draftLanguage,
      certification: draftCertification,
      sortBy: draftSortBy,
      genre: draftGenre,
      isCustomFilterActive: isCustom,
    });
  };

  const handleReset = () => {
    setSearchInput('');
    setDraftType(mediaType);
    setDraftYearMin(1888);
    setDraftYearMax(2026);
    setDraftRatingMin(1.0);
    setDraftRatingMax(10.0);
    setDraftMinVotesMin(0);
    setDraftMinVotesMax(10000);
    setDraftLanguage('all');
    setDraftCertification('all');
    setDraftSortBy('popularity.desc');
    setDraftGenre(null);

    onReset();
  };

  // Language options
  const languageOptions = [
    { value: 'all', label: language === 'fa' ? 'همه زبان‌ها' : 'All Languages' },
    { value: 'en', label: 'English (en)' },
    { value: 'fa', label: 'فارسی / Persian (fa)' },
    { value: 'es', label: 'Español (es)' },
    { value: 'fr', label: 'Français (fr)' },
    { value: 'de', label: 'Deutsch (de)' },
    { value: 'ja', label: '日本語 / Japanese (ja)' },
    { value: 'ko', label: '한국어 / Korean (ko)' },
    { value: 'it', label: 'Italiano (it)' },
    { value: 'hi', label: 'हिन्दी / Hindi (hi)' },
    { value: 'tr', label: 'Türkçe (tr)' },
    { value: 'zh', label: '中文 / Chinese (zh)' },
    { value: 'ar', label: 'العربية / Arabic (ar)' },
  ];

  // Certification options
  const certificationOptions = [
    { value: 'all', label: language === 'fa' ? 'همه رده‌بندی‌ها' : 'All Certifications' },
    { value: 'G', label: 'G (General Audiences)' },
    { value: 'PG', label: 'PG (Parental Guidance)' },
    { value: 'PG-13', label: 'PG-13 (Parents Cautioned)' },
    { value: 'R', label: 'R (Restricted 17+)' },
    { value: 'NC-17', label: 'NC-17 (Adults Only)' },
  ];

  // Sort options
  const sortOptions = [
    { value: 'popularity.desc', label: 'Popularity Descending' },
    { value: 'popularity.asc', label: 'Popularity Ascending' },
    { value: 'vote_average.desc', label: 'Rating Descending' },
    { value: 'vote_average.asc', label: 'Rating Ascending' },
    { value: 'primary_release_date.desc', label: 'Release Date Descending' },
    { value: 'primary_release_date.asc', label: 'Release Date Ascending' },
    { value: 'original_title.asc', label: 'Title (A-Z)' },
    { value: 'vote_count.desc', label: 'User Votes Descending' },
  ];

  return (
    <div className="space-y-6">
      {/* Search Input Bar with Submit Button */}
      <form onSubmit={handleApply} className="flex items-center gap-2 max-w-3xl">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`w-full pl-11 pr-4 rtl:pr-11 rtl:pl-4 py-3 text-sm sm:text-base rounded-2xl border transition-all ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-xs'
            }`}
          />
          <Search className="w-5 h-5 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5 text-slate-400" />
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-600/25 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          <span>{language === 'fa' ? 'جستجو' : 'Search'}</span>
        </button>
      </form>

      {/* Main Filter Panel */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border transition-all space-y-6 ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm'
        }`}
      >
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {language === 'fa' ? 'فیلترها' : 'Filters'}
            </span>

            {/* Type selector (only displayed if not locked) */}
            {!lockType ? (
              <div
                className={`flex items-center p-1 rounded-xl border transition-colors ${
                  theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-300 shadow-xs'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleTypeSelect('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    draftType === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : theme === 'dark'
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  {t.all}
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeSelect('movie')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    draftType === 'movie'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : theme === 'dark'
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>{t.movies}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeSelect('tv')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    draftType === 'tv'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : theme === 'dark'
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>{t.series}</span>
                </button>
              </div>
            ) : (
              <span className="px-3 py-1 rounded-lg bg-indigo-600/15 text-indigo-400 font-bold text-xs flex items-center gap-1.5 border border-indigo-500/20">
                {draftType === 'tv' ? <Tv className="w-3.5 h-3.5" /> : <Film className="w-3.5 h-3.5" />}
                <span>{draftType === 'tv' ? t.series : t.movies}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-indigo-400 hover:bg-indigo-500/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === 'fa' ? 'بازنشانی فیلترها' : 'Reset Filters'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleApply()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{language === 'fa' ? 'اعمال فیلترها' : 'Apply Filters'}</span>
            </button>
          </div>
        </div>

        {/* Range Sliders Section (Consistent across all pages - NO orange) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Release Year */}
          <div
            className={`p-4 rounded-2xl border ${
              theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <DualRangeSlider
              label={language === 'fa' ? 'سال ساخت' : 'Release Year'}
              min={1888}
              max={2026}
              step={1}
              minValue={draftYearMin}
              maxValue={draftYearMax}
              onChange={(minV, maxV) => {
                setDraftYearMin(minV);
                setDraftYearMax(maxV);
              }}
              theme={theme}
              isRtl={isRtl}
            />
          </div>

          {/* Rating */}
          <div
            className={`p-4 rounded-2xl border ${
              theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <DualRangeSlider
              label={language === 'fa' ? 'امتیاز' : 'Rating'}
              min={1.0}
              max={10.0}
              step={0.5}
              minValue={draftRatingMin}
              maxValue={draftRatingMax}
              formatValue={(v) => v.toFixed(1)}
              onChange={(minV, maxV) => {
                setDraftRatingMin(minV);
                setDraftRatingMax(maxV);
              }}
              theme={theme}
              isRtl={isRtl}
            />
          </div>

          {/* Minimum User Votes */}
          <div
            className={`p-4 rounded-2xl border ${
              theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <DualRangeSlider
              label={language === 'fa' ? 'حداقل آرا' : 'Minimum User Votes'}
              min={0}
              max={10000}
              step={100}
              minValue={draftMinVotesMin}
              maxValue={draftMinVotesMax}
              formatValue={(v) => v.toLocaleString()}
              onChange={(minV, maxV) => {
                setDraftMinVotesMin(minV);
                setDraftMinVotesMax(maxV);
              }}
              theme={theme}
              isRtl={isRtl}
            />
          </div>
        </div>

        {/* Dropdowns (Sort, Language, Certification) - NO red icons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Sort Results By */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400">
              {language === 'fa' ? 'مرتب‌سازی نتایج' : 'Sort Results By'}
            </label>
            <select
              value={draftSortBy}
              onChange={(e) => setDraftSortBy(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-colors cursor-pointer outline-hidden ${
                theme === 'dark'
                  ? 'bg-slate-950 border-slate-700 text-slate-100'
                  : 'bg-white border-slate-300 text-slate-900 shadow-xs'
              }`}
            >
              {sortOptions.map((s) => (
                <option key={s.value} value={s.value} className={theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Language Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400">
              {language === 'fa' ? 'زبان اصلی' : 'Original Language'}
            </label>
            <select
              value={draftLanguage}
              onChange={(e) => setDraftLanguage(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-colors cursor-pointer outline-hidden ${
                theme === 'dark'
                  ? 'bg-slate-950 border-slate-700 text-slate-100'
                  : 'bg-white border-slate-300 text-slate-900 shadow-xs'
              }`}
            >
              {languageOptions.map((l) => (
                <option key={l.value} value={l.value} className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Certification Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400">
              {language === 'fa' ? 'رده‌بندی سنی' : 'Certification'}
            </label>
            <select
              value={draftCertification}
              onChange={(e) => setDraftCertification(e.target.value)}
              disabled={draftType === 'tv'}
              className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-colors cursor-pointer outline-hidden disabled:cursor-not-allowed ${
                theme === 'dark'
                  ? 'bg-slate-950 border-slate-700 text-slate-100 disabled:bg-slate-900/50 disabled:text-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 disabled:bg-slate-200/70 disabled:text-slate-600 shadow-xs'
              }`}
            >
              {certificationOptions.map((c) => (
                <option key={c.value} value={c.value} className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Single-Select Genre Tags */}
        <div className="pt-3 border-t border-slate-800/40">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-400">
              {language === 'fa' ? 'دسته‌بندی‌ها (ژانر)' : 'Genres'}
            </span>
            {draftGenre !== null && (
              <button
                type="button"
                onClick={() => setDraftGenre(null)}
                className="text-xs text-indigo-400 hover:underline cursor-pointer"
              >
                {language === 'fa' ? 'پاک کردن انتخاب' : 'Clear selection'}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {genres.map((g) => {
              const isSelected = draftGenre === g.id;
              return (
                <button
                  key={`genre-tag-${g.id}`}
                  type="button"
                  onClick={() => setDraftGenre(isSelected ? null : g.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                      : theme === 'dark'
                      ? 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                      : 'bg-white text-slate-700 hover:bg-slate-200 hover:text-slate-950 border border-slate-200 shadow-xs'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  <span>{g.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

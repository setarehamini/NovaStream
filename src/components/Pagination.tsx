import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Language, Theme } from '../types';
import { translations } from '../i18n/translations';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  language: Language;
  theme: Theme;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  language,
  theme,
}) => {
  const t = translations[language];
  const maxPages = Math.min(totalPages, 500); // TMDB limits page to 500

  if (maxPages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const range: (number | string)[] = [];
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(maxPages - 1, currentPage + delta);

    range.push(1);
    if (left > 2) range.push('...');
    for (let i = left; i <= right; i++) {
      range.push(i);
    }
    if (right < maxPages - 1) range.push('...');
    if (maxPages > 1) range.push(maxPages);

    return range;
  };

  const pages = getPageNumbers();

  return (
    <nav
      id="pagination-nav"
      aria-label="Pagination"
      className="my-10 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 select-none"
    >
      <button
        id="pagination-prev-btn"
        disabled={currentPage <= 1}
        onClick={() => {
          onPageChange(currentPage - 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium border flex items-center gap-1 transition-colors ${
          currentPage <= 1
            ? 'opacity-40 cursor-not-allowed border-transparent'
            : theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
            : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
        }`}
      >
        <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
      </button>

      {pages.map((p, idx) => {
        if (typeof p === 'string') {
          return (
            <span key={`dots-${idx}`} className="px-2 py-1 text-slate-500 text-xs">
              •••
            </span>
          );
        }

        const isCurrent = p === currentPage;
        return (
          <button
            key={p}
            id={`pagination-page-${p}`}
            onClick={() => {
              onPageChange(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`min-w-9 h-9 px-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              isCurrent
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : theme === 'dark'
                ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
            }`}
          >
            {p}
          </button>
        );
      })}

      <button
        id="pagination-next-btn"
        disabled={currentPage >= maxPages}
        onClick={() => {
          onPageChange(currentPage + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium border flex items-center gap-1 transition-colors ${
          currentPage >= maxPages
            ? 'opacity-40 cursor-not-allowed border-transparent'
            : theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
            : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
        }`}
      >
        <ChevronRight className="w-4 h-4 rtl:rotate-180" />
      </button>

      <span className="ml-2 rtl:ml-0 rtl:mr-2 text-xs text-slate-500 font-medium">
        {t.page} {currentPage} {t.of} {maxPages}
      </span>
    </nav>
  );
};

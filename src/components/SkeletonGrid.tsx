import React from 'react';
import { Theme } from '../types';

interface SkeletonGridProps {
  count?: number;
  theme: Theme;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({ count = 12, theme }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`rounded-xl overflow-hidden animate-pulse flex flex-col ${
            theme === 'dark' ? 'bg-slate-900 border border-slate-800/80' : 'bg-slate-200 border border-slate-300'
          }`}
        >
          <div className="aspect-2/3 w-full bg-slate-800/40" />
          <div className="p-3 space-y-2">
            <div className={`h-4 w-3/4 rounded-sm ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-300'}`} />
            <div className={`h-3 w-1/3 rounded-sm ${theme === 'dark' ? 'bg-slate-800/60' : 'bg-slate-300/60'}`} />
          </div>
        </div>
      ))}
    </div>
  );
};

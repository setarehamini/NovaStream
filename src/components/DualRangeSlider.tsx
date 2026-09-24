import React, { useCallback, useRef } from 'react';

interface DualRangeSliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  minValue: number;
  maxValue: number;
  onChange: (minVal: number, maxVal: number) => void;
  formatValue?: (val: number) => string;
  theme?: 'dark' | 'light';
  isRtl?: boolean;
}

export const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  label,
  min,
  max,
  step = 1,
  minValue,
  maxValue,
  onChange,
  formatValue = (v) => String(v),
  theme = 'dark',
  isRtl = false,
}) => {
  const minPos = ((minValue - min) / (max - min)) * 100;
  const maxPos = ((maxValue - min) / (max - min)) * 100;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxValue - step);
    onChange(val, maxValue);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minValue + step);
    onChange(minValue, val);
  };

  return (
    <div className="space-y-2 select-none py-1">
      {/* Top Header: Label & Value display exactly like user screenshot */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
        {isRtl ? (
          <>
            <span className="text-indigo-400 font-bold dir-ltr">
              {formatValue(maxValue)} - {formatValue(minValue)}
            </span>
            <span className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>
              {label}
            </span>
          </>
        ) : (
          <>
            <span className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>
              {label}
            </span>
            <span className="text-indigo-400 font-bold">
              {formatValue(minValue)} - {formatValue(maxValue)}
            </span>
          </>
        )}
      </div>

      {/* Slider Track with Diamond Thumbs */}
      <div className="relative w-full h-6 flex items-center">
        {/* Base Track */}
        <div
          className={`w-full h-1.5 rounded-full ${
            theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'
          }`}
        />

        {/* Active Range Highlight */}
        <div
          className="absolute h-1.5 bg-indigo-600 rounded-full pointer-events-none"
          style={{
            left: `${Math.min(minPos, maxPos)}%`,
            width: `${Math.abs(maxPos - minPos)}%`,
          }}
        />

        {/* Dual Input Range Sliders (invisible with styled thumbs) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={handleMinChange}
          className="dual-range-input absolute w-full h-6 opacity-0 cursor-pointer pointer-events-auto z-20"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={handleMaxChange}
          className="dual-range-input absolute w-full h-6 opacity-0 cursor-pointer pointer-events-auto z-20"
        />

        {/* Visual Diamond Thumbs */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-indigo-600 hover:bg-indigo-500 rotate-45 rounded-[2px] shadow-sm pointer-events-none transition-transform z-10"
          style={{ left: `${minPos}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-indigo-600 hover:bg-indigo-500 rotate-45 rounded-[2px] shadow-sm pointer-events-none transition-transform z-10"
          style={{ left: `${maxPos}%` }}
        />
      </div>
    </div>
  );
};

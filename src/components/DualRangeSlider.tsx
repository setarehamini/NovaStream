import React, { useState, useRef, useCallback } from 'react';

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
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);
  const [hoveredThumb, setHoveredThumb] = useState<'min' | 'max' | null>(null);

  // Precision check & step rounding
  const roundValue = useCallback(
    (val: number): number => {
      const steps = Math.round((val - min) / step);
      const stepped = min + steps * step;
      const stepStr = step.toString();
      const decimals = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
      const clamped = Math.max(min, Math.min(max, Number(stepped.toFixed(decimals))));
      return clamped;
    },
    [min, max, step]
  );

  const minPos = Math.max(0, Math.min(100, ((minValue - min) / (max - min)) * 100));
  const maxPos = Math.max(0, Math.min(100, ((maxValue - min) / (max - min)) * 100));

  // Compute value from clientX relative to track
  const getValueFromPointer = useCallback(
    (clientX: number): number => {
      if (!trackRef.current) return min;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawVal = min + ratio * (max - min);
      return roundValue(rawVal);
    },
    [min, max, roundValue]
  );

  // Pointer dragging handler for Min Thumb
  const handleMinPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setActiveThumb('min');

    const handlePointerMove = (ev: PointerEvent) => {
      const newVal = getValueFromPointer(ev.clientX);
      const clampedMin = Math.max(min, Math.min(newVal, maxValue - step));
      onChange(clampedMin, maxValue);
    };

    const handlePointerUp = (ev: PointerEvent) => {
      setActiveThumb(null);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  // Pointer dragging handler for Max Thumb
  const handleMaxPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setActiveThumb('max');

    const handlePointerMove = (ev: PointerEvent) => {
      const newVal = getValueFromPointer(ev.clientX);
      const clampedMax = Math.min(max, Math.max(newVal, minValue + step));
      onChange(minValue, clampedMax);
    };

    const handlePointerUp = (ev: PointerEvent) => {
      setActiveThumb(null);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  // Click & drag anywhere on track -> moves closest thumb and allows dragging immediately
  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const clickVal = getValueFromPointer(e.clientX);
    const distMin = Math.abs(clickVal - minValue);
    const distMax = Math.abs(clickVal - maxValue);

    const isCloserToMin = distMin < distMax || (distMin === distMax && clickVal <= minValue);

    if (isCloserToMin) {
      const clampedMin = Math.max(min, Math.min(clickVal, maxValue - step));
      onChange(clampedMin, maxValue);
      setActiveThumb('min');

      const handlePointerMove = (ev: PointerEvent) => {
        const newVal = getValueFromPointer(ev.clientX);
        const nextMin = Math.max(min, Math.min(newVal, maxValue - step));
        onChange(nextMin, maxValue);
      };

      const handlePointerUp = () => {
        setActiveThumb(null);
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    } else {
      const clampedMax = Math.min(max, Math.max(clickVal, minValue + step));
      onChange(minValue, clampedMax);
      setActiveThumb('max');

      const handlePointerMove = (ev: PointerEvent) => {
        const newVal = getValueFromPointer(ev.clientX);
        const nextMax = Math.min(max, Math.max(newVal, minValue + step));
        onChange(minValue, nextMax);
      };

      const handlePointerUp = () => {
        setActiveThumb(null);
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    }
  };

  // Keyboard navigation for Min Thumb
  const handleMinKeyDown = (e: React.KeyboardEvent) => {
    let nextMin = minValue;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      nextMin = Math.max(min, minValue - step);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      nextMin = Math.min(maxValue - step, minValue + step);
    } else if (e.key === 'Home') {
      nextMin = min;
    } else if (e.key === 'End') {
      nextMin = maxValue - step;
    } else {
      return;
    }
    e.preventDefault();
    onChange(roundValue(nextMin), maxValue);
  };

  // Keyboard navigation for Max Thumb
  const handleMaxKeyDown = (e: React.KeyboardEvent) => {
    let nextMax = maxValue;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      nextMax = Math.max(minValue + step, maxValue - step);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      nextMax = Math.min(max, maxValue + step);
    } else if (e.key === 'Home') {
      nextMax = minValue + step;
    } else if (e.key === 'End') {
      nextMax = max;
    } else {
      return;
    }
    e.preventDefault();
    onChange(minValue, roundValue(nextMax));
  };

  return (
    <div className="space-y-3 select-none py-1.5">
      {/* Top Header: Label & Selected Range Display */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
        {isRtl ? (
          <>
            <span
              dir="ltr"
              className="px-2.5 py-0.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-bold text-xs"
            >
              {formatValue(minValue)} - {formatValue(maxValue)}
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
            <span
              dir="ltr"
              className="px-2.5 py-0.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-bold text-xs"
            >
              {formatValue(minValue)} - {formatValue(maxValue)}
            </span>
          </>
        )}
      </div>

      {/* Slider Container with LTR coordinates */}
      <div
        dir="ltr"
        className="relative w-full h-8 flex items-center cursor-pointer touch-none"
        onPointerDown={handleTrackPointerDown}
      >
        {/* Visual Track Ref Area */}
        <div
          ref={trackRef}
          className={`relative w-full h-2 rounded-full overflow-hidden transition-colors ${
            theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'
          }`}
        >
          {/* Active Range Highlight */}
          <div
            className="absolute top-0 bottom-0 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 rounded-full"
            style={{
              left: `${minPos}%`,
              width: `${Math.max(0, maxPos - minPos)}%`,
            }}
          />
        </div>

        {/* Min Thumb */}
        <div
          role="slider"
          tabIndex={0}
          aria-label={`${label} Minimum`}
          aria-valuemin={min}
          aria-valuemax={maxValue - step}
          aria-valuenow={minValue}
          aria-valuetext={formatValue(minValue)}
          onPointerDown={handleMinPointerDown}
          onMouseEnter={() => setHoveredThumb('min')}
          onMouseLeave={() => setHoveredThumb(null)}
          onKeyDown={handleMinKeyDown}
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 flex items-center justify-center cursor-grab active:cursor-grabbing focus:outline-hidden transition-transform ${
            activeThumb === 'min' ? 'z-30 scale-110' : 'z-20 hover:scale-105'
          }`}
          style={{ left: `${minPos}%` }}
        >
          {/* Visual Diamond */}
          <div
            className={`w-4 h-4 bg-indigo-600 rotate-45 rounded-[2px] border-2 shadow-md transition-colors ${
              theme === 'dark' ? 'border-white' : 'border-slate-900'
            } ${activeThumb === 'min' || hoveredThumb === 'min' ? 'bg-indigo-500 ring-4 ring-indigo-500/25' : ''}`}
          />

          {/* Floating Tooltip */}
          {(activeThumb === 'min' || hoveredThumb === 'min') && (
            <div className="absolute -top-7 px-1.5 py-0.5 rounded bg-slate-900 text-white border border-slate-700 text-[10px] font-bold whitespace-nowrap shadow-lg pointer-events-none -translate-x-1/2 left-1/2 animate-in fade-in zoom-in-95 duration-150">
              {formatValue(minValue)}
            </div>
          )}
        </div>

        {/* Max Thumb */}
        <div
          role="slider"
          tabIndex={0}
          aria-label={`${label} Maximum`}
          aria-valuemin={minValue + step}
          aria-valuemax={max}
          aria-valuenow={maxValue}
          aria-valuetext={formatValue(maxValue)}
          onPointerDown={handleMaxPointerDown}
          onMouseEnter={() => setHoveredThumb('max')}
          onMouseLeave={() => setHoveredThumb(null)}
          onKeyDown={handleMaxKeyDown}
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 flex items-center justify-center cursor-grab active:cursor-grabbing focus:outline-hidden transition-transform ${
            activeThumb === 'max' ? 'z-30 scale-110' : 'z-20 hover:scale-105'
          }`}
          style={{ left: `${maxPos}%` }}
        >
          {/* Visual Diamond */}
          <div
            className={`w-4 h-4 bg-indigo-600 rotate-45 rounded-[2px] border-2 shadow-md transition-colors ${
              theme === 'dark' ? 'border-white' : 'border-slate-900'
            } ${activeThumb === 'max' || hoveredThumb === 'max' ? 'bg-indigo-500 ring-4 ring-indigo-500/25' : ''}`}
          />

          {/* Floating Tooltip */}
          {(activeThumb === 'max' || hoveredThumb === 'max') && (
            <div className="absolute -top-7 px-1.5 py-0.5 rounded bg-slate-900 text-white border border-slate-700 text-[10px] font-bold whitespace-nowrap shadow-lg pointer-events-none -translate-x-1/2 left-1/2 animate-in fade-in zoom-in-95 duration-150">
              {formatValue(maxValue)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

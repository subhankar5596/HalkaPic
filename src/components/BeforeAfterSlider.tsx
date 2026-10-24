import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Columns, SplitSquareVertical, ZoomIn } from 'lucide-react';
import { formatBytes } from '../utils/formatters';

interface BeforeAfterSliderProps {
  originalUrl: string;
  compressedUrl: string;
  originalSize: number;
  compressedSize: number;
  originalDimensions: string;
  compressedDimensions: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  originalUrl,
  compressedUrl,
  originalSize,
  compressedSize,
  originalDimensions,
  compressedDimensions,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(rect.width, x));
    const percentage = (clampedX / rect.width) * 100;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="space-y-3">
      {/* View Mode Toggle Controls */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Visual Quality Comparison
        </span>
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-colors ${
              viewMode === 'slider'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Slider</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-colors ${
              viewMode === 'side-by-side'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>
      </div>

      {viewMode === 'slider' ? (
        /* Interactive Split Slider */
        <div
          ref={containerRef}
          className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 select-none bg-slate-900 cursor-ew-resize shadow-inner"
          onMouseDown={(e) => {
            setIsDragging(true);
            handleMove(e.clientX);
          }}
          onTouchStart={(e) => {
            setIsDragging(true);
            handleMove(e.touches[0].clientX);
          }}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => setIsDragging(false)}
        >
          {/* Compressed Image (Background) */}
          <img
            src={compressedUrl}
            alt="Compressed result"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />

          {/* Original Image (Foreground clipped by slider) */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={originalUrl}
              alt="Original photo"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none max-w-none"
              style={{
                width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                height: '100%',
              }}
            />
          </div>

          {/* Divider Line & Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-700 shadow-lg border border-slate-200 flex items-center justify-center pointer-events-auto">
              <svg
                className="w-4 h-4 text-slate-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
                <polyline points="9 18 3 12 9 6" />
              </svg>
            </div>
          </div>

          {/* Labels on top */}
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold shadow-md">
              Original: {formatBytes(originalSize)}
            </span>
          </div>
          <div className="absolute top-3 right-3 z-10 pointer-events-none">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-600/90 backdrop-blur-xs text-white text-[11px] font-bold shadow-md">
              Compressed: {formatBytes(compressedSize)}
            </span>
          </div>

          {/* Drag instruction overlay for mobile */}
          <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
            <span className="text-[10px] text-white/80 bg-black/50 px-2 py-0.5 rounded-full font-medium">
              Drag slider left & right to compare quality
            </span>
          </div>
        </div>
      ) : (
        /* Side by Side View */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Original Card */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900 flex flex-col">
            <div className="p-2 bg-slate-800 text-white flex items-center justify-between text-xs font-semibold">
              <span>Original Photo</span>
              <span className="font-mono text-slate-300">{formatBytes(originalSize)}</span>
            </div>
            <div className="relative h-60 w-full">
              <img
                src={originalUrl}
                alt="Original"
                className="w-full h-full object-contain p-2"
              />
            </div>
            <div className="px-3 py-1.5 bg-slate-800/80 text-[11px] text-slate-300 border-t border-slate-700">
              Resolution: <span className="font-mono">{originalDimensions}</span>
            </div>
          </div>

          {/* Compressed Card */}
          <div className="border border-emerald-500/50 rounded-xl overflow-hidden bg-slate-900 flex flex-col">
            <div className="p-2 bg-emerald-950 text-emerald-200 flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Compressed Photo
              </span>
              <span className="font-mono text-emerald-300 font-bold">
                {formatBytes(compressedSize)}
              </span>
            </div>
            <div className="relative h-60 w-full">
              <img
                src={compressedUrl}
                alt="Compressed"
                className="w-full h-full object-contain p-2"
              />
            </div>
            <div className="px-3 py-1.5 bg-emerald-950/80 text-[11px] text-emerald-300 border-t border-emerald-800/50">
              Resolution: <span className="font-mono">{compressedDimensions}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

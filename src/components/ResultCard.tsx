import React, { useEffect } from 'react';
import {
  Download,
  RotateCcw,
  CheckCircle2,
  TrendingDown,
  HardDrive,
  Maximize2,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  Share2,
} from 'lucide-react';
import { CompressionResult, UploadedImageInfo } from '../types';
import { formatBytes, formatDimensions, generateDownloadFilename } from '../utils/formatters';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import confetti from 'canvas-confetti';

interface ResultCardProps {
  originalImage: UploadedImageInfo;
  result: CompressionResult;
  onCompressAnother: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  originalImage,
  result,
  onCompressAnother,
}) => {
  // Fire gentle celebratory confetti on completion
  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#10b981', '#38bdf8', '#fbbf24'],
      });
    } catch (e) {
      // Confetti fallback safely ignored
    }
  }, []);

  const downloadFilename = generateDownloadFilename(
    originalImage.name,
    result.targetKB,
    result.extension
  );

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = result.objectUrl;
    a.download = downloadFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const savedBytes = Math.max(0, originalImage.size - result.size);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-5 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
      {/* Top Banner: Success & Percentage Saved */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Photo Compressed!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Ready to download or compare visual quality.
            </p>
          </div>
        </div>

        {/* Saved % Badge */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 px-4 py-2 rounded-2xl self-start sm:self-auto shadow-xs">
          <TrendingDown className="w-5 h-5 text-emerald-600" />
          <div className="text-left">
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Saved
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-700 font-mono leading-none">
              {result.savedPercentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Metric Cards: Original vs Compressed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-center">
        {/* Original */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 text-center sm:text-left">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Original Photo
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-700 font-mono">
            {formatBytes(originalImage.size)}
          </div>
          <div className="mt-1 flex items-center justify-center sm:justify-start gap-1 text-xs text-slate-500">
            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDimensions(originalImage.width, originalImage.height)}</span>
          </div>
        </div>

        {/* Transition indicator arrow */}
        <div className="flex flex-col items-center justify-center py-1 md:py-0">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shadow-xs">
            <span className="hidden md:inline">→</span>
            <span className="inline md:hidden">↓</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 mt-1">
            -{formatBytes(savedBytes)}
          </span>
        </div>

        {/* Compressed */}
        <div className="bg-emerald-50/70 rounded-2xl p-4 sm:p-5 border border-emerald-200 text-center sm:text-left ring-2 ring-emerald-500/10">
          <div className="flex items-center justify-center sm:justify-between mb-1">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Compressed Photo
            </span>
            <span className="hidden sm:inline-flex text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-1.5 py-0.5 rounded">
              {result.extension.toUpperCase()}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
            {formatBytes(result.size)}
          </div>
          <div className="mt-1 flex items-center justify-center sm:justify-start gap-1 text-xs text-emerald-800 font-medium">
            <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{formatDimensions(result.width, result.height)}</span>
          </div>
        </div>
      </div>

      {/* Quality Notice / Status Alert */}
      {result.warningNotice && (
        <div className="rounded-xl bg-amber-50 border border-amber-200/90 p-4 flex items-start gap-3 text-xs sm:text-sm text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Notice regarding target size:</p>
            <p className="text-amber-800">{result.warningNotice}</p>
          </div>
        </div>
      )}

      {result.statusNote && !result.warningNotice && (
        <div className="rounded-xl bg-blue-50/90 border border-blue-200/80 p-3.5 flex items-start gap-2.5 text-xs text-blue-900">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>{result.statusNote}</div>
        </div>
      )}

      {/* Before / After Preview */}
      <BeforeAfterSlider
        originalUrl={originalImage.objectUrl}
        compressedUrl={result.objectUrl}
        originalSize={originalImage.size}
        compressedSize={result.size}
        originalDimensions={formatDimensions(originalImage.width, originalImage.height)}
        compressedDimensions={formatDimensions(result.width, result.height)}
      />

      {/* Action Buttons: Download & Compress Another */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Main CTA: Download */}
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-base sm:text-lg shadow-lg shadow-blue-600/30 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20"
        >
          <Download className="w-5 h-5 stroke-[2.5]" />
          <span>Download Image</span>
          <span className="text-xs bg-blue-500/50 px-2 py-0.5 rounded-md font-mono font-medium">
            {formatBytes(result.size)}
          </span>
        </button>

        {/* Secondary: Compress Another */}
        <button
          onClick={onCompressAnother}
          className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200/80 active:scale-[0.98] text-slate-800 font-bold text-base transition-all focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <RotateCcw className="w-5 h-5 text-slate-600" />
          <span>Compress Another Image</span>
        </button>
      </div>

      {/* Technical Summary Footer (Transparency & Performance) */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Processed in {result.durationMs}ms</span>
          <span>•</span>
          <span>Quality: {result.qualityUsed}%</span>
          <span>•</span>
          <span>Scale: {result.scaleUsed}%</span>
        </div>
        <div className="font-mono text-slate-500">
          Filename: {downloadFilename}
        </div>
      </div>
    </div>
  );
};

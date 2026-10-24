import React from 'react';
import { CompressionProgressState } from '../types';
import { Cpu, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

interface CompressProgressProps {
  progress: CompressionProgressState;
  targetKB: number;
}

export const CompressProgress: React.FC<CompressProgressProps> = ({ progress, targetKB }) => {
  const percentage = progress.maxAttempts > 0
    ? Math.min(100, Math.round((progress.currentAttempt / progress.maxAttempts) * 100))
    : 10;

  return (
    <div className="bg-white rounded-2xl border border-blue-200/90 shadow-lg shadow-blue-500/5 p-6 sm:p-8 text-center space-y-5 animate-in fade-in">
      <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <div
          className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"
          style={{ animationDuration: '0.8s' }}
        />
        <Cpu className="w-6 h-6 text-blue-600" />
      </div>

      <div className="space-y-1.5">
        <h3 className="font-bold text-lg text-slate-900">
          Smart Compressing Photo...
        </h3>
        <p className="text-sm font-medium text-blue-700 min-h-[20px] font-mono">
          {progress.stepMessage || 'Optimizing image canvas and quality...'}
        </p>
      </div>

      {/* Real-time iterative metric display */}
      <div className="max-w-xs mx-auto bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs space-y-1.5">
        <div className="flex justify-between items-center text-slate-600 font-medium">
          <span>Target Size:</span>
          <span className="font-bold font-mono text-slate-900">{targetKB} KB</span>
        </div>
        {progress.currentSizeKB !== undefined && (
          <div className="flex justify-between items-center text-slate-600 font-medium">
            <span>Current Trial:</span>
            <span className="font-bold font-mono text-blue-600">
              {progress.currentSizeKB} KB
            </span>
          </div>
        )}
        <div className="flex justify-between items-center text-slate-500 text-[11px]">
          <span>Optimization Pass:</span>
          <span className="font-mono">
            {progress.currentAttempt} / {progress.maxAttempts}
          </span>
        </div>

        {/* Progress indicator bar */}
        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mt-2">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-200"
            style={{ width: `${Math.max(15, percentage)}%` }}
          />
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 text-xs text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Processing locally in your browser memory</span>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Target, AlertTriangle, Check, Info, Sliders, Sparkles } from 'lucide-react';
import { PresetTargetKB } from '../types';
import { formatBytes } from '../utils/formatters';

interface TargetSelectorProps {
  originalSizeBytes: number;
  selectedTargetKB: number;
  onTargetChange: (targetKB: number) => void;
  disabled?: boolean;
}

const PRESETS: { value: PresetTargetKB; label: string; desc: string }[] = [
  { value: 20, label: '20 KB', desc: 'Govt / SSC / UPSC' },
  { value: 50, label: '50 KB', desc: 'Passport & Visa' },
  { value: 100, label: '100 KB', desc: 'Job Portals / CV' },
  { value: 200, label: '200 KB', desc: 'Email / Web' },
  { value: 500, label: '500 KB', desc: 'High Quality' },
];

export const TargetSelector: React.FC<TargetSelectorProps> = ({
  originalSizeBytes,
  selectedTargetKB,
  onTargetChange,
  disabled = false,
}) => {
  const [isCustom, setIsCustom] = useState<boolean>(() => {
    return !PRESETS.some((p) => p.value === selectedTargetKB);
  });
  const [customInputValue, setCustomInputValue] = useState<string>(() =>
    isCustom ? selectedTargetKB.toString() : '75'
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const originalKB = Math.round(originalSizeBytes / 1024);

  // Is target dangerously small compared to original size?
  // E.g. less than 1.5% of original or < 25KB for an image > 2MB
  const isSevereCompression =
    selectedTargetKB <= 30 && originalSizeBytes > 1.5 * 1024 * 1024;

  const isTargetLargerThanOriginal = selectedTargetKB >= originalKB;

  const handlePresetSelect = (preset: PresetTargetKB) => {
    setIsCustom(false);
    setValidationError(null);
    onTargetChange(preset);
  };

  const handleCustomInput = (val: string) => {
    setCustomInputValue(val);
    const num = parseInt(val, 10);

    if (val.trim() === '') {
      setValidationError('Please enter a target size in KB.');
      return;
    }

    if (isNaN(num) || num <= 0) {
      setValidationError('Target size must be a positive number greater than 0.');
      return;
    }

    if (num < 5) {
      setValidationError('Minimum recommended target size is 5 KB.');
      return;
    }

    if (num > 50000) {
      setValidationError('Target size cannot exceed 50 MB (50,000 KB).');
      return;
    }

    setValidationError(null);
    onTargetChange(num);
  };

  const selectQuickCustom = (val: number) => {
    setIsCustom(true);
    setCustomInputValue(val.toString());
    setValidationError(null);
    onTargetChange(val);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span>Select Target File Size</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Choose a common target size or type any custom KB.
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
          Current photo: <span className="text-slate-900 font-mono">{formatBytes(originalSizeBytes)}</span>
        </div>
      </div>

      {/* Preset Pills */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
          Popular Target Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {PRESETS.map((preset) => {
            const isSelected = !isCustom && selectedTargetKB === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                disabled={disabled}
                onClick={() => handlePresetSelect(preset.value)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all min-h-[72px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/90 text-blue-900 shadow-xs ring-2 ring-blue-600/20'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-extrabold text-base sm:text-lg tracking-tight font-mono">
                  {preset.label}
                </div>
                <div
                  className={`text-[10px] font-medium leading-tight mt-0.5 ${
                    isSelected ? 'text-blue-700' : 'text-slate-400'
                  }`}
                >
                  {preset.desc}
                </div>
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Size Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="custom-kb-input"
            className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Or Enter Custom Size</span>
          </label>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                id="custom-kb-input"
                type="number"
                min="5"
                max="50000"
                step="1"
                placeholder="e.g. 75, 150, 300"
                disabled={disabled}
                value={isCustom ? customInputValue : ''}
                onFocus={() => {
                  if (!isCustom) {
                    setIsCustom(true);
                    handleCustomInput(customInputValue || '75');
                  }
                }}
                onChange={(e) => {
                  if (!isCustom) setIsCustom(true);
                  handleCustomInput(e.target.value);
                }}
                className={`w-full pl-4 pr-12 py-3 rounded-xl border font-mono text-base font-bold text-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                  validationError
                    ? 'border-red-400 focus:ring-red-300 bg-red-50/30'
                    : isCustom
                    ? 'border-blue-600 focus:ring-blue-400 bg-blue-50/20'
                    : 'border-slate-300 focus:ring-blue-400 hover:border-slate-400'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                KB
              </span>
            </div>

            {/* Quick custom suggestions */}
            <div className="hidden sm:flex items-center gap-1.5">
              {[75, 150, 300].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectQuickCustom(quick)}
                  className={`px-3 py-2 text-xs font-bold rounded-lg border transition-colors ${
                    isCustom && selectedTargetKB === quick
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {quick} KB
                </button>
              ))}
            </div>
          </div>

          {/* Validation Error Message */}
          {validationError && (
            <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5 animate-in fade-in">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{validationError}</span>
            </p>
          )}

          {/* Mobile quick custom buttons */}
          <div className="flex sm:hidden items-center gap-2 pt-1">
            <span className="text-xs text-slate-500 font-medium">Quick suggestions:</span>
            {[75, 150, 300].map((quick) => (
              <button
                key={quick}
                type="button"
                disabled={disabled}
                onClick={() => selectQuickCustom(quick)}
                className={`px-2.5 py-1 text-xs font-bold rounded-md border transition-colors ${
                  isCustom && selectedTargetKB === quick
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                {quick} KB
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Target larger than original hint */}
      {isTargetLargerThanOriginal && (
        <div className="rounded-xl bg-blue-50/80 border border-blue-200/80 p-3.5 flex items-start gap-2.5 text-xs text-blue-900 animate-in fade-in">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Good news:</span> Your photo is already{' '}
            <span className="font-mono font-bold">{formatBytes(originalSizeBytes)}</span>, which is
            smaller than <span className="font-mono font-bold">{selectedTargetKB} KB</span>.
            HalkaPic will optimize it for maximum visual quality.
          </div>
        </div>
      )}

      {/* Quality Protection Warning Notice */}
      {isSevereCompression && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 flex items-start gap-2.5 text-xs text-amber-900 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              “This target size may significantly reduce image quality.”
            </p>
            <p className="text-amber-800">
              Fitting a <span className="font-mono font-semibold">{formatBytes(originalSizeBytes)}</span> photo
              into <span className="font-mono font-semibold">{selectedTargetKB} KB</span> requires aggressive compression and downscaling.
              You can still proceed, or pick <strong>50 KB</strong> or <strong>100 KB</strong> if you need sharper clarity.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

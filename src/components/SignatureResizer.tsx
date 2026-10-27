import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileCheck2,
  HardDrive,
  Maximize2,
  Lock,
  Unlock,
  Download,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Sparkles,
  PenTool,
} from 'lucide-react';
import { extractImageInfo } from '../utils/imageCompressor';
import { UploadedImageInfo } from '../types';
import { formatBytes, formatDimensions } from '../utils/formatters';
import { resizeSignature, SignatureResizeResult } from '../utils/signatureEngine';
import confetti from 'canvas-confetti';

export const SignatureResizer: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<UploadedImageInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dimensions & Aspect Ratio
  const [width, setWidth] = useState<number>(140);
  const [height, setHeight] = useState<number>(60);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(140 / 60);

  // Target KB
  const [targetKB, setTargetKB] = useState<number>(20);
  const [customKB, setCustomKB] = useState<string>('20');
  const [cleanWhiteBg, setCleanWhiteBg] = useState<boolean>(true);

  // Result & State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<SignatureResizeResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const PRESET_KB = [10, 20, 30, 50, 100];
  const EXAM_PRESETS = [
    { label: 'UPSC / SSC (140×60)', w: 140, h: 60, kb: 20 },
    { label: 'IBPS Exam (140×60)', w: 140, h: 60, kb: 20 },
    { label: 'Passport Seva (200×200)', w: 200, h: 200, kb: 30 },
    { label: 'High Detail (300×120)', w: 300, h: 120, kb: 50 },
  ];

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    try {
      const info = await extractImageInfo(file);
      setSelectedImage(info);
      setResult(null);

      // Default dimensions: adapt to uploaded aspect ratio or exam standard
      const ratio = info.width / info.height;
      setAspectRatio(ratio);

      // Standard signature default: 140 width, height proportional
      const initW = 140;
      const initH = Math.max(30, Math.round(initW / ratio));
      setWidth(initW);
      setHeight(initH);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to read signature image.';
      setErrorMessage(msg);
    }
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspectRatio && val > 0 && aspectRatio > 0) {
      setHeight(Math.max(10, Math.round(val / aspectRatio)));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspectRatio && val > 0 && aspectRatio > 0) {
      setWidth(Math.max(10, Math.round(val * aspectRatio)));
    }
  };

  const applyExamPreset = (preset: { w: number; h: number; kb: number }) => {
    setWidth(preset.w);
    setHeight(preset.h);
    setTargetKB(preset.kb);
    setCustomKB(preset.kb.toString());
    setLockAspectRatio(false); // allow preset exact dimensions
  };

  const handleExecuteResize = async () => {
    if (!selectedImage) return;

    if (width <= 0 || height <= 0) {
      setErrorMessage('Width and height must be greater than 0 pixels.');
      return;
    }

    if (targetKB <= 0) {
      setErrorMessage('Target file size must be greater than 0 KB.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await resizeSignature(selectedImage.file, {
        width,
        height,
        targetKB,
        format: 'image/jpeg',
        cleanWhiteBackground: cleanWhiteBg,
      });

      setResult(res);
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#10b981'],
        });
      } catch (e) {
        // Safe fallback
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to resize signature.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (selectedImage?.objectUrl) URL.revokeObjectURL(selectedImage.objectUrl);
    if (result?.objectUrl) URL.revokeObjectURL(result.objectUrl);
    setSelectedImage(null);
    setResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.objectUrl;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
        className="hidden"
        id="signature-file-input"
      />

      {/* Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3 text-sm animate-in fade-in"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {!selectedImage ? (
        /* Upload Area */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`relative w-full rounded-3xl border-2 border-dashed transition-all duration-200 cursor-pointer text-center p-8 sm:p-12 ${
            isDragging
              ? 'border-blue-600 bg-blue-50/80 scale-[1.01] shadow-xl shadow-blue-500/10'
              : 'border-slate-300 hover:border-blue-500 bg-white hover:bg-slate-50/70 shadow-sm hover:shadow-md'
          }`}
        >
          <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PenTool className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-base shadow-md shadow-blue-600/25 hover:bg-blue-700 active:scale-95 transition-all">
                Upload Signature Photo
              </span>
              <p className="text-sm text-slate-500 font-medium pt-2">
                or Drag & Drop Signature Image Here
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-600">
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">JPG</span>
              <span className="text-slate-300">•</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">PNG</span>
              <span className="text-slate-300">•</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">WebP</span>
            </div>

            <div className="pt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200/80">
              <HardDrive className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>🔒 100% In-Browser. Signature never leaves your device.</span>
            </div>
          </div>
        </div>
      ) : result ? (
        /* Result View */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Signature Resized Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Compliant dimensions and file size ready for upload.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl self-start sm:self-auto">
              <Maximize2 className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Final Size
                </div>
                <div className="text-lg font-black text-emerald-700 font-mono leading-none">
                  {formatBytes(result.size)}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Box */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Signature Preview ({result.width} × {result.height} px)
            </div>
            <div className="max-w-md p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center">
              <img
                src={result.objectUrl}
                alt="Resized Signature"
                className="max-h-36 max-w-full object-contain"
              />
            </div>
          </div>

          {/* Comparison Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Original Dimensions:</span>
              <span className="font-bold text-slate-800 font-mono">
                {formatDimensions(selectedImage.width, selectedImage.height)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Final Dimensions:</span>
              <span className="font-bold text-emerald-700 font-mono">
                {formatDimensions(result.width, result.height)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Original Size:</span>
              <span className="font-bold text-slate-800 font-mono">
                {formatBytes(selectedImage.size)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Final File Size:</span>
              <span className="font-bold text-emerald-700 font-mono">
                {formatBytes(result.size)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-base sm:text-lg shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>Download Resized Signature</span>
              <span className="text-xs bg-blue-500/50 px-2 py-0.5 rounded-md font-mono">
                {formatBytes(result.size)}
              </span>
            </button>

            <button
              onClick={() => setResult(null)}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base transition-all cursor-pointer"
            >
              <Sliders className="w-5 h-5 text-slate-600" />
              <span>Adjust Dimensions</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-sm font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>New Photo</span>
            </button>
          </div>
        </div>
      ) : (
        /* Configuration Workspace */
        <div className="space-y-6">
          {/* Selected File Summary */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={selectedImage.objectUrl}
                  alt={selectedImage.name}
                  className="max-h-full max-w-full object-contain p-1"
                />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 text-sm sm:text-base truncate">
                  {selectedImage.name}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                  <span>{formatBytes(selectedImage.size)}</span>
                  <span>•</span>
                  <span>{formatDimensions(selectedImage.width, selectedImage.height)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
              Change
            </button>
          </div>

          {/* Quick Exam Preset Buttons */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Quick Application Form Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {EXAM_PRESETS.map((ep, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyExamPreset(ep)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    width === ep.w && height === ep.h && targetKB === ep.kb
                      ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">{ep.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                    Max: {ep.kb} KB
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Dimension & File Size Settings */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5">
            <h3 className="font-bold text-base sm:text-lg text-slate-900 pb-2 border-b border-slate-100">
              Signature Dimension & File Size Settings
            </h3>

            {/* Width & Height in Pixels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Width (Pixels)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    value={width}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    PX
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Height (Pixels)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    value={height}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    PX
                  </span>
                </div>
              </div>
            </div>

            {/* Maintain Aspect Ratio Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                {lockAspectRatio ? (
                  <Lock className="w-4 h-4 text-blue-600" />
                ) : (
                  <Unlock className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-xs font-bold text-slate-800">
                  Maintain Aspect Ratio
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  (Prevents distortion of signature handwriting)
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLockAspectRatio(!lockAspectRatio);
                  if (!lockAspectRatio && width > 0 && height > 0) {
                    setAspectRatio(width / height);
                  }
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  lockAspectRatio
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {lockAspectRatio ? 'Locked' : 'Unlocked'}
              </button>
            </div>

            {/* Target File Size in KB */}
            <div className="space-y-2.5 pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Target Maximum File Size (KB)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_KB.map((kb) => (
                  <button
                    key={kb}
                    type="button"
                    onClick={() => {
                      setTargetKB(kb);
                      setCustomKB(kb.toString());
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono border transition-all ${
                      targetKB === kb
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {kb} KB
                  </button>
                ))}

                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-xs text-slate-500 font-medium">Custom:</span>
                  <div className="relative w-24">
                    <input
                      type="number"
                      min="5"
                      max="1000"
                      value={customKB}
                      onChange={(e) => {
                        setCustomKB(e.target.value);
                        const n = parseInt(e.target.value, 10);
                        if (n > 0) setTargetKB(n);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                      KB
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Clean White Background Option */}
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
              <input
                type="checkbox"
                id="white-bg-toggle"
                checked={cleanWhiteBg}
                onChange={(e) => setCleanWhiteBg(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="white-bg-toggle" className="cursor-pointer font-medium">
                Ensure pure white background (Removes dark edges and enhances scan contrast)
              </label>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleExecuteResize}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-3 py-4 sm:py-5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-lg sm:text-xl shadow-xl shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Resizing Signature...</span>
            ) : (
              <>
                <PenTool className="w-6 h-6 stroke-[2.2]" />
                <span>
                  Resize Signature to {width}×{height} px ({targetKB} KB)
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

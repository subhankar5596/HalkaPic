import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, ShieldCheck, AlertCircle, FileCheck2 } from 'lucide-react';
import { extractImageInfo } from '../utils/imageCompressor';
import { UploadedImageInfo } from '../types';

interface UploaderProps {
  onImageSelected: (info: UploadedImageInfo) => void;
  onError: (errorMessage: string) => void;
  disabled?: boolean;
}

export const Uploader: React.FC<UploaderProps> = ({
  onImageSelected,
  onError,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const processFile = async (file: File) => {
    setIsLoading(true);
    try {
      const info = await extractImageInfo(file);
      onImageSelected(info);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to read image. Please check the file.';
      onError(msg);
    } finally {
      setIsLoading(false);
      // Reset input value so re-selecting same file triggers onChange
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Allow pasting an image from clipboard (great for mobile screenshots & desktop copy-paste)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [disabled]);

  return (
    <div className="w-full">
      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isLoading}
        id="halkapic-file-input"
      />

      {/* Main Upload Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !isLoading && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        aria-label="Upload photo to compress"
        className={`relative w-full rounded-3xl border-2 border-dashed transition-all duration-200 cursor-pointer text-center p-8 sm:p-12 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 ${
          isDragging
            ? 'border-blue-600 bg-blue-50/80 scale-[1.01] shadow-xl shadow-blue-500/10'
            : 'border-slate-300 hover:border-blue-500 bg-white hover:bg-slate-50/70 shadow-sm hover:shadow-md'
        } ${isLoading ? 'opacity-70 pointer-events-none' : ''}`}
      >
        <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
          {/* Icon Badge */}
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-transform duration-200 ${
              isDragging
                ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/30'
                : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
            }`}
          >
            {isLoading ? (
              <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : isDragging ? (
              <FileCheck2 className="w-10 h-10 animate-bounce" />
            ) : (
              <UploadCloud className="w-10 h-10" />
            )}
          </div>

          {/* Action text */}
          <div className="space-y-1.5">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <span className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-base shadow-md shadow-blue-600/25 hover:bg-blue-700 active:scale-95 transition-all">
                {isLoading ? 'Processing Photo...' : 'Upload Photo'}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium pt-2">
              or <span className="text-blue-600 font-semibold underline decoration-blue-300">Drag & Drop Image Here</span>
            </p>
          </div>

          {/* Supported Formats */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-600">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">JPG</span>
            <span className="text-slate-300">•</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">JPEG</span>
            <span className="text-slate-300">•</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">PNG</span>
            <span className="text-slate-300">•</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">WebP</span>
          </div>

          {/* Privacy Guarantee Message */}
          <div className="pt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200/80">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>🔒 Your photos stay on your device. Never uploaded to any server.</span>
          </div>

          {/* Keyboard / clipboard tip */}
          <p className="text-[11px] text-slate-400">
            Tip: You can also paste an image with <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px]">Ctrl+V</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px]">⌘+V</kbd>
          </p>
        </div>
      </div>
    </div>
  );
};

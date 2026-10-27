import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Download,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  Info,
  Loader2,
  HardDrive,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';
import { compressPdfFile, CompressPdfResult, getPdfPageCount } from '../utils/pdfToolsEngine';
import confetti from 'canvas-confetti';

export const CompressPdf: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [profile, setProfile] = useState<'low' | 'medium' | 'high'>('medium');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [result, setResult] = useState<CompressPdfResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMessage('Please select a valid PDF file.');
      return;
    }

    try {
      const count = await getPdfPageCount(file);
      setSelectedFile(file);
      setPageCount(count);
      setResult(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not read PDF document.';
      setErrorMessage(msg);
    }
  };

  const handleCompress = async () => {
    if (!selectedFile) return;

    setIsCompressing(true);
    setErrorMessage(null);

    try {
      const res = await compressPdfFile(selectedFile, profile, (cur, total) => {
        setProgressText(`Optimizing page ${cur} of ${total}...`);
      });

      setResult(res);
      if (!res.cannotReduceFurther) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#2563eb', '#10b981'],
          });
        } catch (e) {
          // Safe fallback
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to compress PDF.';
      setErrorMessage(msg);
    } finally {
      setIsCompressing(false);
      setProgressText('');
    }
  };

  const handleReset = () => {
    if (result?.objectUrl && result.objectUrl !== selectedFile?.name) {
      URL.revokeObjectURL(result.objectUrl);
    }
    setSelectedFile(null);
    setPageCount(0);
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
        accept="application/pdf,.pdf"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
        className="hidden"
        id="compress-pdf-input"
      />

      {/* Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3 text-sm animate-in fade-in"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 font-bold text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {!selectedFile ? (
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
              <FileText className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-base shadow-md shadow-blue-600/25 hover:bg-blue-700 active:scale-95 transition-all">
                Select PDF File
              </span>
              <p className="text-sm text-slate-500 font-medium pt-2">
                or Drag & Drop PDF Document Here
              </p>
            </div>

            <div className="pt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200/80">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>🔒 100% Client-Side. Your PDF is processed locally without server upload.</span>
            </div>
          </div>
        </div>
      ) : result ? (
        /* Result Card */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {result.cannotReduceFurther ? 'Optimization Evaluated' : 'PDF Compressed Successfully!'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {result.cannotReduceFurther
                    ? 'Document is already optimal; original quality preserved.'
                    : `Reduced by ${result.savedPercentage}% without breaking text legibility.`}
                </p>
              </div>
            </div>

            {!result.cannotReduceFurther && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 px-4 py-2 rounded-2xl self-start sm:self-auto">
                <TrendingDown className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    Saved
                  </div>
                  <div className="text-lg font-black text-emerald-700 font-mono leading-none">
                    {result.savedPercentage}%
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Size Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Original PDF
              </span>
              <div className="text-2xl font-extrabold text-slate-700 font-mono">
                {formatBytes(result.originalSize)}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                {result.pageCount} Pages
              </span>
            </div>

            <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 ring-2 ring-emerald-500/10">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                Optimized PDF
              </span>
              <div className="text-2xl font-black text-emerald-700 font-mono">
                {formatBytes(result.compressedSize)}
              </div>
              <span className="text-xs text-emerald-800 font-medium mt-1 block">
                Ready to download
              </span>
            </div>
          </div>

          {/* Status Note or Explanation */}
          {result.statusNote && (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-900 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>{result.statusNote}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-base sm:text-lg shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>Download Compressed PDF</span>
              <span className="text-xs bg-blue-500/50 px-2 py-0.5 rounded-md font-mono">
                {formatBytes(result.compressedSize)}
              </span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base transition-all cursor-pointer"
            >
              <RotateCcw className="w-5 h-5 text-slate-600" />
              <span>Compress Another PDF</span>
            </button>
          </div>
        </div>
      ) : (
        /* Configuration Workspace */
        <div className="space-y-6">
          {/* File Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-8 h-8" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 text-base truncate" title={selectedFile.name}>
                  {selectedFile.name}
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  {formatBytes(selectedFile.size)} • {pageCount} Pages
                </div>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              Change
            </button>
          </div>

          {/* Compression Level Selector */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Compression Level
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setProfile('low')}
                disabled={isCompressing}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  profile === 'low'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="font-bold text-sm">Low Compression</div>
                <div className="text-xs text-slate-500 mt-1">
                  Highest visual clarity. Best for portfolios & photo-heavy documents.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProfile('medium')}
                disabled={isCompressing}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  profile === 'medium'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Medium Compression</span>
                  <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.2 rounded">
                    Recommended
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Ideal balance of small file size and sharp readable text.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProfile('high')}
                disabled={isCompressing}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  profile === 'high'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="font-bold text-sm">High Compression</div>
                <div className="text-xs text-slate-500 mt-1">
                  Maximum reduction. Best for meeting strict 1MB/2MB email limits.
                </div>
              </button>
            </div>
          </div>

          {/* Progress or Compress Button */}
          {isCompressing ? (
            <div className="bg-white rounded-2xl border border-blue-200 p-6 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-base">Compressing PDF...</h4>
                <p className="text-xs text-blue-700 font-mono">{progressText || 'Optimizing document...'}</p>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleCompress}
              className="w-full flex items-center justify-center gap-3 py-4 sm:py-5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-lg sm:text-xl shadow-xl shadow-blue-600/25 transition-all cursor-pointer"
            >
              <Zap className="w-6 h-6 fill-white" />
              <span>Compress PDF ({profile.toUpperCase()})</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

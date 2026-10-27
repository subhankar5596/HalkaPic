import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Download,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Scissors,
  Loader2,
  FolderArchive,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';
import {
  getPdfPageCount,
  parsePageRanges,
  extractPdfPages,
  splitAllPdfPagesToZip,
  SplitPdfResult,
} from '../utils/pdfToolsEngine';
import confetti from 'canvas-confetti';

export const SplitPdf: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [splitMode, setSplitMode] = useState<'range' | 'all'>('range');
  const [rangeInput, setRangeInput] = useState<string>('1');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [result, setResult] = useState<SplitPdfResult | null>(null);
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
      setTotalPages(count);
      setResult(null);
      // Sensible initial range
      setRangeInput(count > 1 ? `1-${Math.min(3, count)}` : '1');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not read PDF document.';
      setErrorMessage(msg);
    }
  };

  const handleExecuteSplit = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      let res: SplitPdfResult;

      if (splitMode === 'range') {
        const indices = parsePageRanges(rangeInput, totalPages);
        res = await extractPdfPages(selectedFile, indices);
      } else {
        res = await splitAllPdfPagesToZip(selectedFile, (cur, total) => {
          setProgressText(`Extracting page ${cur} of ${total}...`);
        });
      }

      setResult(res);
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to split PDF.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  const handleReset = () => {
    if (result?.objectUrl) URL.revokeObjectURL(result.objectUrl);
    setSelectedFile(null);
    setTotalPages(0);
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
        id="split-pdf-input"
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
              <Scissors className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-base shadow-md shadow-blue-600/25 hover:bg-blue-700 active:scale-95 transition-all">
                Select PDF to Split
              </span>
              <p className="text-sm text-slate-500 font-medium pt-2">
                or Drag & Drop Multi-Page PDF Document
              </p>
            </div>

            <div className="pt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200/80">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Client-Side. Extracts pages privately inside your browser memory.</span>
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
                  {result.isZip ? 'PDF Split into All Pages!' : 'Pages Extracted Successfully!'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {result.isZip
                    ? `All ${result.pageCount} pages split into individual PDF files.`
                    : `${result.pageCount} pages combined into your new extracted PDF.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl self-start sm:self-auto">
              <FileText className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Output Size
                </div>
                <div className="text-lg font-black text-emerald-700 font-mono leading-none">
                  {formatBytes(result.size)}
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Original Document:</span>
              <span className="font-bold text-slate-800 font-mono">{totalPages} Pages</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Output Pages:</span>
              <span className="font-bold text-emerald-700 font-mono">{result.pageCount} Pages</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Format:</span>
              <span className="font-bold text-slate-800 uppercase font-mono">
                {result.isZip ? 'ZIP Archive' : 'PDF Document'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Status:</span>
              <span className="font-bold text-emerald-600">Ready to Download</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-base sm:text-lg shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              {result.isZip ? (
                <FolderArchive className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <Download className="w-5 h-5 stroke-[2.5]" />
              )}
              <span>{result.isZip ? 'Download All Pages (ZIP)' : 'Download Extracted PDF'}</span>
              <span className="text-xs bg-blue-500/50 px-2 py-0.5 rounded-md font-mono">
                {formatBytes(result.size)}
              </span>
            </button>

            <button
              onClick={() => setResult(null)}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base transition-all cursor-pointer"
            >
              <Scissors className="w-5 h-5 text-slate-600" />
              <span>Change Page Range</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-sm font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>New PDF</span>
            </button>
          </div>
        </div>
      ) : (
        /* Workspace Configuration */
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
                  {formatBytes(selectedFile.size)} • {totalPages} Pages Detected
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

          {/* Mode Selector */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5">
            <h4 className="font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
              Select Splitting Method
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => setSplitMode('range')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  splitMode === 'range'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="font-bold text-sm">Extract Custom Page Range</div>
                <div className="text-xs text-slate-500 mt-1">
                  Specify exact page numbers (e.g. 1-3, 5, 7-10) to combine into a new PDF.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSplitMode('all')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  splitMode === 'all'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="font-bold text-sm">Split All Pages Individually</div>
                <div className="text-xs text-slate-500 mt-1">
                  Exports every single page into separate 1-page PDFs packaged in a ZIP archive.
                </div>
              </button>
            </div>

            {/* Range Input Box (Only when splitMode === 'range') */}
            {splitMode === 'range' && (
              <div className="space-y-2 pt-2 animate-in fade-in">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pages to Extract (1 to {totalPages})
                </label>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="e.g. 1-3, 5, 8"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
                  <span>Quick samples:</span>
                  <button
                    type="button"
                    onClick={() => setRangeInput('1')}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-medium"
                  >
                    Page 1
                  </button>
                  {totalPages >= 3 && (
                    <button
                      type="button"
                      onClick={() => setRangeInput('1-3')}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-medium"
                    >
                      1-3
                    </button>
                  )}
                  {totalPages >= 5 && (
                    <button
                      type="button"
                      onClick={() => setRangeInput(`1-${Math.min(5, totalPages)}`)}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-medium"
                    >
                      1-5
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Trigger */}
          {isProcessing ? (
            <div className="bg-white rounded-2xl border border-blue-200 p-6 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-base">Splitting PDF...</h4>
                <p className="text-xs text-blue-700 font-mono">{progressText || 'Extracting pages...'}</p>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleExecuteSplit}
              className="w-full flex items-center justify-center gap-3 py-4 sm:py-5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-lg sm:text-xl shadow-xl shadow-blue-600/25 transition-all cursor-pointer"
            >
              <Scissors className="w-6 h-6 stroke-[2.2]" />
              <span>{splitMode === 'range' ? 'Extract Selected Pages' : `Split All ${totalPages} Pages (ZIP)`}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

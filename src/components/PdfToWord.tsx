import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Download,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  FileType,
  Info,
  Sparkles,
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';
import { convertPdfToDocx, ConvertedDocumentResult } from '../utils/docxEngine';
import { getPdfPageCount } from '../utils/pdfToolsEngine';
import confetti from 'canvas-confetti';

export const PdfToWord: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressText, setProgressText] = useState<string>('');
  const [result, setResult] = useState<ConvertedDocumentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMessage('Please select a valid PDF file (.pdf).');
      return;
    }

    try {
      const count = await getPdfPageCount(file);
      setSelectedFile(file);
      setPageCount(count);
      setResult(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not read PDF document. The file may be password protected or corrupted.';
      setErrorMessage(msg);
    }
  };

  const handleStartConversion = async () => {
    if (!selectedFile) return;

    setIsConverting(true);
    setErrorMessage(null);
    setProgressPercent(10);
    setProgressText('Initializing PDF parser...');

    try {
      const res = await convertPdfToDocx(selectedFile, (current, total, stepMessage) => {
        setProgressPercent(current);
        setProgressText(stepMessage);
      });

      setResult(res);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#10b981', '#3b82f6'],
        });
      } catch (e) {
        // Safe fallback
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to convert PDF to Word document.';
      setErrorMessage(msg);
    } finally {
      setIsConverting(false);
      setProgressText('');
    }
  };

  const handleReset = () => {
    if (result?.objectUrl) {
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
        id="pdf-to-word-input"
      />

      {/* Error Notification */}
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
              <FileType className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-base shadow-md shadow-blue-600/25 hover:bg-blue-700 active:scale-95 transition-all">
                Select PDF File
              </span>
              <p className="text-sm text-slate-500 font-medium pt-2">
                or Drag & Drop PDF Document Here
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-600">
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                PDF Documents
              </span>
              <span className="text-slate-300">•</span>
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                Converts to .DOCX
              </span>
            </div>

            <div className="pt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200/80">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% In-Browser • Private & Secure • Zero Server Uploads</span>
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
                  Converted to Word Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Editable Microsoft Word (.docx) file is ready to download.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl self-start sm:self-auto">
              <span className="text-xs font-extrabold text-emerald-700 font-mono">
                {result.pageCount} {result.pageCount === 1 ? 'Page' : 'Pages'}
              </span>
            </div>
          </div>

          {/* Document Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Original PDF:</span>
              <span className="font-bold text-slate-800 truncate block mt-0.5" title={selectedFile.name}>
                {selectedFile.name}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Original Size:</span>
              <span className="font-bold text-slate-800 font-mono block mt-0.5">
                {formatBytes(selectedFile.size)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">DOCX Size:</span>
              <span className="font-bold text-emerald-700 font-mono block mt-0.5">
                {formatBytes(result.size)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Format:</span>
              <span className="font-bold text-blue-700 font-mono block mt-0.5">
                Microsoft Word (.docx)
              </span>
            </div>
          </div>

          {/* Download & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              id="download-pdf-word-btn"
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-base sm:text-lg shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>Download Word Document (.docx)</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Convert Another PDF</span>
            </button>
          </div>
        </div>
      ) : (
        /* Workspace / Selected Document Card */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-base sm:text-lg truncate max-w-sm sm:max-w-md">
                  {selectedFile.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                  <span className="font-mono">{formatBytes(selectedFile.size)}</span>
                  <span>•</span>
                  <span>{pageCount} {pageCount === 1 ? 'page' : 'pages'}</span>
                  <span>•</span>
                  <span className="text-blue-600 font-semibold">Ready to convert</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleReset}
              disabled={isConverting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors self-start sm:self-auto cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Change PDF</span>
            </button>
          </div>

          {/* Formatting Info Notice */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-blue-900 flex items-start gap-3 text-xs leading-relaxed">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Formatting Notice:</span> Converts headings, text paragraphs, alignments, font weights, and multi-page layouts into standard editable Word (.docx). Complex vector illustrations and multi-column magazine layouts will be converted into clean, sequential editable paragraphs.
            </div>
          </div>

          {/* Progress / Conversion Controls */}
          {isConverting ? (
            <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="flex items-center justify-center gap-2 text-blue-600 font-bold text-sm">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{progressText || 'Converting PDF to Word...'}</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Parsing PDF structures</span>
                <span>{progressPercent}%</span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleStartConversion}
              className="w-full flex items-center justify-center gap-3 py-4 sm:py-5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-lg sm:text-xl shadow-xl shadow-blue-600/25 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20 cursor-pointer"
            >
              <Sparkles className="w-6 h-6 fill-white" />
              <span>Convert to Word (.docx)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

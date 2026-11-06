import React, { useState, useRef, useEffect } from 'react';
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
  Eye,
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';
import { convertWordToPdf, ConvertedDocumentResult } from '../utils/docxEngine';
import confetti from 'canvas-confetti';

export const WordToPdf: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressText, setProgressText] = useState<string>('');
  const [result, setResult] = useState<ConvertedDocumentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const handleFile = (file: File) => {
    setErrorMessage(null);
    const lower = file.name.toLowerCase();
    if (!lower.endsWith('.docx') && !lower.endsWith('.doc')) {
      setErrorMessage('Please select a valid Microsoft Word document (.docx or .doc).');
      return;
    }

    setSelectedFile(file);
    setResult(null);
  };

  const handleStartConversion = async () => {
    if (!selectedFile || !previewContainerRef.current) return;

    setIsConverting(true);
    setErrorMessage(null);
    setProgressPercent(10);
    setProgressText('Reading Word document...');

    try {
      const res = await convertWordToPdf(
        selectedFile,
        previewContainerRef.current,
        (current, total, stepMessage) => {
          setProgressPercent(current);
          setProgressText(stepMessage);
        }
      );

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
      console.error('WordToPdf conversion error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to convert Word document to PDF.';
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
    if (previewContainerRef.current) {
      previewContainerRef.current.innerHTML = '';
    }
    setSelectedFile(null);
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
        accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
        className="hidden"
        id="word-to-pdf-input"
      />

      {/* Hidden/Offscreen rendering container for docx-preview */}
      <div
        ref={previewContainerRef}
        className="fixed top-0 left-0 -z-50 pointer-events-none opacity-100 overflow-hidden bg-white"
        style={{ width: '820px' }}
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
              <FileText className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-base shadow-md shadow-blue-600/25 hover:bg-blue-700 active:scale-95 transition-all">
                Select Word Document
              </span>
              <p className="text-sm text-slate-500 font-medium pt-2">
                or Drag & Drop Word Document Here
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-600">
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                DOCX (Modern Word)
              </span>
              <span className="text-slate-300">•</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                DOC (Word 97-2003)
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
                  Converted to PDF Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  High-fidelity PDF document is ready to download.
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
              <span className="text-slate-400 block font-medium">Original Document:</span>
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
              <span className="text-slate-400 block font-medium">PDF Size:</span>
              <span className="font-bold text-emerald-700 font-mono block mt-0.5">
                {formatBytes(result.size)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Format:</span>
              <span className="font-bold text-red-600 font-mono block mt-0.5">
                PDF Document (.pdf)
              </span>
            </div>
          </div>

          {/* Download & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              id="download-word-pdf-btn"
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-base sm:text-lg shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>Download PDF Document</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Convert Another Word Document</span>
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
                  <span>{selectedFile.name.toLowerCase().endsWith('.docx') ? 'DOCX Document' : 'Legacy DOC Document'}</span>
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
              <span>Change Document</span>
            </button>
          </div>

          {/* Formatting Info Notice */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-blue-900 flex items-start gap-3 text-xs leading-relaxed">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Formatting Notice:</span> Converts paragraphs, headings, tables, embedded images, borders, alignments, and fonts into a standard printable PDF document. For highest visual fidelity, use modern `.docx` format.
            </div>
          </div>

          {/* Progress / Conversion Controls */}
          {isConverting ? (
            <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="flex items-center justify-center gap-2 text-blue-600 font-bold text-sm">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{progressText || 'Converting Word to PDF...'}</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Rendering document structure</span>
                <span>{progressPercent}%</span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleStartConversion}
              className="w-full flex items-center justify-center gap-3 py-4 sm:py-5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-lg sm:text-xl shadow-xl shadow-blue-600/25 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20 cursor-pointer"
            >
              <Sparkles className="w-6 h-6 fill-white" />
              <span>Convert to PDF</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Download,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FolderArchive,
  Image as ImageIcon,
  ShieldCheck,
  Maximize2,
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';
import { renderPdfToJpgs, packageBlobsToZip, PdfPageJpg, getPdfPageCount } from '../utils/pdfToolsEngine';
import confetti from 'canvas-confetti';

export const PdfToJpg: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [pages, setPages] = useState<PdfPageJpg[]>([]);
  const [isZipping, setIsZipping] = useState<boolean>(false);
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
      setPages([]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not read PDF document.';
      setErrorMessage(msg);
    }
  };

  const handleStartConversion = async () => {
    if (!selectedFile) return;

    setIsConverting(true);
    setErrorMessage(null);

    try {
      const renderedPages = await renderPdfToJpgs(selectedFile, (cur, total) => {
        setProgressText(`Rendering page ${cur} of ${total} to high-res JPG...`);
      });

      setPages(renderedPages);
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
      const msg = err instanceof Error ? err.message : 'Failed to convert PDF pages to JPG.';
      setErrorMessage(msg);
    } finally {
      setIsConverting(false);
      setProgressText('');
    }
  };

  const handleDownloadSingle = (page: PdfPageJpg) => {
    const a = document.createElement('a');
    a.href = page.objectUrl;
    a.download = `halkapic-page-${page.pageNumber}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAllZip = async () => {
    if (pages.length === 0) return;
    setIsZipping(true);
    try {
      const items = pages.map((p) => ({
        filename: `halkapic-page-${p.pageNumber}.jpg`,
        blob: p.blob,
      }));
      const zipRes = await packageBlobsToZip(items, 'halkapic-pdf-pages.zip');
      const a = document.createElement('a');
      a.href = zipRes.objectUrl;
      a.download = zipRes.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create ZIP package.';
      setErrorMessage(msg);
    } finally {
      setIsZipping(false);
    }
  };

  const handleReset = () => {
    pages.forEach((p) => URL.revokeObjectURL(p.objectUrl));
    setSelectedFile(null);
    setTotalPages(0);
    setPages([]);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
        id="pdf-to-jpg-input"
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
              <ImageIcon className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-base shadow-md shadow-blue-600/25 hover:bg-blue-700 active:scale-95 transition-all">
                Select PDF to Convert
              </span>
              <p className="text-sm text-slate-500 font-medium pt-2">
                or Drag & Drop Multi-Page PDF Here
              </p>
            </div>

            <div className="pt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200/80">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Converts 100% locally. No documents are uploaded to any server.</span>
            </div>
          </div>
        </div>
      ) : pages.length > 0 ? (
        /* Results Gallery with Individual & ZIP Download */
        <div className="space-y-6">
          {/* Top Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                  {pages.length} Pages Converted to JPG
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Download individual pages or download all pages bundled in a single ZIP archive.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleDownloadAllZip}
                disabled={isZipping}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isZipping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FolderArchive className="w-4 h-4 stroke-[2.2]" />
                )}
                <span>Download All (ZIP)</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>New PDF</span>
              </button>
            </div>
          </div>

          {/* Grid of Rendered Pages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pages.map((page) => (
              <div
                key={page.pageNumber}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Page {page.pageNumber}</span>
                  <span className="font-mono text-slate-500">{formatBytes(page.size)}</span>
                </div>

                <div className="relative aspect-[3/4] bg-slate-50 flex items-center justify-center p-3 overflow-hidden">
                  <img
                    src={page.objectUrl}
                    alt={`Page ${page.pageNumber}`}
                    className="max-h-full max-w-full object-contain shadow-xs border border-slate-200 rounded"
                  />
                </div>

                <div className="p-3 border-t border-slate-100 bg-white flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {page.width} × {page.height} px
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDownloadSingle(page)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JPG</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Ready to Convert Workspace */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex items-center justify-between gap-4">
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

          {isConverting ? (
            <div className="bg-white rounded-2xl border border-blue-200 p-6 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-base">Rendering PDF Pages...</h4>
                <p className="text-xs text-blue-700 font-mono">{progressText || 'Extracting images...'}</p>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStartConversion}
              className="w-full flex items-center justify-center gap-3 py-4 sm:py-5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-lg sm:text-xl shadow-xl shadow-blue-600/25 transition-all cursor-pointer"
            >
              <ImageIcon className="w-6 h-6 stroke-[2.2]" />
              <span>Convert {totalPages} Pages to High-Res JPG</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

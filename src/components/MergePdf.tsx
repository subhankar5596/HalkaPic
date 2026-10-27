import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Download,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  Loader2,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';
import { mergePdfFiles, getPdfPageCount, MergePdfResult } from '../utils/pdfToolsEngine';
import confetti from 'canvas-confetti';

interface MergeItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

export const MergePdf: React.FC = () => {
  const [items, setItems] = useState<MergeItem[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [result, setResult] = useState<MergePdfResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (fileList: FileList | File[]) => {
    setErrorMessage(null);
    const newItems: MergeItem[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        setErrorMessage(`Skipped "${file.name}": Only PDF documents are supported.`);
        continue;
      }

      try {
        const count = await getPdfPageCount(file);
        newItems.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          name: file.name,
          size: file.size,
          pageCount: count,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : `Failed to read "${file.name}"`;
        setErrorMessage(msg);
      }
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
      setResult(null);
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const arr = [...items];
    const temp = arr[index];
    arr[index] = arr[targetIndex];
    arr[targetIndex] = temp;
    setItems(arr);
    setResult(null);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    setResult(null);
  };

  const handleStartMerge = async () => {
    if (items.length < 2) {
      setErrorMessage('Please add at least 2 PDF documents to merge.');
      return;
    }

    setIsMerging(true);
    setErrorMessage(null);

    try {
      const files = items.map((it) => it.file);
      const res = await mergePdfFiles(files, (cur, total) => {
        setProgressText(`Combining document ${cur} of ${total}...`);
      });

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
      const msg = err instanceof Error ? err.message : 'Failed to merge PDF files.';
      setErrorMessage(msg);
    } finally {
      setIsMerging(false);
      setProgressText('');
    }
  };

  const handleReset = () => {
    if (result?.objectUrl) URL.revokeObjectURL(result.objectUrl);
    setItems([]);
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

  const totalBytes = items.reduce((sum, it) => sum + it.size, 0);
  const totalPages = items.reduce((sum, it) => sum + it.pageCount, 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="application/pdf,.pdf"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            processFiles(Array.from(e.target.files));
          }
          e.target.value = '';
        }}
        className="hidden"
        id="merge-pdf-input"
      />
      <input
        ref={addMoreInputRef}
        type="file"
        multiple
        accept="application/pdf,.pdf"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            processFiles(Array.from(e.target.files));
          }
          e.target.value = '';
        }}
        className="hidden"
        id="merge-pdf-add-more"
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

      {items.length === 0 ? (
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
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              processFiles(Array.from(e.dataTransfer.files));
            }
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
              <Layers className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-base shadow-md shadow-blue-600/25 hover:bg-blue-700 active:scale-95 transition-all">
                Select Multiple PDFs to Merge
              </span>
              <p className="text-sm text-slate-500 font-medium pt-2">
                or Drag & Drop PDF Documents Here
              </p>
            </div>

            <div className="pt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200/80">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Client-Side. Merges in browser memory without cloud upload.</span>
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
                  PDFs Merged Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {items.length} PDF files compiled into a single document.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl self-start sm:self-auto">
              <FileText className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Merged Size
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
              <span className="text-slate-400 block font-medium">Files Combined:</span>
              <span className="font-bold text-slate-800 font-mono">{items.length} PDFs</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Total Pages:</span>
              <span className="font-bold text-slate-800 font-mono">{result.pageCount} Pages</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Output Size:</span>
              <span className="font-bold text-emerald-700 font-mono">{formatBytes(result.size)}</span>
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
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>Download Merged PDF</span>
              <span className="text-xs bg-blue-500/50 px-2 py-0.5 rounded-md font-mono">
                {formatBytes(result.size)}
              </span>
            </button>

            <button
              onClick={() => setResult(null)}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base transition-all cursor-pointer"
            >
              <Layers className="w-5 h-5 text-slate-600" />
              <span>Reorder / Add More</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-sm font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start Over</span>
            </button>
          </div>
        </div>
      ) : (
        /* Workspace List & Reordering */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base sm:text-lg">
                  {items.length} {items.length === 1 ? 'PDF' : 'PDFs'} to Merge
                </span>
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                  {totalPages} Pages • {formatBytes(totalBytes)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Use the arrows to arrange documents in the exact order you want them merged.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => addMoreInputRef.current?.click()}
                disabled={isMerging}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add More PDFs</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={isMerging}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 font-semibold text-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* List of PDFs */}
          <div className="space-y-2.5">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 flex items-center justify-between gap-4 shadow-xs hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm truncate" title={item.name}>
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {item.pageCount} {item.pageCount === 1 ? 'Page' : 'Pages'} • {formatBytes(item.size)}
                    </div>
                  </div>
                </div>

                {/* Reorder & Remove Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0 || isMerging}
                    onClick={() => moveItem(index, 'up')}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    disabled={index === items.length - 1 || isMerging}
                    onClick={() => moveItem(index, 'down')}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <div className="w-px h-4 bg-slate-200 mx-1" />

                  <button
                    type="button"
                    disabled={isMerging}
                    onClick={() => removeItem(index)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Remove PDF"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Merge Trigger Button */}
          {isMerging ? (
            <div className="bg-white rounded-2xl border border-blue-200 p-6 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-base">Merging PDF Documents...</h4>
                <p className="text-xs text-blue-700 font-mono">{progressText || 'Assembling pages...'}</p>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStartMerge}
              disabled={items.length < 2}
              className="w-full flex items-center justify-center gap-3 py-4 sm:py-5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-lg sm:text-xl shadow-xl shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Layers className="w-6 h-6 stroke-[2.2]" />
              <span>Merge {items.length} PDF Documents</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

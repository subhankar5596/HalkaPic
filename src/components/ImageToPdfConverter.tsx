import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  Download,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Layout,
  Maximize2,
  HardDrive,
  FileCheck2,
  Loader2,
  Settings2,
} from 'lucide-react';
import {
  PdfImageItem,
  PdfOptions,
  PdfPageSize,
  PdfOrientation,
  PdfMargin,
  PdfResult,
  PdfGenerationProgress,
} from '../types/pdf';
import { formatBytes, formatDimensions } from '../utils/formatters';
import { extractImageInfo } from '../utils/imageCompressor';
import { convertImagesToPdf } from '../utils/pdfGenerator';
import confetti from 'canvas-confetti';

export const ImageToPdfConverter: React.FC = () => {
  const [images, setImages] = useState<PdfImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // PDF Configuration Options
  const [pageSize, setPageSize] = useState<PdfPageSize>('a4');
  const [orientation, setOrientation] = useState<PdfOrientation>('portrait');
  const [margin, setMargin] = useState<PdfMargin>('small');

  // Conversion State
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState<PdfGenerationProgress>({
    isGenerating: false,
    currentPage: 0,
    totalPages: 0,
    stepMessage: '',
  });
  const [pdfResult, setPdfResult] = useState<PdfResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (fileList: FileList | File[]) => {
    setErrorMessage(null);
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const newItems: PdfImageItem[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (!ext || !validExtensions.includes(ext)) {
        setErrorMessage(
          `Skipped "${file.name}": Unsupported format. Only JPG, JPEG, PNG, and WebP are supported.`
        );
        continue;
      }

      try {
        const info = await extractImageInfo(file);
        newItems.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file,
          name: file.name,
          size: file.size,
          width: info.width,
          height: info.height,
          formatLabel: info.formatLabel,
          objectUrl: info.objectUrl,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : `Could not read "${file.name}"`;
        setErrorMessage(msg);
      }
    }

    if (newItems.length > 0) {
      setImages((prev) => [...prev, ...newItems]);
      setPdfResult(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesSnapshot = Array.from(e.target.files);
      processFiles(filesSnapshot);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Reorder Images
  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newArr = [...images];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;
    setImages(newArr);
    setPdfResult(null);
  };

  // Remove Single Image
  const removeImage = (index: number) => {
    const toRemove = images[index];
    if (toRemove?.objectUrl) {
      URL.revokeObjectURL(toRemove.objectUrl);
    }
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    setPdfResult(null);
  };

  // Clear All
  const clearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.objectUrl));
    if (pdfResult?.objectUrl) {
      URL.revokeObjectURL(pdfResult.objectUrl);
    }
    setImages([]);
    setPdfResult(null);
    setErrorMessage(null);
  };

  // Execute PDF Conversion
  const handleConvertToPdf = async () => {
    if (images.length === 0) {
      setErrorMessage('Please add at least one image to create a PDF.');
      return;
    }

    setIsConverting(true);
    setErrorMessage(null);

    try {
      const options: PdfOptions = {
        pageSize,
        orientation,
        margin,
      };

      const result = await convertImagesToPdf(images, options, (prog) => {
        setProgress(prog);
      });

      setPdfResult(result);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#10b981', '#38bdf8'],
        });
      } catch (e) {
        // Safe fallback
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate PDF. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsConverting(false);
    }
  };

  // Download Action
  const handleDownloadPdf = () => {
    if (!pdfResult) return;
    const a = document.createElement('a');
    a.href = pdfResult.objectUrl;
    a.download = pdfResult.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const totalBytes = images.reduce((sum, img) => sum + img.size, 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        onChange={handleFileSelect}
        className="hidden"
        id="halkapic-pdf-input"
      />
      <input
        ref={addMoreInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        onChange={handleFileSelect}
        className="hidden"
        id="halkapic-pdf-add-more"
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

      {/* When no images uploaded yet: Show Main Dropzone */}
      {images.length === 0 ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`relative w-full rounded-3xl border-2 border-dashed transition-all duration-200 cursor-pointer text-center p-8 sm:p-12 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 ${
            isDragging
              ? 'border-blue-600 bg-blue-50/80 scale-[1.01] shadow-xl shadow-blue-500/10'
              : 'border-slate-300 hover:border-blue-500 bg-white hover:bg-slate-50/70 shadow-sm hover:shadow-md'
          }`}
        >
          <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-transform duration-200 ${
                isDragging
                  ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/30'
                  : 'bg-blue-50 text-blue-600'
              }`}
            >
              {isDragging ? (
                <FileCheck2 className="w-10 h-10 animate-bounce" />
              ) : (
                <FileText className="w-10 h-10" />
              )}
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-base shadow-md shadow-blue-600/25 hover:bg-blue-700 active:scale-95 transition-all">
                Select Images for PDF
              </span>
              <p className="text-sm text-slate-500 font-medium pt-2">
                or <span className="text-blue-600 font-semibold underline decoration-blue-300">Drag & Drop Multiple Photos</span>
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
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>🔒 100% In-Browser. No photos uploaded to any server.</span>
            </div>
          </div>
        </div>
      ) : pdfResult ? (
        /* Result Card when PDF is generated */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  PDF Document Created!
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {pdfResult.pageCount} photos merged into one high-quality PDF.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl self-start sm:self-auto">
              <FileText className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  PDF File Size
                </div>
                <div className="text-lg font-black text-emerald-700 font-mono leading-none">
                  {formatBytes(pdfResult.size)}
                </div>
              </div>
            </div>
          </div>

          {/* Quick PDF Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Pages:</span>
              <span className="font-bold text-slate-800 text-sm font-mono">{pdfResult.pageCount} Pages</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Page Size:</span>
              <span className="font-bold text-slate-800 text-sm capitalize">{pageSize === 'a4' ? 'A4 Standard' : 'Fit to Image'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Orientation:</span>
              <span className="font-bold text-slate-800 text-sm capitalize">{orientation}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Status:</span>
              <span className="font-bold text-emerald-600 text-sm">Ready to Download</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={handleDownloadPdf}
              className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-base sm:text-lg shadow-lg shadow-blue-600/30 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20 cursor-pointer"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>Download PDF</span>
              <span className="text-xs bg-blue-500/50 px-2 py-0.5 rounded-md font-mono font-medium">
                {formatBytes(pdfResult.size)}
              </span>
            </button>

            <button
              onClick={() => setPdfResult(null)}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base transition-all cursor-pointer"
            >
              <Settings2 className="w-5 h-5 text-slate-600" />
              <span>Edit Settings / Reorder</span>
            </button>

            <button
              onClick={clearAll}
              className="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-sm font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start Over</span>
            </button>
          </div>
        </div>
      ) : (
        /* Image Arrangement & Configuration Workspace */
        <div className="space-y-6">
          {/* Top Bar: Count, Combined Size & Add More */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base sm:text-lg">
                  {images.length} {images.length === 1 ? 'Image' : 'Images'} Selected
                </span>
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                  {formatBytes(totalBytes)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Drag or use arrows to reorder pages before compiling to PDF.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => addMoreInputRef.current?.click()}
                disabled={isConverting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add More Images</span>
              </button>

              <button
                type="button"
                onClick={clearAll}
                disabled={isConverting}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Images Grid / List with Reordering Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {images.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md p-3.5 flex items-center gap-3 transition-all relative group"
              >
                {/* Page Number Badge */}
                <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-mono font-bold flex items-center justify-center shadow-xs">
                  {index + 1}
                </div>

                {/* Thumbnail Preview */}
                <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative flex items-center justify-center">
                  <img
                    src={item.objectUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info & Reorder Controls */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="font-bold text-slate-900 text-xs sm:text-sm truncate" title={item.name}>
                    {item.name}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="font-mono">{formatBytes(item.size)}</span>
                    <span>•</span>
                    <span className="font-mono">{formatDimensions(item.width, item.height)}</span>
                  </div>

                  {/* Actions: Move Up, Move Down, Delete */}
                  <div className="flex items-center gap-1 pt-1">
                    <button
                      type="button"
                      disabled={index === 0 || isConverting}
                      onClick={() => moveImage(index, 'up')}
                      className="p-1 rounded-md text-slate-600 hover:text-blue-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                      title="Move page earlier"
                      aria-label={`Move ${item.name} up`}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      disabled={index === images.length - 1 || isConverting}
                      onClick={() => moveImage(index, 'down')}
                      className="p-1 rounded-md text-slate-600 hover:text-blue-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                      title="Move page later"
                      aria-label={`Move ${item.name} down`}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    <div className="w-px h-3.5 bg-slate-200 mx-1" />

                    <button
                      type="button"
                      disabled={isConverting}
                      onClick={() => removeImage(index)}
                      className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove image"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PDF Configuration Options Box */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Settings2 className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-base sm:text-lg text-slate-900">
                PDF Page & Layout Settings
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Page Size Option */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Page Size
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPageSize('a4')}
                    disabled={isConverting}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      pageSize === 'a4'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm">A4 Standard</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      210 × 297 mm (Standard Document)
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPageSize('fit')}
                    disabled={isConverting}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      pageSize === 'fit'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm">Fit to Image</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Exact photo aspect ratio (No borders)
                    </div>
                  </button>
                </div>
              </div>

              {/* Orientation Option */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Orientation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrientation('portrait')}
                    disabled={isConverting}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      orientation === 'portrait'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold'
                    }`}
                  >
                    Portrait
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrientation('landscape')}
                    disabled={isConverting}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      orientation === 'landscape'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold'
                    }`}
                  >
                    Landscape
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrientation('auto')}
                    disabled={isConverting}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      orientation === 'auto'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold'
                    }`}
                  >
                    Auto Detect
                  </button>
                </div>
              </div>
            </div>

            {/* A4 Margin Option (only shown if A4 is selected) */}
            {pageSize === 'a4' && (
              <div className="pt-2 flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold">Page Margin:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMargin('small')}
                    className={`px-3 py-1 rounded-lg border font-medium ${
                      margin === 'small'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Standard (10mm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMargin('none')}
                    className={`px-3 py-1 rounded-lg border font-medium ${
                      margin === 'none'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Zero Margin
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Progress Indicator or Convert Button */}
          {isConverting ? (
            <div className="bg-white rounded-2xl border border-blue-200 p-6 text-center space-y-3">
              <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-base">
                  Converting Images to PDF...
                </h4>
                <p className="text-xs text-blue-700 font-medium font-mono">
                  {progress.stepMessage || `Page ${progress.currentPage} of ${progress.totalPages}`}
                </p>
              </div>
              <div className="w-full max-w-xs mx-auto bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${
                      progress.totalPages > 0
                        ? Math.round((progress.currentPage / progress.totalPages) * 100)
                        : 20
                    }%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConvertToPdf}
              disabled={images.length === 0}
              className="w-full flex items-center justify-center gap-3 py-4 sm:py-5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-lg sm:text-xl shadow-xl shadow-blue-600/25 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20 cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-6 h-6 stroke-[2.2]" />
              <span>Convert {images.length} {images.length === 1 ? 'Image' : 'Images'} to PDF</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

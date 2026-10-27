import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  User,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Download,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Maximize2,
  Sliders,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';
import { extractImageInfo } from '../utils/imageCompressor';
import { UploadedImageInfo } from '../types';
import { formatBytes, formatDimensions } from '../utils/formatters';
import {
  PASSPORT_PRESETS,
  PassportPreset,
  renderPassportPhoto,
  mmToPixels,
  PassportRenderResult,
} from '../utils/passportEngine';
import confetti from 'canvas-confetti';

export const PassportPhotoMaker: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<UploadedImageInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Preset & Dimensions
  const [selectedPresetId, setSelectedPresetId] = useState<string>('india-standard');
  const [unit, setUnit] = useState<'mm' | 'cm' | 'px'>('mm');
  const [widthInput, setWidthInput] = useState<number>(35);
  const [heightInput, setHeightInput] = useState<number>(45);
  const [dpi, setDpi] = useState<number>(300);

  // Adjustment Controls
  const [zoom, setZoom] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Background & Framing
  const [bgColor, setBgColor] = useState<'white' | 'light-blue' | 'light-gray' | 'original'>('white');
  const [addBorder, setAddBorder] = useState<boolean>(true);
  const [showGuide, setShowGuide] = useState<boolean>(true);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');

  // Result & State
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [result, setResult] = useState<PassportRenderResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate target pixel dimensions
  const getCalculatedPixels = useCallback((): { widthPx: number; heightPx: number } => {
    if (unit === 'mm') {
      return { widthPx: mmToPixels(widthInput, dpi), heightPx: mmToPixels(heightInput, dpi) };
    }
    if (unit === 'cm') {
      return { widthPx: mmToPixels(widthInput * 10, dpi), heightPx: mmToPixels(heightInput * 10, dpi) };
    }
    return { widthPx: Math.round(widthInput), heightPx: Math.round(heightInput) };
  }, [unit, widthInput, heightInput, dpi]);

  const handleSelectPreset = (preset: PassportPreset) => {
    setSelectedPresetId(preset.id);
    setUnit('mm');
    setWidthInput(preset.widthMm);
    setHeightInput(preset.heightMm);
    setZoom(1.0);
    setOffsetX(0);
    setOffsetY(0);
    setRotation(0);
  };

  const handleCustomDimensionChange = (w: number, h: number) => {
    setSelectedPresetId('custom');
    setWidthInput(w);
    setHeightInput(h);
  };

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    try {
      const info = await extractImageInfo(file);
      setSelectedImage(info);
      setResult(null);
      setZoom(1.0);
      setOffsetX(0);
      setOffsetY(0);
      setRotation(0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not read image file.';
      setErrorMessage(msg);
    }
  };

  // Render live preview on interactive canvas
  useEffect(() => {
    if (!selectedImage || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { widthPx, heightPx } = getCalculatedPixels();

    // Scale display canvas to reasonable preview size (max ~320px)
    const aspect = widthPx / heightPx;
    const previewH = 340;
    const previewW = Math.round(previewH * aspect);
    canvas.width = previewW;
    canvas.height = previewH;

    // Background fill
    if (bgColor === 'white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, previewW, previewH);
    } else if (bgColor === 'light-blue') {
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(0, 0, previewW, previewH);
    } else if (bgColor === 'light-gray') {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, previewW, previewH);
    } else {
      ctx.clearRect(0, 0, previewW, previewH);
    }

    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.translate(previewW / 2 + offsetX * (previewW / widthPx), previewH / 2 + offsetY * (previewH / heightPx));
      ctx.rotate((rotation * Math.PI) / 180);

      const scaleToFit = Math.max(previewW / img.width, previewH / img.height);
      const s = scaleToFit * zoom;
      const dw = img.width * s;
      const dh = img.height * s;

      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();

      // Border preview
      if (addBorder) {
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, previewW - 2, previewH - 2);
      }

      // Biometric Alignment Overlay
      if (showGuide) {
        ctx.save();
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);

        // Head oval
        ctx.beginPath();
        ctx.ellipse(previewW / 2, previewH * 0.42, previewW * 0.28, previewH * 0.26, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Eye line
        ctx.beginPath();
        ctx.moveTo(previewW * 0.2, previewH * 0.42);
        ctx.lineTo(previewW * 0.8, previewH * 0.42);
        ctx.stroke();

        // Chin line
        ctx.beginPath();
        ctx.moveTo(previewW * 0.3, previewH * 0.68);
        ctx.lineTo(previewW * 0.7, previewH * 0.68);
        ctx.stroke();

        ctx.restore();
      }
    };
    img.src = selectedImage.objectUrl;
  }, [selectedImage, zoom, rotation, offsetX, offsetY, bgColor, addBorder, showGuide, getCalculatedPixels]);

  // Mouse pan handlers for preview canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setStartPan({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setOffsetX(e.clientX - startPan.x);
    setOffsetY(e.clientY - startPan.y);
  };

  const handleMouseUp = () => setIsPanning(false);

  // Generate final high-res passport photo
  const handleGenerate = async () => {
    if (!selectedImage) return;

    setIsRendering(true);
    setErrorMessage(null);

    try {
      const { widthPx, heightPx } = getCalculatedPixels();
      const res = await renderPassportPhoto(selectedImage.file, {
        widthPx,
        heightPx,
        zoom,
        rotation,
        offsetX,
        offsetY,
        backgroundColor: bgColor,
        addBorder,
        format,
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
      const msg = err instanceof Error ? err.message : 'Failed to generate passport photo.';
      setErrorMessage(msg);
    } finally {
      setIsRendering(false);
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
        id="passport-file-input"
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
            className="text-red-500 hover:text-red-700 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Disclaimer Alert */}
      <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-2.5 text-xs">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Application Notice:</span> Photo specifications (background color, head height percentage, and file size limits) vary by government portal, embassy, and exam board. Always verify the specific guidelines of your application.
        </div>
      </div>

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
              <User className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-base shadow-md shadow-blue-600/25 hover:bg-blue-700 active:scale-95 transition-all">
                Upload Portrait Photo
              </span>
              <p className="text-sm text-slate-500 font-medium pt-2">
                or Drag & Drop Portrait Image Here
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
              <Maximize2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>300 DPI High-Resolution Output for Crisp Print & Digital Submission</span>
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
                  Passport Photo Created!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Centered, cropped, and formatted at 300 DPI.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl self-start sm:self-auto">
              <Maximize2 className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Dimensions
                </div>
                <div className="text-lg font-black text-emerald-700 font-mono leading-none">
                  {result.widthPx} × {result.heightPx} px
                </div>
              </div>
            </div>
          </div>

          {/* Photo Preview */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Final Print Preview
            </div>
            <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 flex items-center justify-center">
              <img
                src={result.objectUrl}
                alt="Passport Photo"
                className="max-h-72 object-contain rounded-lg"
              />
            </div>
          </div>

          {/* Metadata Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Dimensions (Pixels):</span>
              <span className="font-bold text-slate-800 font-mono">
                {result.widthPx} × {result.heightPx} px
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Physical Dimensions:</span>
              <span className="font-bold text-slate-800 font-mono">
                {widthInput} × {heightInput} {unit}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Print DPI:</span>
              <span className="font-bold text-slate-800 font-mono">{dpi} DPI</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">File Size:</span>
              <span className="font-bold text-emerald-700 font-mono">
                {formatBytes(result.size)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-base sm:text-lg shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>Download Passport Photo</span>
              <span className="text-xs bg-blue-500/50 px-2 py-0.5 rounded-md font-mono">
                {formatBytes(result.size)}
              </span>
            </button>

            <button
              onClick={() => setResult(null)}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base transition-all cursor-pointer"
            >
              <Sliders className="w-5 h-5 text-slate-600" />
              <span>Adjust Crop / Framing</span>
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
        /* Interactive Framing & Crop Workspace */
        <div className="space-y-6">
          {/* Preset Selector */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Official Passport / Visa Size Preset
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PASSPORT_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm">{preset.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{preset.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Workspace Grid: Left Canvas, Right Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Interactive Preview Canvas */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col items-center">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between w-full">
                <span>Interactive Crop & Alignment</span>
                <span className="text-[10px] text-blue-600 font-semibold">Drag to Reposition</span>
              </div>

              <div
                className="relative border border-slate-300 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing bg-slate-100 flex items-center justify-center shadow-inner"
                style={{ maxHeight: '360px' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <canvas ref={previewCanvasRef} className="block select-none" />
              </div>

              <p className="text-[11px] text-slate-400 mt-2 text-center">
                Use your mouse/touch to drag and align the head inside the dotted oval.
              </p>
            </div>

            {/* Adjustment Controls Panel */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5">
              <h4 className="font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
                Photo Adjustments & Framing
              </h4>

              {/* Zoom Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <ZoomIn className="w-4 h-4 text-blue-600" />
                    <span>Zoom Scale</span>
                  </span>
                  <span className="font-mono text-slate-500">{zoom.toFixed(2)}x</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.02"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.1).toFixed(2)))}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rotation Slider & Quick 90 deg button */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <RotateCw className="w-4 h-4 text-blue-600" />
                    <span>Rotation Angle</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500">{rotation}°</span>
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700"
                    >
                      +90°
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  step="1"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Background Color Options */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Backdrop Fill
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setBgColor('white')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      bgColor === 'white'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Pure White
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgColor('light-blue')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      bgColor === 'light-blue'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Light Blue
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgColor('light-gray')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      bgColor === 'light-gray'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Light Gray
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgColor('original')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      bgColor === 'original'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Original
                  </button>
                </div>
              </div>

              {/* Toggles: Border & Guidelines */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-700 font-medium">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addBorder}
                    onChange={(e) => setAddBorder(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Add cutting guide border</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGuide}
                    onChange={(e) => setShowGuide(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Show biometric head guidelines</span>
                </label>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isRendering}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-lg shadow-xl shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isRendering ? (
                  <span>Rendering 300 DPI Photo...</span>
                ) : (
                  <>
                    <Maximize2 className="w-5 h-5 stroke-[2.2]" />
                    <span>Generate Passport Photo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

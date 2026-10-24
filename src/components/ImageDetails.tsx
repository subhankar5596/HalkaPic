import React from 'react';
import { UploadedImageInfo } from '../types';
import { formatBytes, formatDimensions } from '../utils/formatters';
import { FileImage, Maximize2, HardDrive, Sparkles, RefreshCw, Layers } from 'lucide-react';

interface ImageDetailsProps {
  imageInfo: UploadedImageInfo;
  onChangePhoto: () => void;
  disabled?: boolean;
}

export const ImageDetails: React.FC<ImageDetailsProps> = ({
  imageInfo,
  onChangePhoto,
  disabled = false,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 transition-all">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
        {/* Thumbnail Preview with checkerboard for transparency */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 group">
          <div
            className="absolute inset-0 bg-repeat opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
            }}
          />
          <img
            src={imageInfo.objectUrl}
            alt={imageInfo.name}
            className="relative w-full h-full object-contain p-1"
          />
          {imageInfo.hasAlpha && (
            <span className="absolute bottom-1 right-1 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
              Alpha
            </span>
          )}
        </div>

        {/* Info Grid */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <h3
                className="font-bold text-slate-900 text-base sm:text-lg truncate"
                title={imageInfo.name}
              >
                {imageInfo.name}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span>Selected Photo</span>
                {imageInfo.hasAlpha && (
                  <span className="text-indigo-600 font-medium">• Transparent PNG detected</span>
                )}
              </p>
            </div>

            {/* Change Photo Button */}
            <button
              onClick={onChangePhoto}
              disabled={disabled}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors shrink-0 disabled:opacity-50"
              title="Upload a different photo"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change</span>
            </button>
          </div>

          {/* Metadata badges */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
            {/* Original Size */}
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px] font-medium text-slate-500 mb-0.5">
                <HardDrive className="w-3 h-3 text-slate-400" />
                <span>Original Size</span>
              </div>
              <div className="font-bold text-slate-900 text-sm sm:text-base font-mono">
                {formatBytes(imageInfo.size)}
              </div>
            </div>

            {/* Resolution */}
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px] font-medium text-slate-500 mb-0.5">
                <Maximize2 className="w-3 h-3 text-slate-400" />
                <span>Resolution</span>
              </div>
              <div className="font-bold text-slate-900 text-sm sm:text-base font-mono">
                {formatDimensions(imageInfo.width, imageInfo.height)}
              </div>
            </div>

            {/* Format */}
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px] font-medium text-slate-500 mb-0.5">
                <Layers className="w-3 h-3 text-slate-400" />
                <span>Format</span>
              </div>
              <div className="font-bold text-slate-900 text-sm sm:text-base uppercase">
                {imageInfo.formatLabel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

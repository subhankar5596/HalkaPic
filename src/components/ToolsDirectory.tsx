import React from 'react';
import {
  Minimize2,
  PenTool,
  User,
  FileType,
  FileDown,
  FileImage,
  Layers,
  Scissors,
  ArrowRight,
} from 'lucide-react';
import { ToolId, TOOLS_DATA } from '../types/tools';
import { navigateToTool } from '../utils/router';

export interface ToolsDirectoryItem {
  id: ToolId;
  name: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  category: 'photo' | 'pdf';
}

export const ALL_TOOLS: ToolsDirectoryItem[] = [
  {
    id: 'compress-photo',
    name: 'Photo MB to KB Compressor',
    description: 'Compress JPG, PNG & WebP to exact target sizes like 20KB, 50KB, 100KB with smart quality preservation.',
    icon: Minimize2,
    badge: 'Popular',
    category: 'photo',
  },
  {
    id: 'signature-resizer',
    name: 'Signature Resizer',
    description: 'Resize signature width & height in pixels and compress to exact 10KB, 20KB, 50KB limits for exam portals.',
    icon: PenTool,
    badge: 'New',
    category: 'photo',
  },
  {
    id: 'passport-photo-maker',
    name: 'Passport Photo Maker',
    description: 'Crop, rotate, align, and format photos to 35×45 mm or 2×2 inch official passport and visa standards at 300 DPI.',
    icon: User,
    badge: 'New',
    category: 'photo',
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF Converter',
    description: 'Convert multiple photos into a clean, lightweight PDF document in seconds with A4 or Fit-to-Image layout.',
    icon: FileType,
    badge: 'Popular',
    category: 'photo',
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Reduce large PDF documents from MB to KB with Low, Medium, and High compression while preserving legible text.',
    icon: FileDown,
    badge: 'New',
    category: 'pdf',
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG Converter',
    description: 'Convert PDF pages into high-resolution JPG images. Download individual pages or a single packaged ZIP file.',
    icon: FileImage,
    badge: 'New',
    category: 'pdf',
  },
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into one continuous document. Arrange and reorder pages easily before merging.',
    icon: Layers,
    badge: 'New',
    category: 'pdf',
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Extract custom page ranges (e.g. 1-3, 5, 8) or split every page into separate individual PDF files.',
    icon: Scissors,
    badge: 'New',
    category: 'pdf',
  },
];

interface ToolsDirectoryProps {
  onSelectTool?: (toolId: ToolId) => void;
  activeToolId?: ToolId;
}

export const ToolsDirectory: React.FC<ToolsDirectoryProps> = ({ onSelectTool, activeToolId }) => {
  const handleClick = (id: ToolId) => {
    if (onSelectTool) {
      onSelectTool(id);
    } else {
      navigateToTool(id);
    }
  };

  const photoTools = ALL_TOOLS.filter((t) => t.category === 'photo');
  const pdfTools = ALL_TOOLS.filter((t) => t.category === 'pdf');

  return (
    <section id="tools-directory" className="py-14 bg-slate-100/70 border-t border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Complete Image & PDF Suite
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              All HalkaPic Tools
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              8 powerful, free in-browser utilities designed for speed, privacy, and zero server storage.
            </p>
          </div>
          <div className="text-xs text-slate-600 font-semibold bg-white px-3.5 py-1.5 rounded-full border border-slate-200 self-start sm:self-auto shadow-xs">
            8 Fully Functional Tools
          </div>
        </div>

        {/* Photo Tools Grid */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Photo & Image Tools (4 Tools)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {photoTools.map((tool) => {
              const Icon = tool.icon;
              const isCurrentlySelected = activeToolId === tool.id;

              return (
                <div
                  key={tool.id}
                  onClick={() => handleClick(tool.id)}
                  className={`relative rounded-2xl p-5 border transition-all cursor-pointer group flex flex-col justify-between ${
                    isCurrentlySelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-105">
                        <Icon className="w-5 h-5" />
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {tool.badge}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-blue-600 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      {tool.description}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                    <span>Open tool</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PDF Tools Grid */}
        <div className="space-y-4 pt-4 border-t border-slate-200/60">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>PDF Document Tools (4 Tools)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pdfTools.map((tool) => {
              const Icon = tool.icon;
              const isCurrentlySelected = activeToolId === tool.id;

              return (
                <div
                  key={tool.id}
                  onClick={() => handleClick(tool.id)}
                  className={`relative rounded-2xl p-5 border transition-all cursor-pointer group flex flex-col justify-between ${
                    isCurrentlySelected
                      ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center transition-transform group-hover:scale-105">
                        <Icon className="w-5 h-5" />
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {tool.badge}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-emerald-700 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      {tool.description}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                    <span>Open tool</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

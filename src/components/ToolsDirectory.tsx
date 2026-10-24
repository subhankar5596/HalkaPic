import React from 'react';
import {
  Minimize2,
  Crop,
  UserCheck,
  FileType,
  FileImage,
  Layers,
  ArrowRight,
  Clock,
} from 'lucide-react';

export interface HalkaTool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: 'active' | 'coming_soon';
  badge?: string;
}

export const TOOLS_REGISTRY: HalkaTool[] = [
  {
    id: 'compress-photo',
    name: 'Photo MB to KB Compressor',
    description: 'Compress JPG, PNG & WebP to exact target sizes like 20KB, 50KB, 100KB with smart quality preservation.',
    icon: Minimize2,
    status: 'active',
    badge: 'Popular',
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF Converter',
    description: 'Convert single or multiple photos into a lightweight PDF document instantly.',
    icon: FileType,
    status: 'active',
    badge: 'New & Active',
  },
  {
    id: 'image-resize',
    name: 'Image Resizer',
    description: 'Resize image dimensions by width, height or percentage while maintaining aspect ratio.',
    icon: Crop,
    status: 'coming_soon',
    badge: 'In Development',
  },
  {
    id: 'passport-maker',
    name: 'Passport Photo Maker',
    description: 'Crop and format photos to standard 3.5×4.5 cm passport & visa requirements for official exams.',
    icon: UserCheck,
    status: 'coming_soon',
    badge: 'Coming Soon',
  },
  {
    id: 'jpg-to-png',
    name: 'JPG to PNG Converter',
    description: 'Losslessly convert JPEG images into high-compatibility PNG format.',
    icon: FileImage,
    status: 'coming_soon',
    badge: 'Coming Soon',
  },
  {
    id: 'png-to-jpg',
    name: 'PNG to JPG Converter',
    description: 'Convert transparent or opaque PNGs to lightweight JPG photos.',
    icon: Layers,
    status: 'coming_soon',
    badge: 'Coming Soon',
  },
];

interface ToolsDirectoryProps {
  onSelectTool?: (toolId: string) => void;
  activeToolId?: string;
}

export const ToolsDirectory: React.FC<ToolsDirectoryProps> = ({ onSelectTool, activeToolId }) => {
  return (
    <section id="tools-directory" className="py-12 bg-slate-100/70 border-t border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Tool Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              More Image Utilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Designed for speed, privacy, and zero data uploads.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-medium bg-white px-3 py-1.5 rounded-full border border-slate-200 self-start sm:self-auto">
            2 Active Tools • 4 Planned for v2.0
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS_REGISTRY.map((tool) => {
            const Icon = tool.icon;
            const isActive = tool.status === 'active';
            const isCurrentlySelected = activeToolId === tool.id;

            return (
              <div
                key={tool.id}
                onClick={() => {
                  if (isActive) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    onSelectTool?.(tool.id);
                  }
                }}
                className={`relative rounded-2xl p-5 border transition-all ${
                  isActive
                    ? isCurrentlySelected
                      ? 'bg-blue-50/60 border-blue-500 shadow-md ring-2 ring-blue-500/20 cursor-pointer'
                      : 'bg-white border-blue-200 hover:border-blue-400 shadow-xs hover:shadow-md cursor-pointer group'
                    : 'bg-white/70 border-slate-200/90 hover:border-slate-300 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform ${
                      isActive
                        ? 'bg-blue-600 text-white group-hover:scale-105'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {tool.badge}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-1">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {tool.description}
                </p>

                {isActive ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      onSelectTool?.(tool.id);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:text-blue-700 transition-colors"
                  >
                    <span>{tool.id === 'image-to-pdf' ? 'Open PDF Converter' : 'Open Photo Compressor'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>Coming in next update</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

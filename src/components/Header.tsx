import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
  HelpCircle,
  Lock,
  Minimize2,
  FileText,
  PenTool,
  User,
  FileDown,
  FileImage,
  Layers,
  Scissors,
} from 'lucide-react';
import { ToolId, TOOLS_DATA } from '../types/tools';
import { navigateToTool } from '../utils/router';

interface HeaderProps {
  currentToolId: ToolId;
  onSelectTool: (toolId: ToolId) => void;
  onOpenPrivacy: () => void;
  onOpenHowItWorks: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentToolId,
  onSelectTool,
  onOpenPrivacy,
  onOpenHowItWorks,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [photoDropdownOpen, setPhotoDropdownOpen] = useState(false);
  const [pdfDropdownOpen, setPdfDropdownOpen] = useState(false);

  const photoMenuRef = useRef<HTMLDivElement>(null);
  const pdfMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (photoMenuRef.current && !photoMenuRef.current.contains(e.target as Node)) {
        setPhotoDropdownOpen(false);
      }
      if (pdfMenuRef.current && !pdfMenuRef.current.contains(e.target as Node)) {
        setPdfDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
    setPhotoDropdownOpen(false);
    setPdfDropdownOpen(false);
  };

  const photoToolsList: { id: ToolId; label: string; icon: React.ElementType }[] = [
    { id: 'compress-photo', label: 'Compress Photo MB to KB', icon: Minimize2 },
    { id: 'signature-resizer', label: 'Signature Resizer (10KB - 50KB)', icon: PenTool },
    { id: 'passport-photo-maker', label: 'Passport Size Photo Maker', icon: User },
    { id: 'image-to-pdf', label: 'Image to PDF Converter', icon: FileText },
  ];

  const pdfToolsList: { id: ToolId; label: string; icon: React.ElementType }[] = [
    { id: 'compress-pdf', label: 'Compress PDF File', icon: FileDown },
    { id: 'pdf-to-jpg', label: 'PDF to JPG Converter', icon: FileImage },
    { id: 'merge-pdf', label: 'Merge PDF Files', icon: Layers },
    { id: 'split-pdf', label: 'Split & Extract PDF Pages', icon: Scissors },
  ];

  const currentToolData = TOOLS_DATA[currentToolId] || TOOLS_DATA['compress-photo'];
  const isPhotoCategory = currentToolData.category === 'photo';
  const isPdfCategory = currentToolData.category === 'pdf';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick(() => onSelectTool('compress-photo'))}
          className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-1 cursor-pointer"
          aria-label="HalkaPic Home"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all duration-200">
            <svg
              className="w-6 h-6 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-4-4a1.5 1.5 0 0 0-2.2 0L6 20" />
              <path
                d="M12 6v7m-3-3 3 3 3-3"
                className="text-emerald-300 stroke-emerald-300"
                strokeWidth="2.6"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                Halka<span className="text-blue-600">Pic</span>
              </span>
              <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 uppercase tracking-wider">
                Free
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
              Make Your Photos Lighter, Instantly.
            </p>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {/* Photo Tools Dropdown */}
          <div className="relative" ref={photoMenuRef}>
            <button
              onClick={() => {
                setPhotoDropdownOpen(!photoDropdownOpen);
                setPdfDropdownOpen(false);
              }}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                isPhotoCategory
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100/80'
              }`}
            >
              <Minimize2 className="w-4 h-4" />
              <span>Photo Tools</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${photoDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {photoDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Photo & Image Utilities
                </div>
                {photoToolsList.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleNavClick(() => onSelectTool(tool.id))}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                        currentToolId === tool.id
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{tool.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* PDF Tools Dropdown */}
          <div className="relative" ref={pdfMenuRef}>
            <button
              onClick={() => {
                setPdfDropdownOpen(!pdfDropdownOpen);
                setPhotoDropdownOpen(false);
              }}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                isPdfCategory
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-100/80'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>PDF Tools</span>
              <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded uppercase">
                4
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${pdfDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {pdfDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  PDF Document Utilities
                </div>
                {pdfToolsList.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleNavClick(() => onSelectTool(tool.id))}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                        currentToolId === tool.id
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-emerald-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{tool.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          <button
            onClick={onOpenHowItWorks}
            className="px-3 py-1.5 text-sm font-semibold text-slate-700 hover:text-blue-600 rounded-lg hover:bg-slate-100/80 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>How It Works</span>
          </button>

          <button
            onClick={onOpenPrivacy}
            className="px-3 py-1.5 text-sm font-semibold text-slate-700 hover:text-blue-600 rounded-lg hover:bg-slate-100/80 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Privacy</span>
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% In-Browser</span>
          </div>
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-full border border-emerald-200/60">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>Private</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-lg max-h-[80vh] overflow-y-auto animate-in slide-in-from-top duration-200">
          <div className="space-y-4">
            {/* Photo Tools Group */}
            <div>
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Photo Tools
              </div>
              <div className="space-y-1 mt-1">
                {photoToolsList.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleNavClick(() => onSelectTool(tool.id))}
                      className={`w-full text-left px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                        currentToolId === tool.id
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-blue-600" />
                      <span>{tool.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PDF Tools Group */}
            <div className="pt-2 border-t border-slate-100">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                PDF Tools
              </div>
              <div className="space-y-1 mt-1">
                {pdfToolsList.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleNavClick(() => onSelectTool(tool.id))}
                      className={`w-full text-left px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                        currentToolId === tool.id
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-emerald-600" />
                      <span>{tool.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1">
              <button
                onClick={() => handleNavClick(onOpenHowItWorks)}
                className="w-full text-left px-3 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between text-xs"
              >
                <span>How It Works</span>
                <HelpCircle className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => handleNavClick(onOpenPrivacy)}
                className="w-full text-left px-3 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between text-xs"
              >
                <span>Privacy Guarantee</span>
                <Lock className="w-4 h-4 text-emerald-600" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 px-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Zero server uploads. Your photos and PDFs stay strictly on your device.</span>
          </div>
        </div>
      )}
    </header>
  );
};

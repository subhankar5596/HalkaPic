import React, { useState } from 'react';
import { ShieldCheck, Menu, X, Sparkles, HelpCircle, Lock, FileText, Minimize2 } from 'lucide-react';

interface HeaderProps {
  currentTool: 'compressor' | 'image-to-pdf';
  onSelectTool: (tool: 'compressor' | 'image-to-pdf') => void;
  onOpenPrivacy: () => void;
  onOpenHowItWorks: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTool,
  onSelectTool,
  onOpenPrivacy,
  onOpenHowItWorks,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick(() => onSelectTool('compressor'))}
          className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-1 cursor-pointer"
          aria-label="HalkaPic Home"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all duration-200">
            {/* SVG Logo: Photo frame + Compression arrow */}
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
        <nav className="hidden md:flex items-center gap-1.5">
          {/* Tool switchers */}
          <button
            onClick={() => onSelectTool('compressor')}
            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentTool === 'compressor'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100/80'
            }`}
          >
            <Minimize2 className="w-4 h-4" />
            <span>Compress Photo</span>
          </button>

          <button
            onClick={() => onSelectTool('image-to-pdf')}
            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentTool === 'image-to-pdf'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100/80'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Image to PDF</span>
            <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded uppercase">
              New
            </span>
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1.5" />

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

          <div className="h-4 w-px bg-slate-200 mx-1.5" />

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

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick(() => onSelectTool('compressor'))}
              className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-between ${
                currentTool === 'compressor'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Minimize2 className="w-4 h-4" />
                <span>Compress Photo MB to KB</span>
              </span>
            </button>

            <button
              onClick={() => handleNavClick(() => onSelectTool('image-to-pdf'))}
              className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-between ${
                currentTool === 'image-to-pdf'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Image to PDF Converter</span>
              </span>
              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                NEW
              </span>
            </button>

            <div className="pt-2 border-t border-slate-100" />

            <button
              onClick={() => handleNavClick(onOpenHowItWorks)}
              className="w-full text-left px-4 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
            >
              <span>How It Works</span>
              <HelpCircle className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => handleNavClick(onOpenPrivacy)}
              className="w-full text-left px-4 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
            >
              <span>Privacy Guarantee</span>
              <Lock className="w-4 h-4 text-emerald-600" />
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 px-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Zero server uploads. Your photos stay strictly on your phone.</span>
          </div>
        </div>
      )}
    </header>
  );
};

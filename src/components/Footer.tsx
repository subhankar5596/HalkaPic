import React from 'react';
import { ShieldCheck, Lock, Heart } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenHowItWorks: () => void;
  onScrollToTop: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onOpenHowItWorks,
  onScrollToTop,
}) => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white text-slate-600 text-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
          <div className="space-y-1.5 max-w-sm">
            <button
              onClick={onScrollToTop}
              className="flex items-center gap-2 group text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                HP
              </div>
              <span className="font-extrabold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                Halka<span className="text-blue-600">Pic</span>
              </span>
            </button>
            <p className="text-xs text-slate-500 font-medium">
              “Make Your Photos Lighter, Instantly.” Free, private, and ultra-fast in-browser image compression.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-600">
            <button
              onClick={onScrollToTop}
              className="hover:text-blue-600 transition-colors"
            >
              Compress Photo
            </button>
            <button
              onClick={onOpenHowItWorks}
              className="hover:text-blue-600 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={onOpenPrivacy}
              className="hover:text-blue-600 transition-colors flex items-center gap-1 text-emerald-700"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              Privacy Guarantee
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>🔒 Photos processed locally on your device. Never saved on our servers.</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} HalkaPic. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { ShieldCheck, Lock, EyeOff, ServerOff, DatabaseZap, X, CheckCircle2 } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-title"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close Privacy Modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider w-fit mb-3 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Privacy Guarantee</span>
          </div>
          <h2 id="privacy-title" className="text-2xl sm:text-3xl font-black tracking-tight">
            Your Photos Never Leave Your Device
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-lg">
            HalkaPic was built with a privacy-first mindset. Unlike traditional websites, your photos are never uploaded to any remote server.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto text-sm text-slate-600">
          {/* Key Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <ServerOff className="w-5 h-5 text-emerald-600" />
                <span>Zero Server Uploads</span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Photos are processed 100% locally using your browser&apos;s HTML5 Canvas and memory. No bytes are sent across the Internet.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-blue-800 font-bold">
                <EyeOff className="w-5 h-5 text-blue-600" />
                <span>No User Tracking</span>
              </div>
              <p className="text-xs text-blue-900 leading-relaxed">
                No invasive advertising trackers, no surveillance scripts, and no analytics that monitor or touch your photo files.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-800 font-bold">
                <DatabaseZap className="w-5 h-5 text-indigo-600" />
                <span>No Database Storage</span>
              </div>
              <p className="text-xs text-indigo-900 leading-relaxed">
                We have no database, no user accounts, and no cloud buckets. Once you close the tab, the image is flushed from memory.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Lock className="w-5 h-5 text-slate-600" />
                <span>Safe for Sensitive IDs</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Safely compress confidential documents, passport photos, Aadhaar/ID cards, and signatures with complete peace of mind.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 text-base">
              How Local Processing Works
            </h3>
            <p className="leading-relaxed">
              When you select a photo on HalkaPic, the image is loaded into your browser&apos;s local memory using modern Web APIs (<code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono text-xs">CanvasRenderingContext2D</code> and <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono text-xs">HTMLCanvasElement.toBlob</code>).
            </p>
            <p className="leading-relaxed">
              Your device&apos;s own processor computes the compression algorithm, calculates optimal JPEG/WebP quantization, and produces the output file directly on your phone or computer.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="font-semibold text-slate-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>You Can Test It Yourself Offline:</span>
            </div>
            <p className="text-xs text-slate-600">
              Open HalkaPic, turn off your Wi-Fi or mobile data (Airplane Mode), and compress any photo. It will continue working seamlessly because it does not rely on any remote server!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors"
          >
            I Understand, Close
          </button>
        </div>
      </div>
    </div>
  );
};

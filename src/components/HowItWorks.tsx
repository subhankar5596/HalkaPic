import React from 'react';
import { UploadCloud, Sliders, Zap, DownloadCloud, FileCheck, ShieldCheck, HelpCircle } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '1',
      title: 'Upload your photo',
      desc: 'Drop your JPG, JPEG, PNG, or WebP photo directly into the uploader or paste it from your clipboard.',
      icon: UploadCloud,
      color: 'blue',
    },
    {
      num: '2',
      title: 'Choose the required KB size',
      desc: 'Pick common targets like 20 KB, 50 KB, 100 KB, or enter your exact custom KB requirement.',
      icon: Sliders,
      color: 'indigo',
    },
    {
      num: '3',
      title: 'Compress instantly',
      desc: 'Our smart iterative engine balances resolution and canvas quality locally on your device in milliseconds.',
      icon: Zap,
      color: 'amber',
    },
    {
      num: '4',
      title: 'Download lighter photo',
      desc: 'Inspect visual quality with the before/after slider and download your high-quality, lightweight image.',
      icon: DownloadCloud,
      color: 'emerald',
    },
  ];

  return (
    <section id="how-it-works" className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200/60">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Simple 4-Step Process</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            How HalkaPic Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            No technical knowledge needed. Reduce photo MB to KB right inside your phone or computer browser without losing clarity.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Use Cases Box */}
        <div className="mt-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Standard Photo Size Guidelines</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Quick reference for official exam forms, job portals, and visa submissions
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
              Updated 2026 Guidelines
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
            <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60">
              <div className="font-bold text-emerald-400 text-sm mb-1">20 KB - 50 KB</div>
              <div className="font-semibold text-white mb-0.5">Govt Exams & Job Forms</div>
              <p className="text-slate-400 text-[11px]">
                SSC, UPSC, IBPS, State PSC, and Railway exam application photos.
              </p>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60">
              <div className="font-bold text-blue-400 text-sm mb-1">50 KB - 100 KB</div>
              <div className="font-semibold text-white mb-0.5">Passport, Visa & IDs</div>
              <p className="text-slate-400 text-[11px]">
                Schengen, US Visa, Indian Passport Seva, and College admission portals.
              </p>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60">
              <div className="font-bold text-amber-400 text-sm mb-1">100 KB - 200 KB</div>
              <div className="font-semibold text-white mb-0.5">Websites & Resumes</div>
              <p className="text-slate-400 text-[11px]">
                Optimized images for fast loading WordPress, Shopify, LinkedIn, and PDF resumes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

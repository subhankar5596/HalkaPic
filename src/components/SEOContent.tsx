import React from 'react';
import { HelpCircle, Check, Shield, Zap, Sparkles, ChevronDown } from 'lucide-react';

export const SEOContent: React.FC = () => {
  const faqs = [
    {
      q: 'What is HalkaPic?',
      a: 'HalkaPic is a 100% free, private online image utility designed to compress photos from MB to KB (such as 20KB, 50KB, 100KB, 200KB, 500KB) and convert multiple images into clean PDF documents directly inside your browser without uploading files to any external server.',
    },
    {
      q: 'How do I compress a photo from MB to KB without losing quality?',
      a: 'HalkaPic uses a smart iterative compression algorithm. Instead of blindly lowering resolution, it evaluates JPEG and WebP quantization matrices on your browser canvas. It searches for the highest visual clarity that stays strictly under your target KB (e.g. 100 KB, 50 KB, or 20 KB).',
    },
    {
      q: 'How do I convert images into a PDF on HalkaPic?',
      a: 'Simply switch to the "Image to PDF" tool, select multiple JPG, PNG, or WebP photos, arrange them into your preferred order using the Move Up/Down buttons, select your preferred layout (A4 Standard or Fit-to-Image), and click "Convert to PDF" to download your combined document immediately.',
    },
    {
      q: 'Is it safe to compress confidential ID photos and passport documents?',
      a: 'Yes, 100% safe. Unlike other online converters that upload your photos to their servers, HalkaPic processes every pixel locally on your device inside your browser memory. Your sensitive IDs, signatures, and certificates never travel over the internet.',
    },
    {
      q: 'How can I compress an image to under 50KB or 20KB for government forms?',
      a: 'Most official job portals (SSC, UPSC, IBPS, State PSC, Visa) strictly require photos between 20 KB and 50 KB. Simply click the "20 KB" or "50 KB" preset on HalkaPic, click "Compress Image", and download your compliant photo in seconds.',
    },
    {
      q: 'What happens to transparent PNG images?',
      a: 'Many compressors turn transparent PNG backgrounds pitch black. HalkaPic automatically detects alpha channels and uses WebP compression to preserve transparency while reducing file size from MB to KB cleanly.',
    },
    {
      q: 'Does HalkaPic require any login or payment?',
      a: 'No. HalkaPic is completely free with no signup, no subscriptions, no ads, and no watermarks on your downloaded images.',
    },
  ];

  return (
    <section className="py-12 border-t border-slate-200/80 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Informative Article & Highlights */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              HalkaPic: Smart In-Browser Photo Compression & PDF Creation
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Modern smartphone cameras capture stunning detail, but high-resolution photos often weigh 3 MB to 15 MB. When you need to upload a photo to an exam registration portal, email an attachment, or speed up your website, large files get rejected. HalkaPic delivers instant, privacy-first compression and image-to-PDF conversion with zero software installation.
            </p>
          </div>

          {/* Quick Cards for Search Intends */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Compress Photo to 20KB & 50KB</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tailored for competitive exams, passport forms, and signature upload limits with strict byte cutoffs.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>Compress Photo to 100KB</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The gold standard for job application CVs, LinkedIn avatars, and university portal admissions.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span>Image to PDF Converter</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Merge multiple JPG, PNG, and WebP images into one organized A4 or Fit-to-Image PDF document.
              </p>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="space-y-6 pt-4 border-t border-slate-100">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions About HalkaPic
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Everything you need to know about photo compression and PDF tools with HalkaPic.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 transition-all open:bg-blue-50/40 open:border-blue-200"
              >
                <summary className="font-bold text-slate-900 text-sm sm:text-base cursor-pointer list-none flex items-center justify-between gap-3">
                  <span>{faq.q}</span>
                  <span className="w-6 h-6 rounded-full bg-slate-200 group-open:bg-blue-600 text-slate-600 group-open:text-white flex items-center justify-center shrink-0 transition-colors text-xs font-bold">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useEffect } from 'react';
import { ToolId, TOOLS_DATA } from '../types/tools';
import { updatePageMeta, navigateToTool } from '../utils/router';
import { HelpCircle, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface ToolPageLayoutProps {
  toolId: ToolId;
  children: React.ReactNode;
}

export const ToolPageLayout: React.FC<ToolPageLayoutProps> = ({ toolId, children }) => {
  const data = TOOLS_DATA[toolId] || TOOLS_DATA['compress-photo'];

  useEffect(() => {
    updatePageMeta(toolId);
  }, [toolId]);

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Tool Hero Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs sm:text-sm font-bold border border-blue-200/60 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span>100% In-Browser • Free • No Uploads</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {data.h1}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
          {data.tagline}
        </p>

        {data.introText && (
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed pt-1">
            {data.introText}
          </p>
        )}
      </div>

      {/* Main Interactive Tool Workspace */}
      <div className="max-w-3xl mx-auto">{children}</div>

      {/* How to Use Section */}
      {data.howToUse && data.howToUse.length > 0 && (
        <section className="py-8 border-t border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center space-y-2 mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200/60">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Step-by-Step Instructions</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                How to Use {data.name}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.howToUse.map((item) => (
                <div
                  key={item.step}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center mb-3">
                      {item.step}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Key Features Section */}
      {data.keyFeatures && data.keyFeatures.length > 0 && (
        <section className="py-8 bg-slate-100/60 rounded-3xl p-6 sm:p-10 border border-slate-200/80 max-w-5xl mx-auto">
          <div className="text-center space-y-1 mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Key Features & Performance
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Why professionals and students choose HalkaPic for fast file processing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.keyFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-1.5"
              >
                <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span>{feat.title}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed pl-4">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Frequently Asked Questions */}
      {data.faqs && data.faqs.length > 0 && (
        <section className="py-6 max-w-3xl mx-auto space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Common questions about {data.name} on HalkaPic.
            </p>
          </div>

          <div className="space-y-3">
            {data.faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-white rounded-2xl border border-slate-200/80 p-4 transition-all open:bg-blue-50/30 open:border-blue-200 shadow-xs"
              >
                <summary className="font-bold text-slate-900 text-sm sm:text-base cursor-pointer list-none flex items-center justify-between gap-3">
                  <span>{faq.q}</span>
                  <span className="w-6 h-6 rounded-full bg-slate-100 group-open:bg-blue-600 text-slate-600 group-open:text-white flex items-center justify-center shrink-0 transition-colors text-xs font-bold">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Related Tools Internal Linking */}
      {data.relatedToolIds && data.relatedToolIds.length > 0 && (
        <section className="py-8 border-t border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-xl text-slate-900 tracking-tight">
                  Related HalkaPic Tools
                </h3>
                <p className="text-xs text-slate-500">
                  Explore other fast in-browser photo & document utilities.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {data.relatedToolIds.map((rId) => {
                const rData = TOOLS_DATA[rId];
                if (!rData) return null;
                return (
                  <button
                    key={rId}
                    type="button"
                    onClick={() => navigateToTool(rId)}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                        {rData.name}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {rData.shortDesc}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 mt-3">
                      <span>Open tool</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

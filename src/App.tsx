import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { Uploader } from './components/Uploader';
import { ImageDetails } from './components/ImageDetails';
import { TargetSelector } from './components/TargetSelector';
import { CompressProgress } from './components/CompressProgress';
import { ResultCard } from './components/ResultCard';
import { ImageToPdfConverter } from './components/ImageToPdfConverter';
import { HowItWorks } from './components/HowItWorks';
import { ToolsDirectory } from './components/ToolsDirectory';
import { PrivacyModal } from './components/PrivacyModal';
import { SEOContent } from './components/SEOContent';
import { Footer } from './components/Footer';
import {
  UploadedImageInfo,
  CompressionProgressState,
  CompressionResult,
} from './types';
import { compressImage } from './utils/imageCompressor';
import { Zap, AlertCircle, FileText, Minimize2 } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation / Tool State
  const [currentTool, setCurrentTool] = useState<'compressor' | 'image-to-pdf'>('compressor');

  // Compressor Application State
  const [selectedImage, setSelectedImage] = useState<UploadedImageInfo | null>(null);
  const [targetKB, setTargetKB] = useState<number>(50); // Default to popular 50 KB
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [progressState, setProgressState] = useState<CompressionProgressState>({
    isCompressing: false,
    stepMessage: '',
    currentAttempt: 0,
    maxAttempts: 10,
  });
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);

  const heroSectionRef = useRef<HTMLDivElement>(null);

  // Handle image selected from uploader or paste
  const handleImageSelected = (info: UploadedImageInfo) => {
    if (selectedImage?.objectUrl) {
      URL.revokeObjectURL(selectedImage.objectUrl);
    }
    if (compressionResult?.objectUrl) {
      URL.revokeObjectURL(compressionResult.objectUrl);
    }

    setSelectedImage(info);
    setCompressionResult(null);
    setErrorMessage(null);

    const originalKB = Math.round(info.size / 1024);
    if (originalKB > 500) {
      setTargetKB(100);
    } else if (originalKB > 200) {
      setTargetKB(50);
    } else if (originalKB > 60) {
      setTargetKB(50);
    } else {
      setTargetKB(20);
    }
  };

  // Trigger real smart compression
  const handleStartCompression = async () => {
    if (!selectedImage) return;

    if (!targetKB || targetKB <= 0) {
      setErrorMessage('Please specify a valid target size greater than 0 KB.');
      return;
    }

    setErrorMessage(null);
    setIsCompressing(true);

    try {
      const result = await compressImage(
        selectedImage,
        {
          targetKB,
          preserveTransparency: true,
        },
        (progress) => {
          setProgressState(progress);
        }
      );

      setCompressionResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Compression failed. Please try a different photo.';
      setErrorMessage(msg);
    } finally {
      setIsCompressing(false);
      setProgressState((prev) => ({ ...prev, isCompressing: false }));
    }
  };

  // Reset to compress another image
  const handleCompressAnother = () => {
    if (selectedImage?.objectUrl) {
      URL.revokeObjectURL(selectedImage.objectUrl);
    }
    if (compressionResult?.objectUrl) {
      URL.revokeObjectURL(compressionResult.objectUrl);
    }
    setSelectedImage(null);
    setCompressionResult(null);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToHero = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectTool = (toolId: string) => {
    if (toolId === 'image-to-pdf') {
      setCurrentTool('image-to-pdf');
    } else {
      setCurrentTool('compressor');
    }
    scrollToHero();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Navigation Header */}
      <Header
        currentTool={currentTool}
        onSelectTool={(tool) => {
          setCurrentTool(tool);
          scrollToHero();
        }}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenHowItWorks={scrollToHowItWorks}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section & Main Interactive Tool Root */}
        <section
          ref={heroSectionRef}
          id="tool-root"
          className="pt-8 sm:pt-12 pb-12 sm:pb-16 px-4 sm:px-6"
        >
          <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
            {/* Quick Tool Switcher Pills */}
            <div className="flex justify-center">
              <div className="inline-flex items-center p-1 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
                <button
                  type="button"
                  onClick={() => setCurrentTool('compressor')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    currentTool === 'compressor'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>Compress Photo MB to KB</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentTool('image-to-pdf')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    currentTool === 'image-to-pdf'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Image to PDF</span>
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                    currentTool === 'image-to-pdf'
                      ? 'bg-white/20 text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    New
                  </span>
                </button>
              </div>
            </div>

            {/* Main Headline & Subheading based on selected tool */}
            {currentTool === 'compressor' ? (
              <div className="text-center space-y-3 animate-in fade-in">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs sm:text-sm font-bold border border-blue-200/60 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  <span>Free • Fast • 100% Private</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Compress Photo <span className="text-blue-600">MB to KB</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
                  Reduce image size quickly while keeping the best possible quality. Free, fast and private.
                </p>
              </div>
            ) : (
              <div className="text-center space-y-3 animate-in fade-in">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-bold border border-emerald-200/60 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>Multiple Photos • A4 & Fit • 100% In-Browser</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Convert Image <span className="text-blue-600">to PDF</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
                  Merge multiple JPG, PNG, or WebP photos into one clean PDF document. Arrange pages, pick A4 or Fit-to-Image, and download instantly.
                </p>
              </div>
            )}

            {/* Interactive Tool Area */}
            {currentTool === 'image-to-pdf' ? (
              <ImageToPdfConverter />
            ) : (
              <div className="space-y-4 animate-in fade-in">
                {/* Error Notification Banner */}
                {errorMessage && (
                  <div
                    role="alert"
                    className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3 text-sm animate-in fade-in"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1 font-medium">{errorMessage}</div>
                    <button
                      onClick={() => setErrorMessage(null)}
                      className="text-red-500 hover:text-red-700 font-bold text-xs"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {!selectedImage ? (
                  /* Step 1: Upload Zone */
                  <Uploader
                    onImageSelected={handleImageSelected}
                    onError={(err) => setErrorMessage(err)}
                  />
                ) : compressionResult ? (
                  /* Step 3: Compression Result Card */
                  <ResultCard
                    originalImage={selectedImage}
                    result={compressionResult}
                    onCompressAnother={handleCompressAnother}
                  />
                ) : (
                  /* Step 2: Configure & Compress */
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <ImageDetails
                      imageInfo={selectedImage}
                      onChangePhoto={handleCompressAnother}
                      disabled={isCompressing}
                    />

                    <TargetSelector
                      originalSizeBytes={selectedImage.size}
                      selectedTargetKB={targetKB}
                      onTargetChange={(val) => setTargetKB(val)}
                      disabled={isCompressing}
                    />

                    {isCompressing ? (
                      <CompressProgress progress={progressState} targetKB={targetKB} />
                    ) : (
                      <button
                        type="button"
                        onClick={handleStartCompression}
                        disabled={isCompressing || !targetKB || targetKB <= 0}
                        className="w-full flex items-center justify-center gap-3 py-4 sm:py-5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-lg sm:text-xl shadow-xl shadow-blue-600/25 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Zap className="w-6 h-6 fill-white" />
                        <span>Compress Image to {targetKB} KB</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* How HalkaPic Works Section */}
        <HowItWorks />

        {/* Extensible Ecosystem / Directory with Active Image to PDF tool */}
        <ToolsDirectory
          activeToolId={currentTool === 'compressor' ? 'compress-photo' : 'image-to-pdf'}
          onSelectTool={handleSelectTool}
        />

        {/* SEO Knowledge & FAQs */}
        <SEOContent />
      </main>

      {/* Privacy Guarantee Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      {/* Global Footer */}
      <Footer
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenHowItWorks={scrollToHowItWorks}
        onScrollToTop={scrollToHero}
      />
    </div>
  );
};

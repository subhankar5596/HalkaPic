import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { Uploader } from './components/Uploader';
import { ImageDetails } from './components/ImageDetails';
import { TargetSelector } from './components/TargetSelector';
import { CompressProgress } from './components/CompressProgress';
import { ResultCard } from './components/ResultCard';
import { HowItWorks } from './components/HowItWorks';
import { ToolsDirectory } from './components/ToolsDirectory';
import { PrivacyModal } from './components/PrivacyModal';
import { Footer } from './components/Footer';
import { ToolPageLayout } from './components/ToolPageLayout';
import { ToolId, TOOLS_DATA } from './types/tools';
import { getCurrentToolFromUrl, navigateToTool, updatePageMeta } from './utils/router';
import {
  UploadedImageInfo,
  CompressionProgressState,
  CompressionResult,
} from './types';
import { compressImage } from './utils/imageCompressor';
import { Zap, AlertCircle, Loader2 } from 'lucide-react';

// Code-split / Lazy load secondary tools so PDF libraries do not slow down initial homepage load
const ImageToPdfConverter = lazy(() =>
  import('./components/ImageToPdfConverter').then((m) => ({ default: m.ImageToPdfConverter }))
);
const SignatureResizer = lazy(() =>
  import('./components/SignatureResizer').then((m) => ({ default: m.SignatureResizer }))
);
const PassportPhotoMaker = lazy(() =>
  import('./components/PassportPhotoMaker').then((m) => ({ default: m.PassportPhotoMaker }))
);
const CompressPdf = lazy(() =>
  import('./components/CompressPdf').then((m) => ({ default: m.CompressPdf }))
);
const PdfToJpg = lazy(() =>
  import('./components/PdfToJpg').then((m) => ({ default: m.PdfToJpg }))
);
const MergePdf = lazy(() =>
  import('./components/MergePdf').then((m) => ({ default: m.MergePdf }))
);
const SplitPdf = lazy(() =>
  import('./components/SplitPdf').then((m) => ({ default: m.SplitPdf }))
);

export const App: React.FC = () => {
  // Navigation / Tool Routing State
  const [currentTool, setCurrentTool] = useState<ToolId>(() => getCurrentToolFromUrl());

  // Compressor Application State
  const [selectedImage, setSelectedImage] = useState<UploadedImageInfo | null>(null);
  const [targetKB, setTargetKB] = useState<number>(50);
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

  // Sync route on popstate (browser back/forward) & custom route changes
  useEffect(() => {
    const handleLocationChange = () => {
      const tool = getCurrentToolFromUrl();
      setCurrentTool(tool);
      updatePageMeta(tool);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('halkapic-route-change', handleLocationChange);

    // Initial meta update
    updatePageMeta(currentTool);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('halkapic-route-change', handleLocationChange);
    };
  }, [currentTool]);

  // Handle image selected from uploader or paste
  const handleImageSelected = (info: UploadedImageInfo) => {
    if (selectedImage?.objectUrl) URL.revokeObjectURL(selectedImage.objectUrl);
    if (compressionResult?.objectUrl) URL.revokeObjectURL(compressionResult.objectUrl);

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
    if (selectedImage?.objectUrl) URL.revokeObjectURL(selectedImage.objectUrl);
    if (compressionResult?.objectUrl) URL.revokeObjectURL(compressionResult.objectUrl);
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

  const handleSelectTool = (toolId: ToolId) => {
    navigateToTool(toolId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Navigation Header */}
      <Header
        currentToolId={currentTool}
        onSelectTool={handleSelectTool}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenHowItWorks={scrollToHowItWorks}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <section
          ref={heroSectionRef}
          id="tool-root"
          className="pt-8 sm:pt-12 pb-12 sm:pb-16 px-4 sm:px-6"
        >
          <ToolPageLayout toolId={currentTool}>
            {/* Render Active Tool */}
            {currentTool === 'compress-photo' && (
              <div className="space-y-4 animate-in fade-in">
                {errorMessage && (
                  <div
                    role="alert"
                    className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3 text-sm animate-in fade-in"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1 font-medium">{errorMessage}</div>
                    <button
                      onClick={() => setErrorMessage(null)}
                      className="text-red-500 hover:text-red-700 font-bold text-xs cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {!selectedImage ? (
                  <Uploader
                    onImageSelected={handleImageSelected}
                    onError={(err) => setErrorMessage(err)}
                  />
                ) : compressionResult ? (
                  <ResultCard
                    originalImage={selectedImage}
                    result={compressionResult}
                    onCompressAnother={handleCompressAnother}
                  />
                ) : (
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

            {currentTool !== 'compress-photo' && (
              <Suspense
                fallback={
                  <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-white rounded-3xl border border-slate-200">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="text-sm font-semibold text-slate-600">Loading {TOOLS_DATA[currentTool]?.name || 'tool'}...</span>
                  </div>
                }
              >
                {currentTool === 'image-to-pdf' && <ImageToPdfConverter />}
                {currentTool === 'signature-resizer' && <SignatureResizer />}
                {currentTool === 'passport-photo-maker' && <PassportPhotoMaker />}
                {currentTool === 'compress-pdf' && <CompressPdf />}
                {currentTool === 'pdf-to-jpg' && <PdfToJpg />}
                {currentTool === 'merge-pdf' && <MergePdf />}
                {currentTool === 'split-pdf' && <SplitPdf />}
              </Suspense>
            )}
          </ToolPageLayout>
        </section>

        {/* Global Overview Section */}
        <HowItWorks />

        {/* Full Ecosystem Tool Directory (All 8 Tools) */}
        <ToolsDirectory
          activeToolId={currentTool}
          onSelectTool={handleSelectTool}
        />
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

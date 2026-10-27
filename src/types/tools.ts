export type ToolId =
  | 'compress-photo'
  | 'image-to-pdf'
  | 'signature-resizer'
  | 'passport-photo-maker'
  | 'compress-pdf'
  | 'pdf-to-jpg'
  | 'merge-pdf'
  | 'split-pdf';

export interface ToolMetadata {
  id: ToolId;
  path: string;
  name: string;
  badge?: string;
  category: 'photo' | 'pdf';
  shortDesc: string;
  pageTitle: string;
  metaDescription: string;
  h1: string;
  tagline: string;
  introText: string;
  howToUse: { step: string; title: string; desc: string }[];
  keyFeatures: { title: string; desc: string }[];
  faqs: { q: string; a: string }[];
  relatedToolIds: ToolId[];
}

export const TOOLS_DATA: Record<ToolId, ToolMetadata> = {
  'compress-photo': {
    id: 'compress-photo',
    path: '/',
    name: 'Photo MB to KB',
    badge: 'Popular',
    category: 'photo',
    shortDesc: 'Compress JPG, PNG & WebP to exact target sizes like 20KB, 50KB, 100KB with smart quality preservation.',
    pageTitle: 'Compress Photo MB to KB Online Free | HalkaPic',
    metaDescription: 'Compress JPG, JPEG, PNG and WebP photos from MB to KB (20KB, 50KB, 100KB) online for free with HalkaPic. 100% private in-browser compression.',
    h1: 'Compress Photo MB to KB',
    tagline: 'Reduce photo file size quickly while keeping the best possible visual quality. Free, fast and private.',
    introText: 'High-resolution smartphone cameras take photos that are 3MB to 15MB. Online examination portals, government job applications (SSC, UPSC, State PSC), and visa portals require photos under 50KB or 20KB. HalkaPic compresses your photo locally in your browser memory.',
    howToUse: [
      { step: '1', title: 'Upload Photo', desc: 'Drag and drop or select your JPG, PNG, or WebP photo.' },
      { step: '2', title: 'Select Target Size', desc: 'Choose a preset like 20KB, 50KB, 100KB, or type any custom KB.' },
      { step: '3', title: 'Smart Compress', desc: 'Our engine uses iterative canvas quantization to hit your target KB.' },
      { step: '4', title: 'Download Image', desc: 'Inspect clarity on the before/after slider and download immediately.' }
    ],
    keyFeatures: [
      { title: 'Iterative Binary-Search', desc: 'Finds optimal quality and dimension scaling instead of blindly blurring the image.' },
      { title: 'Transparent PNG Protection', desc: 'Preserves alpha transparency with WebP or clean white blending, eliminating black borders.' },
      { title: 'Interactive Before/After Slider', desc: 'Swipe divider in real-time to inspect sharpness before saving.' },
      { title: '100% Private In-Browser', desc: 'Photos never touch a remote server; everything processes in your browser CPU/GPU.' }
    ],
    faqs: [
      { q: 'How do I compress an image to under 50KB for government forms?', a: 'Upload your photo, click the "50 KB" preset button, and click "Compress Image". HalkaPic will optimize quantization to stay within 50KB.' },
      { q: 'Is it safe to compress confidential passport and ID cards?', a: 'Yes. HalkaPic runs 100% locally in your browser memory. No data is transmitted across the internet.' }
    ],
    relatedToolIds: ['signature-resizer', 'passport-photo-maker', 'image-to-pdf', 'compress-pdf']
  },

  'image-to-pdf': {
    id: 'image-to-pdf',
    path: '/image-to-pdf',
    name: 'Image to PDF',
    badge: 'Popular',
    category: 'photo',
    shortDesc: 'Convert single or multiple photos into a clean, lightweight PDF document instantly.',
    pageTitle: 'Image to PDF Converter Free Online | HalkaPic',
    metaDescription: 'Convert JPG, JPEG, PNG, and WebP images to PDF online for free. Arrange pages, pick A4 or Fit-to-Image layout, and download combined PDF instantly.',
    h1: 'Convert Image to PDF',
    tagline: 'Merge multiple JPG, PNG, or WebP photos into one organized PDF document. 100% free and in-browser.',
    introText: 'Easily combine receipts, assignments, book pages, and ID photographs into a single PDF document. Choose between standard A4 format or Fit-to-Image margins, reorder pages with one click, and download securely.',
    howToUse: [
      { step: '1', title: 'Select Images', desc: 'Upload one or multiple JPG, PNG, or WebP images.' },
      { step: '2', title: 'Arrange Order', desc: 'Use Move Up and Move Down buttons to sequence your document pages.' },
      { step: '3', title: 'Configure Page Layout', desc: 'Select A4 Standard or Fit-to-Image and set Portrait or Landscape.' },
      { step: '4', title: 'Download PDF', desc: 'Compile in seconds and download your consolidated PDF document.' }
    ],
    keyFeatures: [
      { title: 'Multi-Image Batch Support', desc: 'Upload dozens of photos at once or append more photos at any time.' },
      { title: 'A4 & Fit-to-Image Layouts', desc: 'Standardize to printable A4 or fit exact photo aspect ratios without blank borders.' },
      { title: 'Client-Side Compilation', desc: 'Documents are assembled in your device memory with zero cloud latency.' },
      { title: 'Zero File Size Limits', desc: 'Merge without arbitrary subscription walls or file limits.' }
    ],
    faqs: [
      { q: 'Can I reorder the pages before creating the PDF?', a: 'Yes, each image card has Move Up and Move Down buttons allowing you to arrange the exact page sequence.' },
      { q: 'Will transparent PNGs have a black background in the PDF?', a: 'No, HalkaPic pre-processes images on a clean canvas with white background fill to prevent PDF transparency glitches.' }
    ],
    relatedToolIds: ['compress-pdf', 'merge-pdf', 'compress-photo', 'pdf-to-jpg']
  },

  'signature-resizer': {
    id: 'signature-resizer',
    path: '/signature-resizer',
    name: 'Signature Resizer',
    badge: 'New',
    category: 'photo',
    shortDesc: 'Resize photo signature width, height in pixels and compress to 10KB, 20KB, 50KB for online forms.',
    pageTitle: 'Signature Resizer Online to 10KB, 20KB, 50KB | HalkaPic',
    metaDescription: 'Resize signature image dimensions in pixels and compress signature file size to 10KB, 20KB, 30KB, or 50KB for online exam & government job portals.',
    h1: 'Online Signature Resizer',
    tagline: 'Resize signature dimensions in pixels and compress to exact KB limits for official exam uploads.',
    introText: 'Official competitive exams (SSC, UPSC, IBPS, Railways, NEET, State PSC, Passport Seva) enforce strict signature criteria—such as 140×60 px, between 10KB and 20KB. HalkaPic allows you to set exact pixel dimensions, maintain or customize aspect ratio, and lock your target file size in KB.',
    howToUse: [
      { step: '1', title: 'Upload Signature', desc: 'Upload your scanned signature in JPG, JPEG, PNG, or WebP format.' },
      { step: '2', title: 'Set Width & Height', desc: 'Enter required pixel dimensions (e.g. 140×60 px) or use quick exam presets.' },
      { step: '3', title: 'Pick Target File Size', desc: 'Select 10KB, 20KB, 30KB, 50KB, or enter custom KB limit.' },
      { step: '4', title: 'Preview & Download', desc: 'Check preview for crisp ink readability and download your compliant signature.' }
    ],
    keyFeatures: [
      { title: 'Exact Pixel Resizing', desc: 'Set precise width and height in pixels as mandated by application guidelines.' },
      { title: 'Aspect Ratio Lock', desc: 'Optionally lock aspect ratio to prevent stretching or unnatural squishing of signature handwriting.' },
      { title: 'Strict KB Enforcement', desc: 'Compresses signature to stay strictly under 10KB, 20KB, or 50KB without making ink illegible.' },
      { title: 'Clean Background Enhancement', desc: 'Ensures paper background is white and ink contrasts clearly without dark artifacts.' }
    ],
    faqs: [
      { q: 'What is the standard signature size for SSC and UPSC exams?', a: 'Most Indian government job portals require signatures between 140 × 60 pixels with a file size between 10 KB and 20 KB in JPG format.' },
      { q: 'Why did my signature get blurry on other websites?', a: 'Other tools reduce resolution blindly. HalkaPic adjusts canvas quantization iteratively to preserve sharp pen strokes and contrast.' }
    ],
    relatedToolIds: ['passport-photo-maker', 'compress-photo', 'image-to-pdf']
  },

  'passport-photo-maker': {
    id: 'passport-photo-maker',
    path: '/passport-photo-maker',
    name: 'Passport Photo Maker',
    badge: 'New',
    category: 'photo',
    shortDesc: 'Crop, zoom, rotate, and format photos to standard 35×45 mm or 2×2 inch passport and visa sizes.',
    pageTitle: 'Passport Size Photo Maker Online Free | HalkaPic',
    metaDescription: 'Create passport and visa size photos online. Crop, rotate, zoom, center face, and format to 35x45mm, 2x2 inch, or custom dimensions at 300 DPI.',
    h1: 'Passport Size Photo Maker',
    tagline: 'Crop, align, and format your photo into standard passport and visa specifications instantly.',
    introText: 'Create official passport-sized and visa photographs from home. Use our visual alignment guides to center your head and shoulders, zoom and rotate for a level posture, and export in 35×45 mm, 2×2 inch (51×51 mm), or custom print-ready dimensions at 300 DPI.',
    howToUse: [
      { step: '1', title: 'Upload Portrait', desc: 'Upload a clear front-facing portrait photo in JPG, PNG, or WebP.' },
      { step: '2', title: 'Choose Size Preset', desc: 'Select 35×45mm (India/Schengen/UK), 2×2 inch (US Visa), or custom dimensions.' },
      { step: '3', title: 'Align & Crop', desc: 'Drag to position, use the zoom slider, and align your face inside the guideline oval.' },
      { step: '4', title: 'Export & Download', desc: 'Choose your background fill and download your high-resolution passport photo.' }
    ],
    keyFeatures: [
      { title: 'Standard Official Presets', desc: 'Pre-configured for 35×45 mm (India, UK, Europe, Australia) and 51×51 mm / 2×2 inch (US Visa, OCI).' },
      { title: 'Interactive Head Alignment Guide', desc: 'Visual face and shoulder overlay helps you match official biometric framing rules.' },
      { title: 'High-DPI Print Quality', desc: 'Generates photos at 300 DPI print standard so printed paper photos look crystal sharp.' },
      { title: 'Clean Backdrop Options', desc: 'Fill with standard white, light blue, or neutral gray backdrops.' }
    ],
    faqs: [
      { q: 'Is this passport photo accepted by all government offices?', a: 'Note: Specific government portals (US Visa, Schengen, Passport Seva) have strict biometric guidelines regarding lighting, facial expression, and background. Always check your application rules before submission.' },
      { q: 'Can I print this photo at a local studio?', a: 'Yes! The output is exported in standard 300 DPI high resolution, perfect for digital upload or 4×6 photo printing.' }
    ],
    relatedToolIds: ['signature-resizer', 'compress-photo', 'image-to-pdf']
  },

  'compress-pdf': {
    id: 'compress-pdf',
    path: '/compress-pdf',
    name: 'Compress PDF',
    badge: 'New',
    category: 'pdf',
    shortDesc: 'Reduce PDF file size from MB to KB with Low, Medium, and High compression options.',
    pageTitle: 'Compress PDF File Online Free | HalkaPic',
    metaDescription: 'Reduce PDF file size online without losing readability. Choose Low, Medium, or High compression. 100% private in-browser PDF compressor.',
    h1: 'Compress PDF Online',
    tagline: 'Reduce large PDF documents to smaller, email-ready file sizes directly inside your browser.',
    introText: 'Scanned documents, invoices, portfolios, and multi-page forms can easily exceed upload limits of 1MB or 2MB. HalkaPic compresses PDF files locally by downsampling heavy embedded raster graphics while preserving legible text.',
    howToUse: [
      { step: '1', title: 'Upload PDF', desc: 'Select your PDF document from your device.' },
      { step: '2', title: 'Choose Compression Level', desc: 'Pick Low (highest quality), Medium (recommended), or High (maximum size reduction).' },
      { step: '3', title: 'Compress', desc: 'Our in-browser engine optimizes pages and compresses document streams.' },
      { step: '4', title: 'Download Lighter PDF', desc: 'View original vs new file size and download your compressed PDF.' }
    ],
    keyFeatures: [
      { title: 'Multiple Compression Profiles', desc: 'Three tailored profiles (Low, Medium, High) to balance crispness vs file size.' },
      { title: 'Scanned Document Optimization', desc: 'Dramatically reduces 10MB-20MB scanned paper PDFs down to a few hundred kilobytes.' },
      { title: 'Legibility Protection', desc: 'Carefully preserves minimum font rendering DPI so text remains readable.' },
      { title: 'Private & Secure', desc: 'Your confidential legal papers, tax filings, and bank statements never upload to any server.' }
    ],
    faqs: [
      { q: 'Why did my PDF not reduce significantly in size?', a: 'If your PDF contains purely vector text and fonts without large embedded images, it is already compact. Re-compressing cannot shrink vector mathematics without corrupting fonts.' },
      { q: 'Are my financial or personal PDF documents stored?', a: 'Never. HalkaPic processes all PDF bytes directly inside your web browser memory. No server uploads take place.' }
    ],
    relatedToolIds: ['merge-pdf', 'split-pdf', 'pdf-to-jpg', 'image-to-pdf']
  },

  'pdf-to-jpg': {
    id: 'pdf-to-jpg',
    path: '/pdf-to-jpg',
    name: 'PDF to JPG',
    badge: 'New',
    category: 'pdf',
    shortDesc: 'Convert PDF pages into high-resolution JPG images. Download single pages or ZIP package.',
    pageTitle: 'PDF to JPG Converter Online Free | HalkaPic',
    metaDescription: 'Convert PDF pages to high-quality JPG images online for free. Preview pages, download individual images, or save all pages in a convenient ZIP file.',
    h1: 'Convert PDF to JPG',
    tagline: 'Turn PDF document pages into high-resolution JPG images in seconds.',
    introText: 'Need to share a PDF slide on social media, extract an invoice image, or insert a PDF page into a presentation? HalkaPic converts every page of your PDF into crystal-clear JPG photos right on your phone or computer.',
    howToUse: [
      { step: '1', title: 'Upload PDF Document', desc: 'Select any PDF file from your phone, tablet, or desktop.' },
      { step: '2', title: 'Automatic Page Detection', desc: 'Our engine detects every page and renders high-definition previews.' },
      { step: '3', title: 'Preview Pages', desc: 'Scroll through rendered page thumbnails to verify content.' },
      { step: '4', title: 'Download Single or All', desc: 'Download specific page JPGs or click "Download All (ZIP)" for a packaged archive.' }
    ],
    keyFeatures: [
      { title: 'High-Resolution 2X Rendering', desc: 'Renders pages at 200% scale to ensure small text and diagrams stay sharp.' },
      { title: 'One-Click ZIP Packaging', desc: 'Converts multi-page PDFs and packages all images into a single zip download.' },
      { title: 'Individual Page Download', desc: 'Extract just the one page you need without having to save all pages.' },
      { title: 'Zero File Tracking', desc: 'Pages render on browser HTML5 Canvas; no PDF files are saved to any database.' }
    ],
    faqs: [
      { q: 'Can I convert only page 3 of my PDF to JPG?', a: 'Yes! After uploading, preview cards for every page appear with an individual "Download JPG" button for each page.' },
      { q: 'What resolution are the extracted JPG images?', a: 'Pages are rendered using high-resolution Canvas scaling (150-200 DPI equivalent) for maximum clarity.' }
    ],
    relatedToolIds: ['image-to-pdf', 'compress-pdf', 'split-pdf']
  },

  'merge-pdf': {
    id: 'merge-pdf',
    path: '/merge-pdf',
    name: 'Merge PDF',
    badge: 'New',
    category: 'pdf',
    shortDesc: 'Combine multiple PDF files into one single document in any order you choose.',
    pageTitle: 'Merge PDF Files Online Free | HalkaPic',
    metaDescription: 'Combine multiple PDF files into one single document online. Drag and reorder PDFs, remove files, and merge securely in your browser.',
    h1: 'Merge PDF Files Online',
    tagline: 'Combine multiple PDF documents into one organized file in your chosen order.',
    introText: 'Combine multiple invoices, project reports, certificates, or book chapters into a single PDF. Easily drag or click to arrange the order of documents, add more files at any point, and merge in milliseconds with complete privacy.',
    howToUse: [
      { step: '1', title: 'Upload PDFs', desc: 'Upload two or more PDF files using the file picker or drag-and-drop.' },
      { step: '2', title: 'Arrange Document Order', desc: 'Use arrow buttons to position files in the exact sequence you want them merged.' },
      { step: '3', title: 'Merge Documents', desc: 'Click "Merge PDF" to combine all pages into one continuous document.' },
      { step: '4', title: 'Download Merged PDF', desc: 'Download your unified PDF with total page count and file size confirmation.' }
    ],
    keyFeatures: [
      { title: 'Drag & Click Reordering', desc: 'Easily reorder files before merging with intuitive Move Up and Move Down controls.' },
      { title: 'Preserves Original Formatting', desc: 'Keeps original fonts, vector diagrams, bookmarks, and page orientations intact.' },
      { title: '100% In-Browser Execution', desc: 'Runs via pure WebAssembly and JS without sending files to remote servers.' },
      { title: 'Unlimited Document Pages', desc: 'Merge large multi-page reports without payment walls or limits.' }
    ],
    faqs: [
      { q: 'Will merging reduce the quality of my PDF text or diagrams?', a: 'No, PDF-Lib merges documents at the structural binary level without re-compressing or rasterizing vector text.' },
      { q: 'Can I add more PDFs after uploading the first batch?', a: 'Yes, you can click "+ Add More PDFs" at any time before merging.' }
    ],
    relatedToolIds: ['split-pdf', 'compress-pdf', 'image-to-pdf']
  },

  'split-pdf': {
    id: 'split-pdf',
    path: '/split-pdf',
    name: 'Split PDF',
    badge: 'New',
    category: 'pdf',
    shortDesc: 'Extract specific page ranges (e.g. 1-3, 5, 8) or split all pages into separate PDF files.',
    pageTitle: 'Split PDF Pages Online Free | HalkaPic',
    metaDescription: 'Split PDF files online for free. Extract custom page ranges (e.g. 1-5, 8, 10-12) or split all pages into individual PDF documents in your browser.',
    h1: 'Split PDF Document',
    tagline: 'Extract specific pages or separate a multi-page PDF into individual files.',
    introText: 'Have a 50-page PDF report but only need pages 5 through 12? Or need to separate an apartment contract into individual single-page documents? HalkaPic provides flexible range extraction and single-page splitting with instant browser validation.',
    howToUse: [
      { step: '1', title: 'Upload PDF', desc: 'Select the multi-page PDF document you want to split.' },
      { step: '2', title: 'Select Split Mode', desc: 'Choose "Extract Page Range" (e.g. 1-3, 5, 7-10) or "Extract All Pages Separately".' },
      { step: '3', title: 'Process Split', desc: 'Validate selected pages and compile output.' },
      { step: '4', title: 'Download Output', desc: 'Download your extracted PDF or individual pages packed in a ZIP archive.' }
    ],
    keyFeatures: [
      { title: 'Custom Page Range Syntax', desc: 'Flexible input supporting commas and dashes like "1-3, 5, 7-10".' },
      { title: 'Input Error Validation', desc: 'Instantly alerts if an entered page number exceeds the total pages or is malformed.' },
      { title: 'Split All to ZIP', desc: 'Splits an entire document into individual 1-page PDFs packaged in a zip download.' },
      { title: 'Zero Server Storage', desc: 'Runs locally inside browser memory; your private PDFs are never shared.' }
    ],
    faqs: [
      { q: 'How do I specify which pages to extract?', a: 'Type page numbers or ranges separated by commas, for example "1-4, 7, 9-12".' },
      { q: 'Can I extract a single page from a PDF?', a: 'Yes, simply enter the page number (e.g. "4") and HalkaPic will export a single-page PDF containing just page 4.' }
    ],
    relatedToolIds: ['merge-pdf', 'compress-pdf', 'pdf-to-jpg']
  }
};

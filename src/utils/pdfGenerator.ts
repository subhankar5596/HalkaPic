import { jsPDF } from 'jspdf';
import { PdfImageItem, PdfOptions, PdfResult, PdfGenerationProgress } from '../types/pdf';
import { loadImage } from './imageCompressor';

/**
 * Renders an image to a canvas and returns a high-compatibility DataURL (JPEG or PNG)
 */
async function prepareImageDataUrl(
  fileOrBlob: Blob | File
): Promise<{ dataUrl: string; format: 'JPEG' | 'PNG'; width: number; height: number }> {
  const img = await loadImage(fileOrBlob);
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context.');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw clean white background to prevent black backgrounds on transparent PNGs/WebP
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  return { dataUrl, format: 'JPEG', width, height };
}

/**
 * Converts multiple images into a single cohesive PDF document in-browser.
 */
export async function convertImagesToPdf(
  items: PdfImageItem[],
  options: PdfOptions,
  onProgress?: (progress: PdfGenerationProgress) => void
): Promise<PdfResult> {
  if (items.length === 0) {
    throw new Error('No images selected for PDF generation.');
  }

  const totalPages = items.length;
  let doc: jsPDF | null = null;

  for (let i = 0; i < totalPages; i++) {
    const item = items[i];
    onProgress?.({
      isGenerating: true,
      currentPage: i + 1,
      totalPages,
      stepMessage: `Processing page ${i + 1} of ${totalPages}: ${item.name}`,
    });

    // Micro-delay to let UI update smoothly
    await new Promise((resolve) => setTimeout(resolve, 15));

    const { dataUrl, format, width, height } = await prepareImageDataUrl(item.file);

    // Determine Orientation
    let orientation: 'p' | 'l' = 'p';
    if (options.orientation === 'landscape') {
      orientation = 'l';
    } else if (options.orientation === 'portrait') {
      orientation = 'p';
    } else {
      // Auto: match image aspect ratio
      orientation = width > height ? 'l' : 'p';
    }

    if (options.pageSize === 'a4') {
      // Standard A4 dimensions in mm: 210 x 297
      const pageW = orientation === 'p' ? 210 : 297;
      const pageH = orientation === 'p' ? 297 : 210;
      const margin = options.margin === 'small' ? 10 : 0;

      const availW = pageW - 2 * margin;
      const availH = pageH - 2 * margin;

      const imgAspect = width / height;
      const availAspect = availW / availH;

      let drawW: number;
      let drawH: number;

      if (imgAspect > availAspect) {
        drawW = availW;
        drawH = availW / imgAspect;
      } else {
        drawH = availH;
        drawW = availH * imgAspect;
      }

      const drawX = margin + (availW - drawW) / 2;
      const drawY = margin + (availH - drawH) / 2;

      if (!doc) {
        doc = new jsPDF({
          orientation,
          unit: 'mm',
          format: 'a4',
          compress: true,
        });
      } else {
        doc.addPage('a4', orientation);
      }

      doc.addImage(dataUrl, format, drawX, drawY, drawW, drawH, undefined, 'FAST');
    } else {
      // 'fit' mode: Exact image dimensions in points
      // 1px approx 0.75 points (72 / 96 DPI)
      const ptW = width * 0.75;
      const ptH = height * 0.75;

      if (!doc) {
        doc = new jsPDF({
          orientation: ptW > ptH ? 'l' : 'p',
          unit: 'pt',
          format: [ptW, ptH],
          compress: true,
        });
      } else {
        doc.addPage([ptW, ptH], ptW > ptH ? 'l' : 'p');
      }

      doc.addImage(dataUrl, format, 0, 0, ptW, ptH, undefined, 'FAST');
    }
  }

  if (!doc) {
    throw new Error('Failed to initialize PDF document.');
  }

  onProgress?.({
    isGenerating: true,
    currentPage: totalPages,
    totalPages,
    stepMessage: 'Finalizing PDF output...',
  });

  const blob = doc.output('blob');
  const objectUrl = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `halkapic-document-${dateStr}.pdf`;

  return {
    blob,
    objectUrl,
    size: blob.size,
    pageCount: totalPages,
    filename,
  };
}

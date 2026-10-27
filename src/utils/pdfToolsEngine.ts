import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { pdfjsLib } from './pdfWorker';

export interface PdfPageJpg {
  pageNumber: number;
  blob: Blob;
  objectUrl: string;
  width: number;
  height: number;
  size: number;
}

export interface MergePdfResult {
  blob: Blob;
  objectUrl: string;
  pageCount: number;
  size: number;
  filename: string;
}

export interface SplitPdfResult {
  blob: Blob;
  objectUrl: string;
  pageCount: number;
  size: number;
  filename: string;
  isZip?: boolean;
}

export interface CompressPdfResult {
  blob: Blob;
  objectUrl: string;
  originalSize: number;
  compressedSize: number;
  savedPercentage: number;
  pageCount: number;
  cannotReduceFurther: boolean;
  statusNote?: string;
  filename: string;
}

/**
 * Loads a PDF file and returns the total page count.
 */
export async function getPdfPageCount(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  return pdf.numPages;
}

/**
 * Converts all or selected pages of a PDF into high-quality JPG blobs.
 */
export async function renderPdfToJpgs(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<PdfPageJpg[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;
  const results: PdfPageJpg[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    onProgress?.(pageNum, totalPages);
    const page = await pdf.getPage(pageNum);

    // Render at 2x scale for sharp text and fine lines
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context.');

    // White background for pages
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport,
      background: 'white',
    }).promise;

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error(`Failed to convert page ${pageNum} to JPG.`));
        },
        'image/jpeg',
        0.92
      );
    });

    const objectUrl = URL.createObjectURL(blob);
    results.push({
      pageNumber: pageNum,
      blob,
      objectUrl,
      width: canvas.width,
      height: canvas.height,
      size: blob.size,
    });
  }

  return results;
}

/**
 * Packages an array of images or PDF blobs into a downloadable ZIP archive.
 */
export async function packageBlobsToZip(
  items: { filename: string; blob: Blob }[],
  zipFilename: string = 'halkapic-archive.zip'
): Promise<{ blob: Blob; objectUrl: string; filename: string }> {
  const zip = new JSZip();

  for (const item of items) {
    zip.file(item.filename, item.blob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const objectUrl = URL.createObjectURL(zipBlob);

  return {
    blob: zipBlob,
    objectUrl,
    filename: zipFilename,
  };
}

/**
 * Merges multiple PDF files in the order provided into a single PDF document.
 */
export async function mergePdfFiles(
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<MergePdfResult> {
  if (files.length === 0) throw new Error('No PDF files selected to merge.');

  const mergedDoc = await PDFDocument.create();
  let totalPages = 0;

  for (let i = 0; i < files.length; i++) {
    onProgress?.(i + 1, files.length);
    const file = files[i];
    const arrayBuffer = await file.arrayBuffer();
    const sourceDoc = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedDoc.copyPages(sourceDoc, sourceDoc.getPageIndices());

    for (const page of copiedPages) {
      mergedDoc.addPage(page);
      totalPages++;
    }
  }

  const pdfBytes = await mergedDoc.save();
  const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
  const objectUrl = URL.createObjectURL(blob);

  return {
    blob,
    objectUrl,
    pageCount: totalPages,
    size: blob.size,
    filename: 'halkapic-merged.pdf',
  };
}

/**
 * Parses user range strings like "1-3, 5, 7-10" into sorted 0-indexed page indices.
 */
export function parsePageRanges(rangeStr: string, totalPages: number): number[] {
  if (!rangeStr.trim()) {
    throw new Error('Please enter at least one page number or range (e.g. 1-3, 5).');
  }

  const parts = rangeStr.split(',');
  const selectedSet = new Set<number>();

  for (const rawPart of parts) {
    const part = rawPart.trim();
    if (!part) continue;

    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr?.trim(), 10);
      const end = parseInt(endStr?.trim(), 10);

      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Invalid range format: "${part}". Use numbers like "1-5".`);
      }
      if (start <= 0 || end <= 0) {
        throw new Error(`Page numbers must be 1 or higher. Found: "${part}".`);
      }
      if (start > totalPages || end > totalPages) {
        throw new Error(`Range "${part}" exceeds total document pages (${totalPages}).`);
      }
      if (start > end) {
        throw new Error(`Start page cannot be greater than end page in "${part}".`);
      }

      for (let p = start; p <= end; p++) {
        selectedSet.add(p - 1);
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (isNaN(pageNum)) {
        throw new Error(`"${part}" is not a valid page number.`);
      }
      if (pageNum <= 0) {
        throw new Error('Page numbers must be 1 or higher.');
      }
      if (pageNum > totalPages) {
        throw new Error(`Page ${pageNum} exceeds total pages (${totalPages}).`);
      }
      selectedSet.add(pageNum - 1);
    }
  }

  const indices = Array.from(selectedSet).sort((a, b) => a - b);
  if (indices.length === 0) {
    throw new Error('No valid pages found in the entered range.');
  }

  return indices;
}

/**
 * Extracts specified page ranges from a PDF into a single new PDF document.
 */
export async function extractPdfPages(
  file: File,
  pageIndices: number[]
): Promise<SplitPdfResult> {
  const arrayBuffer = await file.arrayBuffer();
  const sourceDoc = await PDFDocument.load(arrayBuffer);
  const newDoc = await PDFDocument.create();

  const copiedPages = await newDoc.copyPages(sourceDoc, pageIndices);
  for (const page of copiedPages) {
    newDoc.addPage(page);
  }

  const pdfBytes = await newDoc.save();
  const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
  const objectUrl = URL.createObjectURL(blob);

  return {
    blob,
    objectUrl,
    pageCount: pageIndices.length,
    size: blob.size,
    filename: `halkapic-split-extracted-${pageIndices.length}pages.pdf`,
  };
}

/**
 * Splits a PDF into individual 1-page PDF files bundled into a ZIP archive.
 */
export async function splitAllPdfPagesToZip(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<SplitPdfResult> {
  const arrayBuffer = await file.arrayBuffer();
  const sourceDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = sourceDoc.getPageCount();
  const zip = new JSZip();

  for (let i = 0; i < totalPages; i++) {
    onProgress?.(i + 1, totalPages);
    const singleDoc = await PDFDocument.create();
    const [page] = await singleDoc.copyPages(sourceDoc, [i]);
    singleDoc.addPage(page);
    const pdfBytes = await singleDoc.save();
    zip.file(`page-${i + 1}.pdf`, pdfBytes);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const objectUrl = URL.createObjectURL(zipBlob);

  return {
    blob: zipBlob,
    objectUrl,
    pageCount: totalPages,
    size: zipBlob.size,
    filename: 'halkapic-split-pages.zip',
    isZip: true,
  };
}

/**
 * Compresses a PDF file using intelligent rasterization of embedded pages.
 */
export async function compressPdfFile(
  file: File,
  profile: 'low' | 'medium' | 'high' = 'medium',
  onProgress?: (current: number, total: number) => void
): Promise<CompressPdfResult> {
  const originalSize = file.size;
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;

  // Profile quantization settings
  let scale = 1.25;
  let quality = 0.65;

  if (profile === 'low') {
    scale = 1.6;
    quality = 0.82;
  } else if (profile === 'high') {
    scale = 1.0;
    quality = 0.45;
  }

  let doc: jsPDF | null = null;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    onProgress?.(pageNum, totalPages);
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context.');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport,
      background: 'white',
    }).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', quality);

    // Orientation based on aspect ratio
    const isLandscape = canvas.width > canvas.height;
    const orientation = isLandscape ? 'l' : 'p';

    // Pt dimensions: 1px at 72dpi = 0.75 pt
    const ptW = (canvas.width / scale) * 0.75;
    const ptH = (canvas.height / scale) * 0.75;

    if (!doc) {
      doc = new jsPDF({
        orientation,
        unit: 'pt',
        format: [ptW, ptH],
        compress: true,
      });
    } else {
      doc.addPage([ptW, ptH], orientation);
    }

    doc.addImage(dataUrl, 'JPEG', 0, 0, ptW, ptH, undefined, 'FAST');
  }

  if (!doc) throw new Error('Failed to initialize compressed PDF document.');

  const compressedBlob = doc.output('blob');
  const compressedSize = compressedBlob.size;

  let cannotReduceFurther = false;
  let statusNote: string | undefined;
  let finalBlob = compressedBlob;

  if (compressedSize >= originalSize * 0.95) {
    // If the original PDF was already a lightweight vector PDF or highly compressed,
    // re-compressing raster pages didn't save size. Explain honestly to the user!
    cannotReduceFurther = true;
    statusNote =
      'This document contains mostly vector text or is already heavily optimized. Further compression would increase file size or degrade text, so the original file size is already optimal.';
    finalBlob = file;
  } else {
    statusNote = `Successfully reduced PDF from ${(originalSize / 1024 / 1024).toFixed(2)} MB to ${(
      compressedSize /
      1024 /
      1024
    ).toFixed(2)} MB.`;
  }

  const savedBytes = Math.max(0, originalSize - finalBlob.size);
  const savedPercentage = Math.max(0, Math.round((savedBytes / originalSize) * 100));
  const objectUrl = URL.createObjectURL(finalBlob);

  return {
    blob: finalBlob,
    objectUrl,
    originalSize,
    compressedSize: finalBlob.size,
    savedPercentage,
    pageCount: totalPages,
    cannotReduceFurther,
    statusNote,
    filename: 'halkapic-compressed.pdf',
  };
}

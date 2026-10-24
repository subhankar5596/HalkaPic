export interface PdfImageItem {
  id: string;
  file: File;
  name: string;
  size: number; // bytes
  width: number;
  height: number;
  formatLabel: string;
  objectUrl: string;
}

export type PdfPageSize = 'a4' | 'fit';
export type PdfOrientation = 'portrait' | 'landscape' | 'auto';
export type PdfMargin = 'none' | 'small';

export interface PdfOptions {
  pageSize: PdfPageSize;
  orientation: PdfOrientation;
  margin: PdfMargin;
}

export interface PdfGenerationProgress {
  isGenerating: boolean;
  currentPage: number;
  totalPages: number;
  stepMessage: string;
}

export interface PdfResult {
  blob: Blob;
  objectUrl: string;
  size: number;
  pageCount: number;
  filename: string;
}

import { loadImage } from './imageCompressor';

export interface PassportPreset {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  description: string;
}

export const PASSPORT_PRESETS: PassportPreset[] = [
  {
    id: 'india-standard',
    name: '35 × 45 mm (India, UK, Schengen, UPSC, SSC)',
    widthMm: 35,
    heightMm: 45,
    description: 'Standard passport & exam photo size across India, UK, and European Union.',
  },
  {
    id: 'us-visa',
    name: '2 × 2 inch / 51 × 51 mm (US Visa, OCI, US Passport)',
    widthMm: 51,
    heightMm: 51,
    description: 'Square photo size required for United States Visas, US Passports, and OCI cards.',
  },
  {
    id: 'pan-card',
    name: '25 × 35 mm (India PAN Card / Stamp Size)',
    widthMm: 25,
    heightMm: 35,
    description: 'Used for NSDL / UTIITSL Indian PAN Card applications and identity cards.',
  },
  {
    id: 'square-35',
    name: '35 × 35 mm (Square Format)',
    widthMm: 35,
    heightMm: 35,
    description: 'Used for certain state government admissions and driver licenses.',
  },
];

export interface PassportRenderOptions {
  widthPx: number;
  heightPx: number;
  zoom: number; // 0.5 to 3.0
  rotation: number; // degrees -180 to 180
  offsetX: number; // pan x in pixels
  offsetY: number; // pan y in pixels
  backgroundColor: 'white' | 'light-blue' | 'light-gray' | 'original';
  addBorder: boolean;
  format: 'image/jpeg' | 'image/png';
}

export interface PassportRenderResult {
  blob: Blob;
  objectUrl: string;
  widthPx: number;
  heightPx: number;
  size: number;
  filename: string;
}

/**
 * Converts mm to pixels at specified DPI (default: 300 DPI for studio photo prints)
 */
export function mmToPixels(mm: number, dpi: number = 300): number {
  return Math.round((mm / 25.4) * dpi);
}

/**
 * Converts cm to pixels at specified DPI
 */
export function cmToPixels(cm: number, dpi: number = 300): number {
  return mmToPixels(cm * 10, dpi);
}

/**
 * Renders the adjusted photo into final passport dimensions with zoom, pan, rotation, and background.
 */
export async function renderPassportPhoto(
  fileOrBlob: File | Blob,
  options: PassportRenderOptions
): Promise<PassportRenderResult> {
  const img = await loadImage(fileOrBlob);

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(100, Math.round(options.widthPx));
  canvas.height = Math.max(100, Math.round(options.heightPx));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context.');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Background fill
  if (options.backgroundColor === 'white') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (options.backgroundColor === 'light-blue') {
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (options.backgroundColor === 'light-gray') {
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    // Original backdrop / transparent canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  ctx.save();

  // Move origin to center of destination canvas
  ctx.translate(canvas.width / 2 + options.offsetX, canvas.height / 2 + options.offsetY);

  // Apply rotation
  ctx.rotate((options.rotation * Math.PI) / 180);

  // Calculate base scale to fill canvas
  const scaleToFit = Math.max(canvas.width / img.width, canvas.height / img.height);
  const finalScale = scaleToFit * options.zoom;

  const drawW = img.width * finalScale;
  const drawH = img.height * finalScale;

  // Draw centered
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

  ctx.restore();

  // Optional 1px clean border for printing & cutting guide
  if (options.addBorder) {
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
  }

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to render passport photo.'));
      },
      options.format,
      0.95
    );
  });

  const objectUrl = URL.createObjectURL(blob);
  const ext = options.format === 'image/png' ? 'png' : 'jpg';
  const filename = `halkapic-passport-${canvas.width}x${canvas.height}.${ext}`;

  return {
    blob,
    objectUrl,
    widthPx: canvas.width,
    heightPx: canvas.height,
    size: blob.size,
    filename,
  };
}

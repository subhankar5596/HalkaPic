import { loadImage } from './imageCompressor';

export interface SignatureResizeOptions {
  width: number;
  height: number;
  targetKB: number;
  format: 'image/jpeg' | 'image/png';
  cleanWhiteBackground: boolean;
}

export interface SignatureResizeResult {
  blob: Blob;
  objectUrl: string;
  width: number;
  height: number;
  size: number; // bytes
  filename: string;
  achievedKB: number;
  qualityUsed: number;
}

/**
 * Resizes a signature image to exact pixel dimensions and optimizes quality to hit target KB.
 */
export async function resizeSignature(
  fileOrBlob: File | Blob,
  options: SignatureResizeOptions
): Promise<SignatureResizeResult> {
  const img = await loadImage(fileOrBlob);
  const targetBytes = Math.max(3 * 1024, options.targetKB * 1024);

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(16, Math.round(options.width));
  canvas.height = Math.max(16, Math.round(options.height));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize canvas context.');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (options.cleanWhiteBackground || options.format === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Draw image scaled to requested width and height
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const toBlobPromise = (q: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create signature blob.'));
        },
        options.format,
        q
      );
    });
  };

  if (options.format === 'image/png') {
    // PNG format (lossless)
    const blob = await toBlobPromise(1.0);
    const objectUrl = URL.createObjectURL(blob);
    const achievedKB = Math.round(blob.size / 1024);
    return {
      blob,
      objectUrl,
      width: canvas.width,
      height: canvas.height,
      size: blob.size,
      filename: `halkapic-signature-${canvas.width}x${canvas.height}.png`,
      achievedKB,
      qualityUsed: 100,
    };
  }

  // JPEG format: Binary search quality to hit target KB
  let minQ = 0.15;
  let maxQ = 0.95;
  let bestBlob: Blob | null = null;
  let bestQuality = 0.85;

  for (let i = 0; i < 7; i++) {
    const midQ = (minQ + maxQ) / 2;
    const blob = await toBlobPromise(midQ);

    if (blob.size <= targetBytes) {
      bestBlob = blob;
      bestQuality = midQ;
      minQ = midQ; // try to get better quality while staying under target
    } else {
      maxQ = midQ;
    }
  }

  if (!bestBlob) {
    // If even at minQ it's larger than target, use lowest tested
    bestBlob = await toBlobPromise(0.15);
    bestQuality = 0.15;
  }

  const objectUrl = URL.createObjectURL(bestBlob);
  const achievedKB = Math.round(bestBlob.size / 1024);
  const filename = `halkapic-signature-${canvas.width}x${canvas.height}-${achievedKB}kb.jpg`;

  return {
    blob: bestBlob,
    objectUrl,
    width: canvas.width,
    height: canvas.height,
    size: bestBlob.size,
    filename,
    achievedKB,
    qualityUsed: Math.round(bestQuality * 100),
  };
}

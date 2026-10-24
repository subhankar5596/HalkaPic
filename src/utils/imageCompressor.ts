import { CompressionOptions, CompressionProgressState, CompressionResult, UploadedImageInfo } from '../types';

/**
 * Loads a File or Blob into an HTMLImageElement
 */
export function loadImage(fileOrBlob: Blob | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(fileOrBlob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image. The file may be corrupted or in an unsupported format.'));
    };

    img.src = url;
  });
}

/**
 * Check if an image contains transparency (alpha channel < 255)
 */
export function detectTransparency(img: HTMLImageElement): boolean {
  try {
    const canvas = document.createElement('canvas');
    // Sample down for quick alpha check
    const sampleWidth = Math.min(img.width, 200);
    const sampleHeight = Math.min(img.height, 200);
    canvas.width = sampleWidth;
    canvas.height = sampleHeight;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return false;

    ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
    const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
    const data = imageData.data;

    // Check every 4th byte (alpha)
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 250) {
        return true;
      }
    }
    return false;
  } catch (e) {
    // Canvas tainted or not readable
    return false;
  }
}

/**
 * Convert canvas to Blob with promise
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image blob from canvas.'));
        }
      },
      type,
      quality
    );
  });
}

/**
 * High-performance smart iterative image compressor.
 * Adjusts quality and/or dimensions using binary search to reach the target KB.
 */
export async function compressImage(
  imageInfo: UploadedImageInfo,
  options: CompressionOptions,
  onProgress?: (progress: CompressionProgressState) => void
): Promise<CompressionResult> {
  const startTime = performance.now();
  const targetBytes = Math.max(5 * 1024, options.targetKB * 1024); // at least 5 KB

  onProgress?.({
    isCompressing: true,
    stepMessage: 'Reading image data...',
    currentAttempt: 0,
    maxAttempts: 10,
  });

  const img = await loadImage(imageInfo.file);
  const origW = img.width;
  const origH = img.height;
  const hasAlpha = imageInfo.hasAlpha ?? detectTransparency(img);

  // Decide MIME type & extension
  let mimeType = 'image/jpeg';
  let extension = 'jpg';

  if (hasAlpha) {
    // If image has transparency, use WebP so alpha is preserved losslessly while RGB is compressed lossily!
    // Or if preferredFormat is explicitly set
    mimeType = 'image/webp';
    extension = 'webp';
  } else if (imageInfo.type === 'image/webp') {
    mimeType = 'image/webp';
    extension = 'webp';
  } else {
    mimeType = 'image/jpeg';
    extension = 'jpg';
  }

  // Helper to render image onto canvas at specified scale and background
  const renderCanvas = (scale: number): { canvas: HTMLCanvasElement; width: number; height: number } => {
    const width = Math.max(32, Math.round(origW * scale));
    const height = Math.max(32, Math.round(origH * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context.');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (mimeType === 'image/jpeg' || (!hasAlpha && mimeType !== 'image/png')) {
      // Clean white background to prevent black background bugs if there are unexpected transparent pixels
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    ctx.drawImage(img, 0, 0, width, height);
    return { canvas, width, height };
  };

  interface Candidate {
    blob: Blob;
    width: number;
    height: number;
    quality: number;
    scale: number;
    size: number;
  }

  let attempts = 0;
  const maxAttempts = 10;
  let bestUnderTarget: Candidate | null = null;
  let bestOverall: Candidate | null = null;

  // Small delay to allow UI to render smoothly
  const yieldUI = () => new Promise((resolve) => setTimeout(resolve, 10));

  // Trial runner
  const testCandidate = async (scale: number, quality: number): Promise<Candidate> => {
    attempts++;
    const { canvas, width, height } = renderCanvas(scale);
    const clampedQ = Math.max(0.05, Math.min(0.95, quality));
    const blob = await canvasToBlob(canvas, mimeType, clampedQ);
    const size = blob.size;

    const candidate: Candidate = {
      blob,
      width,
      height,
      quality: clampedQ,
      scale,
      size,
    };

    onProgress?.({
      isCompressing: true,
      stepMessage: `Optimizing: ${Math.round(size / 1024)} KB (Attempt ${attempts}/${maxAttempts})...`,
      currentAttempt: attempts,
      maxAttempts,
      currentSizeKB: Math.round(size / 1024),
    });

    // Track best candidates
    if (size <= targetBytes) {
      if (!bestUnderTarget || size > bestUnderTarget.size) {
        bestUnderTarget = candidate;
      }
    }

    if (!bestOverall) {
      bestOverall = candidate;
    } else {
      const currentDiff = Math.abs(size - targetBytes);
      const bestDiff = Math.abs(bestOverall.size - targetBytes);
      if (currentDiff < bestDiff) {
        bestOverall = candidate;
      }
    }

    await yieldUI();
    return candidate;
  };

  // Step 1: Test full resolution at high quality (0.85)
  let currentScale = 1.0;
  let initialCandidate = await testCandidate(currentScale, 0.85);

  if (initialCandidate.size <= targetBytes) {
    // If already under target at 0.85, let's see if we can push to 0.92 for even better crispness
    const highQ = await testCandidate(currentScale, 0.92);
    if (highQ.size <= targetBytes) {
      bestUnderTarget = highQ;
    }
  } else {
    // Initial candidate is larger than target.
    // Test lowest reasonable quality at full resolution (0.15) to see if dimension reduction is required.
    const lowQCandidate = await testCandidate(currentScale, 0.15);

    if (lowQCandidate.size <= targetBytes) {
      // Target is achievable by adjusting quality alone!
      // Binary search quality between 0.15 and 0.85
      let minQ = 0.15;
      let maxQ = 0.85;

      for (let i = 0; i < 4 && attempts < maxAttempts; i++) {
        const midQ = (minQ + maxQ) / 2;
        const cand = await testCandidate(currentScale, midQ);

        if (cand.size > targetBytes) {
          maxQ = midQ;
        } else {
          minQ = midQ;
          // If we are within 5% of target, stop early!
          if (cand.size >= targetBytes * 0.92) {
            break;
          }
        }
      }
    } else {
      // Even at 0.15 quality, the file is still larger than targetBytes.
      // We must scale down resolution to hit the target.
      // Estimate scale factor based on area ratio: size ~ width * height
      const currentMinSize = lowQCandidate.size;
      const areaRatio = targetBytes / currentMinSize;
      let estimatedScale = Math.min(0.9, Math.sqrt(areaRatio) * 1.08);
      estimatedScale = Math.max(0.1, estimatedScale);

      // Binary search over scale with a crisp, pleasing quality (e.g. 0.70)
      let minScale = 0.08;
      let maxScale = 0.95;
      currentScale = estimatedScale;

      for (let i = 0; i < 4 && attempts < maxAttempts; i++) {
        const cand = await testCandidate(currentScale, 0.72);

        if (cand.size > targetBytes) {
          maxScale = currentScale;
          currentScale = (minScale + currentScale) / 2;
        } else {
          minScale = currentScale;
          // If we got within 10% under target, fine-tune quality up slightly
          if (cand.size >= targetBytes * 0.85) {
            break;
          }
          currentScale = (currentScale + maxScale) / 2;
        }
      }

      // Final fine-tune if candidate is still under target
      if (bestUnderTarget && bestUnderTarget.size < targetBytes * 0.75 && attempts < maxAttempts) {
        await testCandidate(bestUnderTarget.scale, Math.min(0.92, bestUnderTarget.quality + 0.15));
      }
    }
  }

  // Selected candidate
  const chosen = bestUnderTarget || bestOverall || initialCandidate;
  const durationMs = Math.round(performance.now() - startTime);

  const savedBytes = imageInfo.size - chosen.size;
  const savedPercentage = Math.max(0, Math.round((savedBytes / imageInfo.size) * 100));

  const isClosestAchievable = chosen.size > targetBytes * 1.05 || chosen.size < targetBytes * 0.5;

  let warningNotice: string | undefined;
  if (chosen.scale < 0.45 || chosen.quality < 0.3) {
    warningNotice = 'This target size required significant reduction in resolution or quality to fit under the target.';
  }

  let statusNote: string | undefined;
  if (hasAlpha) {
    statusNote = 'Preserved alpha transparency cleanly using WebP format.';
  } else if (chosen.size > targetBytes) {
    statusNote = `Closest achievable result (${Math.round(chosen.size / 1024)} KB) without extreme distortion.`;
  }

  const resultObjectUrl = URL.createObjectURL(chosen.blob);

  return {
    blob: chosen.blob,
    objectUrl: resultObjectUrl,
    size: chosen.size,
    width: chosen.width,
    height: chosen.height,
    format: mimeType,
    extension,
    savedPercentage,
    durationMs,
    attemptsCount: attempts,
    qualityUsed: Math.round(chosen.quality * 100),
    scaleUsed: Math.round(chosen.scale * 100),
    targetKB: options.targetKB,
    isClosestAchievable,
    statusNote,
    warningNotice,
  };
}

/**
 * Validate user-uploaded file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const ext = file.name.split('.').pop()?.toLowerCase();
  const supportedExts = ['jpg', 'jpeg', 'png', 'webp'];

  const typeMatches = supportedTypes.includes(file.type);
  const extMatches = ext ? supportedExts.includes(ext) : false;

  if (!typeMatches && !extMatches) {
    return {
      valid: false,
      error: `Unsupported format "${ext || file.type}". HalkaPic supports JPG, JPEG, PNG, and WebP photos.`,
    };
  }

  // Check reasonable size limit (e.g. 50 MB max for browser memory protection)
  const maxBytes = 50 * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: 'File size exceeds 50 MB. Please select a smaller photo for smooth browser compression.',
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'The uploaded file is empty (0 bytes).',
    };
  }

  return { valid: true };
}

/**
 * Read file metadata and create UploadedImageInfo
 */
export async function extractImageInfo(file: File): Promise<UploadedImageInfo> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const img = await loadImage(file);
  const hasAlpha = detectTransparency(img);

  let formatLabel = 'JPEG';
  const typeLower = (file.type || '').toLowerCase();
  const nameLower = file.name.toLowerCase();

  if (typeLower.includes('png') || nameLower.endsWith('.png')) {
    formatLabel = 'PNG';
  } else if (typeLower.includes('webp') || nameLower.endsWith('.webp')) {
    formatLabel = 'WebP';
  } else if (typeLower.includes('jpeg') || nameLower.endsWith('.jpeg')) {
    formatLabel = 'JPEG';
  } else if (typeLower.includes('jpg') || nameLower.endsWith('.jpg')) {
    formatLabel = 'JPG';
  }

  const objectUrl = URL.createObjectURL(file);

  return {
    file,
    name: file.name,
    size: file.size,
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
    type: file.type || 'image/jpeg',
    formatLabel,
    objectUrl,
    hasAlpha,
  };
}

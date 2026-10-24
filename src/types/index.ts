export interface UploadedImageInfo {
  file: File;
  name: string;
  size: number; // in bytes
  width: number;
  height: number;
  type: string; // mime-type e.g. 'image/jpeg'
  formatLabel: string; // 'JPEG', 'PNG', 'WebP'
  objectUrl: string;
  hasAlpha?: boolean; // detected transparency for PNG
}

export type PresetTargetKB = 20 | 50 | 100 | 200 | 500;

export interface CompressionOptions {
  targetKB: number;
  preserveTransparency: boolean;
  preferredFormat?: 'image/jpeg' | 'image/webp' | 'image/png';
}

export interface CompressionProgressState {
  isCompressing: boolean;
  stepMessage: string;
  currentAttempt: number;
  maxAttempts: number;
  currentSizeKB?: number;
}

export interface CompressionResult {
  blob: Blob;
  objectUrl: string;
  size: number; // bytes
  width: number;
  height: number;
  format: string; // mime-type
  extension: string; // 'jpg', 'webp', 'png'
  savedPercentage: number;
  durationMs: number;
  attemptsCount: number;
  qualityUsed: number;
  scaleUsed: number;
  targetKB: number;
  isClosestAchievable: boolean;
  statusNote?: string;
  warningNotice?: string;
}

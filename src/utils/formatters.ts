/**
 * Format bytes to human readable string (e.g. 2.8 MB, 98 KB, 450 B)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeI = Math.min(i, sizes.length - 1);

  const value = (bytes / Math.pow(k, safeI)).toFixed(dm);
  // remove trailing zero if integer-like (e.g. 20.0 KB -> 20 KB)
  const cleanValue = parseFloat(value).toString();
  return `${cleanValue} ${sizes[safeI]}`;
}

/**
 * Format resolution (e.g. 4000 × 3000)
 */
export function formatDimensions(width: number, height: number): string {
  return `${width} × ${height}`;
}

/**
 * Generate sensible download filename: e.g. "halkapic-photo-98kb.jpg"
 */
export function generateDownloadFilename(
  originalName: string,
  targetKB: number,
  extension: string = 'jpg'
): string {
  // Strip original extension
  const base = originalName.replace(/\.[^/.]+$/, '').trim();
  const sanitized = base
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30);

  const cleanExt = extension.replace(/^\./, '');
  return `halkapic-${sanitized || 'image'}-${targetKB}kb.${cleanExt}`;
}

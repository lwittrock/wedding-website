// compressImage.ts
// Client-side image optimization before upload.
//
// Goal: keep print quality (full resolution for normal phone photos) while
// shrinking file size so uploads are fast on mobile and stay safely under
// Cloudinary's free-tier 10 MB image ceiling.
//
// Strategy: re-encode to high-quality JPEG. Resolution is only reduced if the
// photo exceeds MAX_DIMENSION (48 MP shots, panoramas) or if quality alone
// can't get it under the size cap. Files that are already small are left
// untouched — re-encoding them wastes time and can make them larger.

import imageCompression from 'browser-image-compression';

// Stay comfortably under the free-tier 10 MB limit.
const TARGET_MAX_MB = 9;
// Long-edge cap. Covers default phone photos (12 MP = 4032px) at full
// resolution; only ultra-high-res images get downscaled.
const MAX_DIMENSION = 4096;
const QUALITY = 0.85;
// Below this, the file is already fast to upload — skip re-encoding.
const SKIP_BELOW_BYTES = 1 * 1024 * 1024;

// Serialize the heavy work: only one image is decoded/re-encoded at a time
// across all concurrent uploads. A 48 MP photo decodes to ~190 MB, so running
// several at once can crash mobile Safari's tab or freeze the UI. Uploads still
// run in parallel — compression is fast enough to stay ahead of the network.
let compressionLock: Promise<unknown> = Promise.resolve();

export async function compressImage(file: File): Promise<File> {
  // Non-images (shouldn't happen — we filter on selection) pass through.
  if (!file.type.startsWith('image/')) return file;

  // Already small enough that optimizing buys nothing.
  if (file.size <= SKIP_BELOW_BYTES) return file;

  // Queue behind any in-flight compression; keep the chain alive on rejection.
  const run = compressionLock.then(() => reencode(file));
  compressionLock = run.catch(() => {});
  return run;
}

// The actual decode/re-encode. Always resolves (falls back to the original on
// failure), so it never breaks the serialization chain above.
async function reencode(file: File): Promise<File> {
  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: TARGET_MAX_MB,
      maxWidthOrHeight: MAX_DIMENSION,
      initialQuality: QUALITY,
      // Only drop quality to meet the size cap — never sacrifice resolution
      // beyond the MAX_DIMENSION downscale above.
      alwaysKeepResolution: true,
      useWebWorker: true,
      fileType: 'image/jpeg',
      // Carry the original EXIF (capture date, GPS, camera info) into the
      // re-encoded file so the final gallery can be sorted by when shots were
      // actually taken. The library copies EXIF *without* the orientation tag
      // (orientation is already baked into the pixels), so there's no
      // double-rotation. Note: this only applies when the source is already
      // JPEG — the common iOS case, since Safari converts HEIC→JPEG on pick.
      preserveExif: true,
    });

    // Guard against the rare case where re-encoding produced a larger file.
    if (compressed.size >= file.size) return file;

    // browser-image-compression may hand back a Blob; normalize to a File so
    // FormData keeps a sensible filename.
    if (!(compressed instanceof File)) {
      const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
      return new File([compressed], `${baseName}.jpg`, {
        type: 'image/jpeg',
        lastModified: file.lastModified,
      });
    }

    return compressed;
  } catch (err) {
    // e.g. an undecodable HEIC outside iOS. Fall back to the original; the
    // upload step still tries it, and Cloudinary may accept it server-side.
    console.warn('Image optimization failed, uploading original:', err);
    return file;
  }
}

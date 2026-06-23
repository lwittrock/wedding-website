// PhotoUploadModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, Loader2, Camera, ImagePlus, Trash2, AlertTriangle, Plus } from 'lucide-react';
import { compressImage } from '../utils/compressImage';

interface UploadResult {
  status: 'success' | 'error';
  fileName: string;
  publicId?: string;
  url?: string;
  folder?: string;
  error?: string;
  key?: string;
}

interface SelectedPhoto {
  file: File;
  previewUrl: string;
  key: string;
}

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CLOUD_NAME = "davf9thfe";
const UPLOAD_PRESET = "wedding_guest_upload";
// Photos are optimized client-side before upload, so we no longer reject on
// the Cloudinary size limit. This guard only blocks absurdly large files that
// could exhaust memory while a phone decodes them for compression.
const MAX_SIZE = 60 * 1024 * 1024;
// Cap per batch: keeps phone memory bounded and the queue manageable.
const MAX_FILES = 50;
// Compression is CPU-bound and uploads are now small — modest parallelism is
// kinder to mobile uplinks than saturating them with many large requests.
const CONCURRENCY = 3;
const NAME_MAX_LENGTH = 80;
// Per-attempt network timeout so a stalled mobile connection fails fast and
// retries instead of hanging forever.
const UPLOAD_TIMEOUT_MS = 60_000;
const MAX_RETRIES = 3;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fileKey = (f: File) => `${f.name}|${f.size}|${f.lastModified}`;

const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({ isOpen, onClose }) => {
  const [guestName, setGuestName] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const modalCardRef = useRef<HTMLDivElement>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Entrance animation
  useEffect(() => {
    if (!isOpen) {
      setMounted(false);
      return;
    }
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  // Warn before leaving while an upload is in progress
  useEffect(() => {
    if (!uploading) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [uploading]);

  // Keep the screen awake during upload so a phone locking mid-upload doesn't
  // suspend the page and stall transfers. Best-effort — unsupported browsers
  // fall back to the on-screen "keep your phone unlocked" hint.
  const acquireWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch {
      /* denied or unsupported — the on-screen hint covers it */
    }
  };

  const releaseWakeLock = () => {
    wakeLockRef.current?.release().catch(() => {});
    wakeLockRef.current = null;
  };

  // Re-acquire if the user briefly switches away and back while still uploading
  // (the OS drops the lock when the page is hidden).
  useEffect(() => {
    if (!uploading) return;
    const onVisible = () => {
      if (document.visibilityState === 'visible' && !wakeLockRef.current) {
        acquireWakeLock();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [uploading]);

  // Revoke any remaining object URLs on unmount
  const photosRef = useRef<SelectedPhoto[]>([]);
  photosRef.current = selectedPhotos;
  useEffect(() => {
    return () => {
      photosRef.current.forEach(p => URL.revokeObjectURL(p.previewUrl));
    };
  }, []);

  // When flipping to results, scroll the modal back to the top
  useEffect(() => {
    if (showResults && modalCardRef.current) {
      modalCardRef.current.scrollTop = 0;
    }
  }, [showResults]);

  const sanitizeFolderName = (name: string): string => {
    return name
      .trim()
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();
  };

  // A single POST attempt with a timeout. Throws on network/timeout/5xx (so the
  // caller can retry) and marks 4xx as non-retryable (the file itself is the
  // problem — retrying won't help).
  const postToCloudinary = async (fileToSend: File, guestName: string): Promise<UploadResult> => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    const formData = new FormData();
    formData.append("file", fileToSend);
    formData.append("upload_preset", UPLOAD_PRESET);

    const folderName = sanitizeFolderName(guestName);
    formData.append("folder", `wedding_photos/${folderName}`);
    // Cloudinary context pairs are delimited by | and = — strip those from the
    // value so an unusual name can't corrupt or inject metadata.
    const contextName = guestName.replace(/[|=]/g, ' ').trim();
    formData.append("context", `guest_name=${contextName}`);

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const publicId = `photo_${timestamp}_${randomStr}`;
    formData.append("public_id", publicId);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

    try {
      const response = await fetch(url, { method: "POST", body: formData, signal: controller.signal });

      if (!response.ok) {
        let message = 'Upload failed';
        try {
          const errorData = await response.json();
          message = errorData.error?.message || message;
        } catch {
          /* response had no JSON body */
        }
        // 4xx (except 429 rate-limit) is a permanent rejection — don't retry.
        const retryable = response.status >= 500 || response.status === 429;
        const err = new Error(message) as Error & { retryable?: boolean };
        err.retryable = retryable;
        throw err;
      }

      const data = await response.json();
      return {
        status: 'success',
        fileName: fileToSend.name,
        publicId: data.public_id,
        url: data.secure_url,
        folder: data.folder,
      };
    } finally {
      clearTimeout(timeout);
    }
  };

  // Optimize, then upload with exponential-backoff retries on transient errors.
  const uploadFileToCloudinary = async (photo: SelectedPhoto, guestName: string): Promise<UploadResult> => {
    let fileToSend: File;
    try {
      fileToSend = await compressImage(photo.file);
    } catch {
      fileToSend = photo.file;
    }

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await postToCloudinary(fileToSend, guestName);
        return { ...result, fileName: photo.file.name, key: photo.key };
      } catch (error) {
        const isAbort = error instanceof DOMException && error.name === 'AbortError';
        // Network failures (TypeError) and timeouts are always retryable.
        const retryable =
          isAbort ||
          error instanceof TypeError ||
          (error as { retryable?: boolean })?.retryable === true;

        if (!retryable || attempt === MAX_RETRIES) {
          const errorMessage = isAbort
            ? 'Timed out — check your connection'
            : error instanceof Error
              ? error.message
              : 'Unknown error occurred';
          console.error("Upload Error:", error);
          return { status: 'error', fileName: photo.file.name, error: errorMessage, key: photo.key };
        }

        await sleep(1000 * 2 ** attempt); // 1s, 2s, 4s
      }
    }

    // Unreachable, but satisfies the return type.
    return { status: 'error', fileName: photo.file.name, error: 'Upload failed', key: photo.key };
  };

  const addFiles = (files: File[]) => {
    const images = files.filter(f => f.type.startsWith('image/'));
    if (images.length === 0) return;

    setSelectedPhotos(prev => {
      const existing = new Set(prev.map(p => p.key));
      const additions: SelectedPhoto[] = [];
      for (const file of images) {
        // Stop at the per-batch cap. Extra files are ignored before a preview
        // URL is created for them, so nothing leaks.
        if (prev.length + additions.length >= MAX_FILES) break;
        const key = fileKey(file);
        if (existing.has(key)) continue;
        existing.add(key);
        additions.push({
          file,
          key,
          previewUrl: URL.createObjectURL(file),
        });
      }
      return [...prev, ...additions];
    });
    setShowResults(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
    e.target.value = '';
  };

  const handleRemove = (key: string) => {
    setSelectedPhotos(prev => {
      const toRemove = prev.find(p => p.key === key);
      if (toRemove) URL.revokeObjectURL(toRemove.previewUrl);
      return prev.filter(p => p.key !== key);
    });
  };

  const revokeAll = () => {
    selectedPhotos.forEach(p => URL.revokeObjectURL(p.previewUrl));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleUpload = async () => {
    if (!guestName.trim() || selectedPhotos.length === 0) return;

    setUploading(true);
    setUploadResults([]);
    acquireWakeLock();

    const valid: SelectedPhoto[] = [];
    const completed: UploadResult[] = [];

    for (const photo of selectedPhotos) {
      if (photo.file.size > MAX_SIZE) {
        completed.push({
          status: 'error',
          fileName: photo.file.name,
          error: `Too large to process (${(photo.file.size / 1024 / 1024).toFixed(1)} MB) — please send this one to us directly`,
          key: photo.key,
        });
      } else {
        valid.push(photo);
      }
    }

    setUploadResults([...completed]);

    let nextIndex = 0;
    const worker = async () => {
      while (nextIndex < valid.length) {
        const idx = nextIndex++;
        const result = await uploadFileToCloudinary(valid[idx], guestName.trim());
        completed.push(result);
        setUploadResults([...completed]);
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, valid.length) }, worker)
    );

    releaseWakeLock();
    setUploading(false);
    setShowResults(true);
  };

  const handleShareMore = () => {
    revokeAll();
    setSelectedPhotos([]);
    setUploadResults([]);
    setShowResults(false);
  };

  const handleRetryFailed = () => {
    const failedKeys = new Set(
      uploadResults.filter(r => r.status === 'error').map(r => r.key).filter(Boolean) as string[]
    );
    setSelectedPhotos(prev => {
      const removed = prev.filter(p => !failedKeys.has(p.key));
      removed.forEach(p => URL.revokeObjectURL(p.previewUrl));
      return prev.filter(p => failedKeys.has(p.key));
    });
    setUploadResults([]);
    setShowResults(false);
  };

  const handleClose = () => {
    if (uploading) return;
    revokeAll();
    setGuestName('');
    setSelectedPhotos([]);
    setUploadResults([]);
    setShowResults(false);
    onClose();
  };

  const successCount = uploadResults.filter(r => r.status === 'success').length;
  const failCount = uploadResults.filter(r => r.status === 'error').length;
  const completedCount = uploadResults.length;
  const totalToUpload = selectedPhotos.length;
  const canUpload = guestName.trim().length > 0 && selectedPhotos.length > 0 && !uploading;
  const hasPhotos = selectedPhotos.length > 0;
  const atLimit = selectedPhotos.length >= MAX_FILES;

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral/60 backdrop-blur-md transition-opacity duration-150 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div
        ref={modalCardRef}
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
        className={`bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-secondary/20 transform transition-all duration-200 ease-out ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`sticky top-0 bg-background px-6 py-5 flex items-center justify-between z-10 transition-shadow duration-200 ${scrolled ? 'shadow-sm border-b border-secondary/10' : 'border-b border-transparent'}`}
        >
          <div className="flex items-center gap-3">
            <Camera className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-alice text-neutral">
              Share Your Photos
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            aria-label="Close"
            className="p-2 hover:bg-neutral/10 rounded-full transition disabled:opacity-30 disabled:cursor-not-allowed text-neutral"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showResults ? (
            <>
              {/* Name Input */}
              <div className="mb-6">
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Your name"
                  aria-label="Your name"
                  maxLength={NAME_MAX_LENGTH}
                  className="w-full px-4 py-3 bg-white/70 border border-secondary/30 rounded-md text-neutral placeholder-neutral/40 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition font-alice"
                  disabled={uploading}
                />
              </div>

              {/* Drop Zone */}
              <div className="mb-6">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading || atLimit}
                />
                <label
                  htmlFor="file-upload"
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`block cursor-pointer rounded-lg border-2 border-dashed text-center transition-all
                    ${isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-secondary/30 bg-white/40 hover:border-primary/60 hover:bg-white/60'}
                    ${uploading || atLimit ? 'pointer-events-none opacity-60' : ''}
                    ${hasPhotos ? 'px-4 py-3' : 'px-6 py-8'}
                  `}
                >
                  {hasPhotos ? (
                    <div className="flex items-center justify-center gap-2 text-neutral">
                      {atLimit ? (
                        <span className="font-alice text-sm text-neutral/60">
                          Maximum {MAX_FILES} photos reached
                        </span>
                      ) : (
                        <>
                          <Plus className={`w-4 h-4 transition-colors ${isDragging ? 'text-primary' : 'text-neutral/60'}`} />
                          <span className="font-alice text-sm">
                            <span className="hidden sm:inline">Add more photos</span>
                            <span className="sm:hidden">Add more</span>
                          </span>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <ImagePlus
                        className={`w-10 h-10 mx-auto mb-3 transition-colors ${isDragging ? 'text-primary' : 'text-neutral/50'}`}
                      />
                      <p className="font-alice text-neutral text-base">
                        <span className="hidden sm:inline">
                          Drag photos here, or <span className="text-primary underline underline-offset-2">browse</span>
                        </span>
                        <span className="sm:hidden">
                          <span className="text-primary underline underline-offset-2">Tap to select photos</span>
                        </span>
                      </p>
                      <p className="text-xs text-neutral/60 mt-2">
                        Photos only, up to {MAX_FILES} at a time — send videos directly to us
                      </p>
                    </>
                  )}
                </label>
              </div>

              {/* Thumbnail Grid */}
              {hasPhotos && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-alice text-neutral">
                      {selectedPhotos.length} of {MAX_FILES} photos selected
                    </span>
                    {!uploading && (
                      <button
                        onClick={handleShareMore}
                        className="text-xs text-neutral/60 hover:text-primary transition underline underline-offset-2"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {selectedPhotos.map((photo) => (
                      <div
                        key={photo.key}
                        className="relative aspect-square rounded-md overflow-hidden bg-neutral/10 border border-secondary/20"
                      >
                        <img
                          src={photo.previewUrl}
                          alt={photo.file.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.opacity = '0';
                          }}
                        />
                        {!uploading && (
                          <button
                            onClick={() => handleRemove(photo.key)}
                            aria-label={`Remove ${photo.file.name}`}
                            className="absolute top-1 right-1 p-1.5 bg-neutral/70 hover:bg-primary text-white rounded-full transition shadow-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                    <span className="text-sm text-neutral font-alice">
                      {completedCount < totalToUpload
                        ? `Optimizing & uploading ${completedCount} of ${totalToUpload}…`
                        : 'Finishing up…'}
                    </span>
                  </div>
                  <div className="w-full bg-neutral/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${totalToUpload > 0 ? (completedCount / totalToUpload) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-neutral/60 text-center mt-3">
                    Keep this page open and your phone unlocked until it finishes.
                  </p>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!canUpload}
                className="w-full bg-primary text-white py-4 rounded-md font-alice text-lg hover:brightness-90 disabled:bg-neutral/20 disabled:text-neutral/50 disabled:cursor-not-allowed transition shadow-md disabled:shadow-none"
              >
                {uploading
                  ? 'Uploading…'
                  : selectedPhotos.length > 0
                    ? `Share ${selectedPhotos.length} Photo${selectedPhotos.length !== 1 ? 's' : ''}`
                    : 'Share Photos'}
              </button>
            </>
          ) : (
            /* Results */
            <div>
              <div className="text-center mb-6">
                {failCount === 0 ? (
                  <>
                    <CheckCircle className="w-16 h-16 text-primary mx-auto mb-3" />
                    <h3 className="text-2xl font-alice text-neutral mb-2">
                      Thank you!
                    </h3>
                    <p className="text-neutral/70">
                      {successCount} photo{successCount !== 1 ? 's' : ''} shared — we can't wait to see the day through your eyes.
                    </p>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-14 h-14 text-primary mx-auto mb-3" />
                    <h3 className="text-2xl font-alice text-neutral mb-2">
                      Almost there
                    </h3>
                    <p className="text-neutral/70">
                      {successCount} shared, {failCount} didn't make it through.
                    </p>
                  </>
                )}
              </div>

              {failCount > 0 && (
                <div className="mb-6 max-h-40 overflow-y-auto rounded-md border border-secondary/20 bg-white/50 p-3 space-y-1">
                  {uploadResults
                    .filter(r => r.status === 'error')
                    .map((r, i) => (
                      <div key={i} className="text-xs text-neutral/70">
                        <span className="font-medium">{r.fileName}</span>
                        {r.error ? ` — ${r.error}` : ''}
                      </div>
                    ))}
                </div>
              )}

              <div className="flex gap-3">
                {failCount > 0 ? (
                  <button
                    onClick={handleRetryFailed}
                    className="flex-1 bg-white/70 border border-secondary/30 text-neutral py-3 rounded-md font-alice hover:border-primary hover:text-primary transition"
                  >
                    Retry failed
                  </button>
                ) : (
                  <button
                    onClick={handleShareMore}
                    className="flex-1 bg-white/70 border border-secondary/30 text-neutral py-3 rounded-md font-alice hover:border-primary hover:text-primary transition"
                  >
                    Share More
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="flex-1 bg-primary text-white py-3 rounded-md font-alice hover:brightness-90 transition shadow-md"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoUploadModal;

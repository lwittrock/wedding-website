# Photo Upload — Robustness & Performance Improvements

> Review document for the guest photo-upload changes. **Not part of the app** —
> delete this file (or keep it out of the commit) once reviewed.

---

## 1. The problem (as reported)

Guests upload photos through the "Share Your Photos" modal (Cloudinary backend).
Two recurring complaints:

1. **Mobile uploads feel very slow** — and not plausibly explained by the phone's
   connection alone.
2. **A ~20 MB upload limit gets hit sometimes**, with no clear reason. Suspected
   culprits: Live Photos / large modern phone images.

Goal: make the uploader as robust as possible for guests, without throwing away
print quality.

---

## 2. How the feature worked before

- **[PhotoUpload.tsx](src/components/PhotoUpload.tsx)** — gates the button by a
  feature flag + date, then opens the modal.
- **[PhotoUploadModal.tsx](src/components/PhotoUploadModal.tsx)** — guest picks/drags
  images, previews them, then on "Share" each file is sent **at full original
  resolution** to Cloudinary via an unsigned `fetch` POST (public upload preset).

Key characteristics of the old flow:

| Aspect | Old behaviour |
|---|---|
| Compression / resize | **None** — originals uploaded as-is |
| Concurrency | **5** parallel uploads |
| Size handling | Hard-reject anything **> 20 MB** client-side |
| Network resilience | No retry, no timeout — one failed `fetch` = permanent error |
| Progress | Count-based ("Uploading 3 of 8") |

---

## 3. Root-cause analysis

### Why mobile was slow (it wasn't just the connection)

1. **No compression — the dominant factor.** Modern phone photos are 3–12 MB each
   (48 MP shots and panoramas can exceed 20 MB). Those full originals were shipped
   over the phone's **upstream** bandwidth, which is much narrower than download.
2. **Concurrency = 5 hurt on mobile.** Five large uploads competing for a thin
   uplink slows *all* of them and risks timeouts — high parallelism is
   counterproductive on phones.
3. **No timeout / no retry.** A momentary mobile drop left a request hanging
   indefinitely or failing outright with no recovery.

### Why the size limit was hit

1. Newer phones genuinely produce files that big (48 MP HEIC/JPEG, panoramas,
   large Live Photo stills).
2. **Verified fact:** Cloudinary's **free plan caps image uploads at 10 MB**; paid
   plans start at **20 MB**. The old code's `20 MB` check was the *paid-plan*
   number. On the free tier, files between **10–20 MB passed the client check but
   were then rejected by Cloudinary**, producing confusing failures.
   - Sources:
     [Cloudinary — file size limits](https://support.cloudinary.com/hc/en-us/articles/202520592-Do-you-have-a-file-size-limit),
     [Cloudinary pricing](https://cloudinary.com/pricing)
3. The old client limit simply **rejected** oversized files — the photo was lost
   with no attempt to salvage it.

### The key insight that shaped the fix

**File size is driven far more by JPEG encoding quality than by resolution.** The
same 12 MP photo can be 2 MB or 12 MB depending only on how it was compressed.
Therefore re-encoding at high quality (~0.85) **with no resolution loss** typically
cuts file size 40–70% with no visible degradation — fixing *both* the size limit
and the upload speed while preserving full print resolution.

For reference: most phones shoot **12 MP (4032 px)** by default, which prints
cleanly at 8×10" (240–300 DPI). Only iPhone "48 MP / ProRAW / high-res" mode and
panoramas create the giant files — exactly the ones that were failing.

---

## 4. Decisions made (with you)

| Decision | Choice | Why |
|---|---|---|
| Cloudinary plan / ceiling | **Free (10 MB)** | Target output safely under ~9 MB |
| Compression strategy | **Re-encode all, keep resolution** | Fixes both problems; negligible quality cost |
| Implementation | **`browser-image-compression`** | Web-worker based (UI stays smooth), handles EXIF orientation |

---

## 5. What changed

### New file: [src/utils/compressImage.ts](src/utils/compressImage.ts)

Takes a `File`, returns an optimized `File`:

- Re-encodes to **high-quality JPEG**: `initialQuality: 0.85`.
- **Resolution cap:** `maxWidthOrHeight: 4096` (default 12 MP photos pass through
  at full res; only 48 MP shots / panoramas get downscaled).
- **Size safety net:** `maxSizeMB: 9` with `alwaysKeepResolution: true` — meaning
  if a file is still too big after the 4096 cap, only **quality** is reduced to
  reach 9 MB, never resolution.
- **Skips files < 1 MB** — already fast; re-encoding would waste time / could
  enlarge them.
- **Falls back to the original** if compression fails (e.g. an undecodable HEIC on
  a non-iOS browser) or if the result would be larger than the input.
- Runs in a **web worker** (`useWebWorker: true`) so a phone's UI stays responsive
  while many photos are processed.

### Reworked: [PhotoUploadModal.tsx](src/components/PhotoUploadModal.tsx)

- **Pipeline:** each worker now **compresses → uploads**, so optimization overlaps
  the network.
- **Retry with exponential backoff:** up to **3 retries** (1 s / 2 s / 4 s) on
  network errors, timeouts, HTTP 5xx, and 429. **No retry** on genuine 4xx (the
  file itself is the problem — retrying won't help).
- **Per-attempt timeout:** `AbortController`, **60 s**. A stalled connection now
  fails fast and retries instead of hanging forever. Shown to the guest as
  "Timed out — check your connection".
- **Concurrency 5 → 3** — gentler on mobile uplinks; high parallelism is
  unnecessary now that files are small.
- **Compression serialized to 1 at a time** — uploads still run 3-wide, but only
  one image is decoded/re-encoded at once. A 48 MP photo decodes to ~190 MB, so
  serializing the heavy step bounds peak memory (stops iOS Safari force-reloading
  the tab) and leaves a CPU core for the UI, with negligible throughput cost.
- **Per-batch cap of 50 files** — enforced on selection; the "add more" zone
  disables and shows "Maximum 50 photos reached" once full.
- **Screen Wake Lock during upload** (best-effort) — keeps the phone from
  sleeping mid-upload and suspending transfers; re-acquired on tab refocus.
  Backed by an on-screen "keep this page open and your phone unlocked" hint.
- **Context metadata hardened** — `|`/`=` stripped from the guest name before it
  goes into the Cloudinary `context` string, so an odd name can't corrupt it.
- **Removed the 20 MB hard reject.** Oversized files get optimized instead of
  refused. A **60 MB guard** remains, purely to avoid exhausting phone memory while
  decoding an enormous image; those rare files show a friendly "send this one to us
  directly" message.
- Progress label now reads **"Optimizing & uploading X of Y…"**.

### Dependency

- Added **`browser-image-compression@2.0.2`**.
- Bundle impact: gzipped JS ≈ **144 kB** (small increase). Build passes
  (`npm run build`).

### Tuning knobs (if you want to adjust)

In [src/utils/compressImage.ts](src/utils/compressImage.ts):
- `QUALITY` (0.85) — raise toward 0.9 for more fidelity / larger files.
- `MAX_DIMENSION` (4096) — lower (e.g. 3000) for smaller, faster uploads.
- `TARGET_MAX_MB` (9) — raise if you move to a paid plan (20 MB).
- `SKIP_BELOW_BYTES` (1 MB) — threshold below which files are left untouched.

In [PhotoUploadModal.tsx](src/components/PhotoUploadModal.tsx):
- `CONCURRENCY` (3), `UPLOAD_TIMEOUT_MS` (60 s), `MAX_RETRIES` (3), `MAX_SIZE` (60 MB),
  `MAX_FILES` (50).

---

## 6. Expected impact

- **Size limit:** effectively eliminated — every uploaded file lands under 9 MB,
  at full resolution for normal phone photos.
- **Mobile speed:** a typical 8–12 MB photo uploads as ~2–4 MB → roughly **3–5×
  faster** on a phone uplink, plus self-healing on flaky connections.

---

## 7. Tradeoffs & caveats to accept

1. **EXIF metadata is preserved on re-encode** (`preserveExif: true`). Capture date,
   GPS and camera info are carried into the re-encoded file so the final gallery can
   be sorted chronologically; orientation is baked into the pixels and its tag is
   dropped to avoid double-rotation. Caveat: the library only copies EXIF when the
   **source file is already JPEG** — the normal iOS case (Safari converts HEIC→JPEG
   on selection). A rare raw-HEIC source would still lose its metadata.
2. **One generation of JPEG re-encoding.** At quality 0.85 this is visually
   imperceptible, but it is technically a second lossy pass on already-compressed
   photos.
3. **HEIC outside iOS:** if a browser can't decode a `.heic` file, we fall back to
   uploading the original. If that original is also over the limit, it will still
   fail — but iOS Safari (the common case) decodes HEIC fine, and typically hands
   the web a JPEG anyway.

---

## 8. Recommended testing before upload opens (June 25)

```bash
npm run dev
```

Then on a **real phone** over the same network:

- Upload a mix: a few normal photos, a couple of large/48 MP shots, a panorama.
- Confirm: speed feels better, the progress bar advances, results show all success.
- Try toggling airplane mode mid-upload to confirm retry/timeout behaviour.
- Verify the photos land in Cloudinary under `wedding_photos/<guest_name>/`.

---

## 9. Rollback

If anything misbehaves, the change is self-contained:
- `git checkout -- src/components/PhotoUploadModal.tsx`
- delete `src/utils/compressImage.ts`
- `npm uninstall browser-image-compression`

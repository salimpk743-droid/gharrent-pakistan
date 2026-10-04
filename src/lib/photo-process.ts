/**
 * Browser-only: check, convert and shrink one picked photo before it is stored or uploaded.
 * HEIC/HEIF (iPhone) is decoded natively where the browser can (Safari), otherwise converted with
 * heic2any, which is loaded only when a HEIC photo is actually picked (it is ~1.3 MB).
 */
import {
  fitWithin,
  JPEG_QUALITY_STEPS,
  looksLikeHeicBytes,
  PHOTO_MAX_EDGE,
  PHOTO_MESSAGES,
  PHOTO_TARGET_BYTES,
  precheckPhoto,
} from "./post-ad";

export type ProcessedPhoto = { blob: Blob; width: number; height: number };

/** The server refuses anything over 1.5 MB; stay safely under it. */
const HARD_LIMIT_BYTES = 1_450_000;

export class PhotoError extends Error {}

type Decoded = { source: CanvasImageSource; width: number; height: number; close: () => void };

async function decodeWithBitmap(blob: Blob): Promise<Decoded> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });
  } catch {
    bitmap = await createImageBitmap(blob);
  }
  return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
}

function decodeWithImage(blob: Blob): Promise<Decoded> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.decoding = "async";
    img.onload = () =>
      resolve({
        source: img,
        width: img.naturalWidth,
        height: img.naturalHeight,
        close: () => URL.revokeObjectURL(url),
      });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode failed"));
    };
    img.src = url;
  });
}

async function decode(blob: Blob): Promise<Decoded> {
  if (typeof createImageBitmap === "function") {
    try {
      return await decodeWithBitmap(blob);
    } catch {
      /* fall through to <img> */
    }
  }
  return decodeWithImage(blob);
}

async function convertHeic(file: Blob): Promise<Blob> {
  const { default: heic2any } = await import("heic2any");
  const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  return Array.isArray(out) ? out[0] : out;
}

async function headerBytes(file: Blob): Promise<Uint8Array> {
  try {
    return new Uint8Array(await file.slice(0, 16).arrayBuffer());
  } catch {
    return new Uint8Array();
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

/** Check, convert (HEIC) and shrink to max 1600px JPEG of about 500 KB. Throws PhotoError with a plain message. */
export async function shrinkPhoto(file: File): Promise<ProcessedPhoto> {
  const check = precheckPhoto(file);
  if (check.kind === "reject") throw new PhotoError(check.message);
  let heic = check.kind === "heic" || looksLikeHeicBytes(await headerBytes(file));

  let decoded: Decoded | null = null;
  try {
    decoded = await decode(file);
  } catch {
    decoded = null;
  }
  if (!decoded && !heic) {
    // Unknown type that is really HEIC (some Android file pickers drop the type).
    heic = looksLikeHeicBytes(await headerBytes(file));
    if (!heic) throw new PhotoError(PHOTO_MESSAGES.readFailed);
  }
  if (!decoded) {
    try {
      decoded = await decode(await convertHeic(file));
    } catch {
      throw new PhotoError(PHOTO_MESSAGES.heicFailed);
    }
  }

  try {
    const { width, height } = fitWithin(decoded.width, decoded.height, PHOTO_MAX_EDGE);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new PhotoError(PHOTO_MESSAGES.readFailed);
    ctx.fillStyle = "#fff"; // transparent PNGs become white, not black, as JPEG
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(decoded.source, 0, 0, width, height);
    let blob: Blob | null = null;
    for (const quality of JPEG_QUALITY_STEPS) {
      blob = await canvasToBlob(canvas, quality);
      if (blob && blob.size <= PHOTO_TARGET_BYTES) break;
    }
    if (!blob) throw new PhotoError(PHOTO_MESSAGES.readFailed);
    if (blob.size > HARD_LIMIT_BYTES) {
      // Extremely detailed photo: one more, smaller pass.
      const small = fitWithin(width, height, 1200);
      canvas.width = small.width;
      canvas.height = small.height;
      ctx.drawImage(decoded.source, 0, 0, small.width, small.height);
      blob = await canvasToBlob(canvas, 0.6);
      if (!blob || blob.size > HARD_LIMIT_BYTES) throw new PhotoError(PHOTO_MESSAGES.readFailed);
      return { blob, width: small.width, height: small.height };
    }
    return { blob, width, height };
  } finally {
    decoded.close();
  }
}

/** Old drafts stored photos as data: URLs; turn one back into a Blob for upload. */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

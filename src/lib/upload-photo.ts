/**
 * Browser-only: upload one shrunk photo to `/api/listing-images` with real progress (XMLHttpRequest,
 * because fetch cannot report upload progress). Safe to retry: the photo id makes it idempotent.
 */
import { getBearerToken } from "./auth/client";
import { PHOTO_MESSAGES } from "./post-ad";
import type { PropertyImage } from "./types";

export type UploadArgs = {
  propertyId: string;
  photoId: string;
  blob: Blob;
  width: number;
  height: number;
  sortOrder: number;
  isCover: boolean;
  onProgress?: (percent: number) => void;
  timeoutMs?: number;
};

export type UploadResult = { ok: true; image: PropertyImage } | { ok: false; error: string; status: number };

export function uploadPhoto(args: UploadArgs): Promise<UploadResult> {
  return new Promise((resolve) => {
    const qs = new URLSearchParams({
      propertyId: args.propertyId,
      id: args.photoId,
      sortOrder: String(args.sortOrder),
      isCover: args.isCover ? "1" : "0",
      width: String(Math.round(args.width)),
      height: String(Math.round(args.height)),
    });
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/listing-images?${qs.toString()}`);
    xhr.timeout = args.timeoutMs ?? 90_000;
    xhr.setRequestHeader("Content-Type", args.blob.type || "image/jpeg");
    const token = getBearerToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) args.onProgress?.(Math.min(99, Math.round((e.loaded / e.total) * 100)));
    };
    const failed = (error: string, status = 0) => resolve({ ok: false, error, status });
    xhr.onerror = () => failed(PHOTO_MESSAGES.uploadFailed);
    xhr.ontimeout = () => failed(PHOTO_MESSAGES.uploadFailed);
    xhr.onabort = () => failed(PHOTO_MESSAGES.uploadFailed);
    xhr.onload = () => {
      let body: { ok?: boolean; error?: string; image?: PropertyImage } = {};
      try {
        body = JSON.parse(xhr.responseText || "{}");
      } catch {
        /* non-JSON (e.g. a gateway error page) */
      }
      if (xhr.status >= 200 && xhr.status < 300 && body.ok && body.image) {
        args.onProgress?.(100);
        resolve({ ok: true, image: body.image });
        return;
      }
      failed(body.error || PHOTO_MESSAGES.uploadFailed, xhr.status);
    };
    xhr.send(args.blob);
  });
}

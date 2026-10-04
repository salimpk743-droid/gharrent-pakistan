/**
 * Pure helpers for posting a property ad. No browser, React or database imports, so every rule here is
 * unit-tested (post-ad.test.ts). The wizard wires them to the real browser APIs and server functions.
 *
 * Posting order (so a half-finished ad is never live):
 *   1. Photos are checked and shrunk on the phone the moment they are picked. Signed-in posters upload them
 *      straight away (3 at a time); guests keep them on the device until they sign in at Publish.
 *   2. Publish creates the ad as a hidden DRAFT with an id made once per form (reused on every retry).
 *   3. Details are saved, any photos not uploaded yet are uploaded (3 at a time, each idempotent by its own id).
 *   4. Only then is the ad activated, with its photo order and cover fixed in the same server call.
 */
import { validateForSubmit, type ListingInput } from "./validate-listing.ts";

export const PHOTO_CONCURRENCY = 3;
/** Raw file limit before shrinking on the phone. Photos are resized to 1600px / ~500 KB before upload. */
export const MAX_RAW_PHOTO_BYTES = 40 * 1024 * 1024;
export const PHOTO_MAX_EDGE = 1600;
export const PHOTO_TARGET_BYTES = 500 * 1024;

const DIRECT_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const DIRECT_EXT = /\.(jpe?g|png|webp)$/i;
const HEIC_TYPES = ["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"];
const HEIC_EXT = /\.(heic|heif)$/i;

/** What the photo picker accepts. HEIC is listed so Android and desktop users can pick iPhone photos. */
export const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif,.jpg,.jpeg,.png,.webp";

export const PHOTO_MESSAGES = {
  notImage: "This file is not a photo. Please choose a JPG, PNG or iPhone (HEIC) photo.",
  tooBig: "This photo is too big (over 40 MB). Please choose a smaller photo.",
  badName: "This file name is not allowed. Please rename the photo and try again.",
  heicFailed:
    "This iPhone photo (HEIC) could not be opened here. On your iPhone go to Settings > Camera > Formats > Most Compatible, or send the photo to yourself on WhatsApp and pick it again.",
  readFailed: "This photo could not be opened. Please try another photo.",
  uploadFailed: "Upload failed. Check your internet and tap Retry.",
  tooMany: (max: number) => `You can add up to ${max} photos.`,
} as const;

export function isHeicFile(file: { type?: string; name?: string }): boolean {
  const type = String(file.type || "").toLowerCase();
  return HEIC_TYPES.includes(type) || HEIC_EXT.test(String(file.name || ""));
}

/** True when the first bytes are an ISO-BMFF HEIC/HEIF header (some phones send HEIC with an empty type). */
export function looksLikeHeicBytes(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  const box = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
  const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]).toLowerCase();
  return box === "ftyp" && ["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1"].includes(brand);
}

export type PhotoPrecheck = { kind: "direct" } | { kind: "heic" } | { kind: "reject"; message: string };

/** Decide what to do with a picked file before reading it. Anything under 40 MB is fine: it is shrunk on the phone. */
export function precheckPhoto(file: { type?: string; name?: string; size: number }): PhotoPrecheck {
  const name = String(file.name || "");
  if (name.includes("..") || name.includes("/") || name.includes("\\") || /\.(svg|html?|js|exe|php|sh|pdf|gif)$/i.test(name)) {
    return { kind: "reject", message: /\.(gif|pdf)$/i.test(name) ? PHOTO_MESSAGES.notImage : PHOTO_MESSAGES.badName };
  }
  if (file.size <= 0) return { kind: "reject", message: PHOTO_MESSAGES.readFailed };
  if (file.size > MAX_RAW_PHOTO_BYTES) return { kind: "reject", message: PHOTO_MESSAGES.tooBig };
  if (isHeicFile(file)) return { kind: "heic" };
  const type = String(file.type || "").toLowerCase();
  if (DIRECT_TYPES.includes(type) || (!type && DIRECT_EXT.test(name))) return { kind: "direct" };
  // Some Android galleries send an empty type and no extension; let the decoder decide.
  if (!type && !/\.[a-z0-9]{2,5}$/i.test(name)) return { kind: "direct" };
  return { kind: "reject", message: PHOTO_MESSAGES.notImage };
}

/** Scale (w, h) so the longer edge is at most `maxEdge`. Never enlarges. */
export function fitWithin(width: number, height: number, maxEdge = PHOTO_MAX_EDGE): { width: number; height: number } {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const scale = Math.min(1, maxEdge / Math.max(w, h));
  return { width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) };
}

/** JPEG qualities tried in order until the photo is under the target size. */
export const JPEG_QUALITY_STEPS = [0.82, 0.74, 0.66, 0.58, 0.5] as const;

/** Synchronous lock: the first tap wins, every later tap is ignored until release(). */
export function createSubmitLock() {
  let held = false;
  return {
    tryAcquire(): boolean {
      if (held) return false;
      held = true;
      return true;
    },
    release(): void {
      held = false;
    },
    get held(): boolean {
      return held;
    },
  };
}

/**
 * Small work queue: runs at most `limit` tasks at once and starts the next one as soon as a slot frees up.
 * Photos picked at different times share the same 3 lanes.
 */
export function createTaskQueue<T>(limit: number, worker: (item: T) => Promise<unknown>) {
  const queue: T[] = [];
  let active = 0;
  const idle: (() => void)[] = [];
  const settle = () => {
    if (!active && !queue.length) idle.splice(0).forEach((fn) => fn());
  };
  const pump = () => {
    while (active < Math.max(1, limit) && queue.length) {
      const item = queue.shift() as T;
      active += 1;
      Promise.resolve()
        .then(() => worker(item))
        .catch(() => {
          // The worker reports its own errors; one failed photo must not stop the others.
        })
        .finally(() => {
          active -= 1;
          pump();
          settle();
        });
    }
  };
  return {
    add(item: T) {
      queue.push(item);
      pump();
    },
    get active() {
      return active;
    },
    get waiting() {
      return queue.length;
    },
    /** Resolves when nothing is running or waiting. */
    onIdle(): Promise<void> {
      return !active && !queue.length ? Promise.resolve() : new Promise<void>((resolve) => idle.push(resolve));
    },
  };
}

export type CoverInput = { id: string; isCover?: boolean; sortOrder?: number };

/**
 * Exactly one cover: the requested cover if it is among the photos, else the first photo flagged as cover,
 * else the first photo. Returns ids in display order with their final sort order.
 */
export function normalizeCover(
  images: readonly CoverInput[],
  coverId?: string | null,
): { id: string; sortOrder: number; isCover: boolean }[] {
  if (!images.length) return [];
  const ordered = images.map((img, i) => ({ img, i })).sort((a, b) => (a.img.sortOrder ?? a.i) - (b.img.sortOrder ?? b.i) || a.i - b.i);
  const ids = ordered.map((o) => o.img.id);
  const chosen =
    (coverId && ids.includes(coverId) ? coverId : null) ?? ordered.find((o) => o.img.isCover)?.img.id ?? ids[0];
  return ordered.map((o, index) => ({ id: o.img.id, sortOrder: index, isCover: o.img.id === chosen }));
}

/** The card/OG image: the cover if one is set, else the first photo by order, else nothing. */
export function pickCover<T extends { isCover: boolean; sortOrder?: number }>(images: readonly T[]): T | null {
  if (!images.length) return null;
  return images.find((i) => i.isCover) ?? [...images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0];
}

/* ---------------------------------------------------------------- validation */

export type WizardField = "provinceId" | "districtId" | "monthlyRent" | "photos" | "contactPhone" | "contactWhatsapp" | "other";

export const WIZARD_STEPS = ["Location", "Property", "Photos", "Details", "Contact", "Publish"] as const;

const FIELD_STEP: Record<WizardField, number> = {
  provinceId: 0,
  districtId: 0,
  monthlyRent: 1,
  photos: 2,
  contactPhone: 4,
  contactWhatsapp: 4,
  other: 1,
};

export function fieldForMessage(message: string): WizardField {
  // Account-level answers (duplicate ad, daily limit) are not fixed by editing one field.
  if (/already has a live ad|ads a day|too many|cannot be submitted|suspended/i.test(message)) return "other";
  if (/whatsapp/i.test(message)) return "contactWhatsapp";
  if (/mobile|phone/i.test(message)) return "contactPhone";
  if (/province|region/i.test(message)) return "provinceId";
  if (/city/i.test(message)) return "districtId";
  if (/price|rent\b/i.test(message)) return "monthlyRent";
  if (/photo/i.test(message)) return "photos";
  return "other";
}

export function stepForField(field: WizardField): number {
  return FIELD_STEP[field];
}

export type PhotoState = { status: "processing" | "local" | "uploading" | "uploaded" | "failed" };

/** All problems that block publishing, keyed by the field that fixes them (first message per field). */
export function fieldErrors(input: ListingInput, photos: readonly PhotoState[]): Partial<Record<WizardField, string>> {
  const usable = photos.filter((p) => p.status !== "failed" && p.status !== "processing").length;
  const errors = validateForSubmit({ ...input, imageCount: usable });
  const out: Partial<Record<WizardField, string>> = {};
  for (const message of errors) {
    const field = fieldForMessage(message);
    if (!out[field]) out[field] = message;
  }
  if (!out.photos && photos.some((p) => p.status === "failed") && usable === 0) {
    out.photos = "Your photo did not upload. Tap Retry on the photo, or add another photo.";
  }
  if (out.photos && usable === 0 && photos.some((p) => p.status === "processing")) {
    out.photos = "Please wait a moment: your photos are still being prepared.";
  }
  return out;
}

/** Errors that belong to one wizard step (used when the poster taps Continue). */
export function stepErrors(step: number, input: ListingInput, photos: readonly PhotoState[]): Partial<Record<WizardField, string>> {
  const all = fieldErrors(input, photos);
  const out: Partial<Record<WizardField, string>> = {};
  for (const [field, message] of Object.entries(all) as [WizardField, string][]) {
    if (FIELD_STEP[field] === step && field !== "other") out[field] = message;
  }
  return out;
}

/** First step that still has a problem, or -1 when the ad is ready to publish. */
export function firstStepWithError(errors: Partial<Record<WizardField, string>>): number {
  const steps = (Object.keys(errors) as WizardField[]).map((f) => FIELD_STEP[f]);
  return steps.length ? Math.min(...steps) : -1;
}

/* ---------------------------------------------------------------- poster prefs (autofill) */

export const POSTER_PREFS_KEY = "apnaghar:poster:v1";
export type PosterPrefs = {
  listingPurpose?: "RENT" | "SALE";
  provinceId?: string;
  districtId?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
};

/** Parse the poster's saved city and phone from localStorage text. Never throws. */
export function parsePosterPrefs(raw: string | null | undefined): PosterPrefs {
  if (!raw) return {};
  try {
    const v = JSON.parse(raw) as Record<string, unknown>;
    if (!v || typeof v !== "object") return {};
    const pick = (k: string, max: number) => (typeof v[k] === "string" && v[k] ? String(v[k]).slice(0, max) : undefined);
    const purpose = v.listingPurpose === "SALE" || v.listingPurpose === "RENT" ? v.listingPurpose : undefined;
    return {
      listingPurpose: purpose,
      provinceId: pick("provinceId", 120),
      districtId: pick("districtId", 120),
      contactPhone: pick("contactPhone", 20),
      contactWhatsapp: pick("contactWhatsapp", 20),
    };
  } catch {
    return {};
  }
}

type PrefTarget = {
  provinceId?: string | null;
  districtId?: string | null;
  contactPhone?: string | null;
  contactWhatsapp?: string | null;
};

/** Fill only blank fields from saved prefs; anything the poster already typed wins. City needs its province. */
export function applyPosterPrefs<T extends PrefTarget>(listing: T, prefs: PosterPrefs): T {
  const out = { ...listing };
  if (!out.provinceId && prefs.provinceId) {
    out.provinceId = prefs.provinceId;
    if (!out.districtId && prefs.districtId) out.districtId = prefs.districtId;
  }
  if (!(out.contactPhone || "").trim() && prefs.contactPhone) out.contactPhone = prefs.contactPhone;
  if (!(out.contactWhatsapp || "").trim() && prefs.contactWhatsapp && prefs.contactWhatsapp !== prefs.contactPhone) {
    out.contactWhatsapp = prefs.contactWhatsapp;
  }
  return out;
}

/* ---------------------------------------------------------------- publish pipeline */

export type PublishStage = "draft" | "save" | "photos" | "activate";
export type PipelinePhoto = { id: string; uploaded: boolean; isCover: boolean };

export type PublishDeps = {
  /** Create the hidden draft with this id, or confirm it already exists for this poster. */
  ensureDraft: (adId: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  saveFields: (adId: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  /** Upload one photo. Must be idempotent by photo id (a retry of a saved photo succeeds without a copy). */
  uploadPhoto: (adId: string, photoId: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  /** Fix order + cover and set the ad live. Must succeed (not error) when the ad is already live. */
  activate: (
    adId: string,
    imageIds: string[],
    coverId: string | null,
  ) => Promise<{ ok: true; status: string } | { ok: false; error: string }>;
  onPhotoUploaded?: (photoId: string) => void;
  onPhotoFailed?: (photoId: string, error: string) => void;
  onStage?: (stage: PublishStage) => void;
};

export type PublishResult =
  | { ok: true; adId: string; status: string }
  | { ok: false; adId: string; stage: PublishStage; message: string; failedPhotoIds: string[] };

export async function publishListing(
  deps: PublishDeps,
  input: { adId: string; photos: readonly PipelinePhoto[]; concurrency?: number },
): Promise<PublishResult> {
  const { adId } = input;
  const fail = (stage: PublishStage, message: string, failedPhotoIds: string[] = []): PublishResult => ({
    ok: false,
    adId,
    stage,
    message,
    failedPhotoIds,
  });
  const attempt = async <R extends { ok: boolean }>(stage: PublishStage, fn: () => Promise<R>) => {
    deps.onStage?.(stage);
    try {
      return await fn();
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) } as unknown as R;
    }
  };

  const draft = await attempt("draft", () => deps.ensureDraft(adId));
  if (!draft.ok) return fail("draft", (draft as { error: string }).error);
  const saved = await attempt("save", () => deps.saveFields(adId));
  if (!saved.ok) return fail("save", (saved as { error: string }).error);

  deps.onStage?.("photos");
  const failed: string[] = [];
  const queue = createTaskQueue<PipelinePhoto>(input.concurrency ?? PHOTO_CONCURRENCY, async (photo) => {
    let result: { ok: true } | { ok: false; error: string };
    try {
      result = await deps.uploadPhoto(adId, photo.id);
    } catch (err) {
      result = { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
    if (result.ok) deps.onPhotoUploaded?.(photo.id);
    else {
      failed.push(photo.id);
      deps.onPhotoFailed?.(photo.id, result.error);
    }
  });
  for (const photo of input.photos) if (!photo.uploaded) queue.add(photo);
  await queue.onIdle();
  if (failed.length) return fail("photos", PHOTO_MESSAGES.uploadFailed, failed);

  const ids = input.photos.map((p) => p.id);
  const cover = input.photos.find((p) => p.isCover)?.id ?? ids[0] ?? null;
  const live = await attempt("activate", () => deps.activate(adId, ids, cover));
  if (!live.ok) return fail("activate", (live as { error: string }).error);
  return { ok: true, adId, status: (live as { status: string }).status };
}

/** Plain-language message for a failed publish. The form keeps everything the poster typed. */
export function publishFailureMessage(result: Extract<PublishResult, { ok: false }>, offline = false): string {
  if (offline) return "No internet connection. Your details and photos are still here. Connect and tap Publish again.";
  if (/failed to fetch|networkerror|network request failed|load failed|timed? ?out|fetch failed/i.test(result.message)) {
    return "The connection dropped. Your details and photos are still here. Tap Publish again (it will not post your ad twice).";
  }
  if (result.stage === "photos") {
    return "Some photos did not upload. Your details are saved. Tap Retry on the photo (or Publish again).";
  }
  if (result.stage === "activate") {
    // Server rule messages (missing price, duplicate ad, daily limit) are already plain language.
    return result.message || "Your ad is saved as a hidden draft but could not go live yet. Please tap Publish again.";
  }
  if (/too many|limit|wait/i.test(result.message)) return result.message;
  return "Your ad could not be saved. Your details and photos are still here. Please tap Publish again.";
}

/** A fresh id for one ad form (stays the same across retries) or one photo. */
export function newClientId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    return (ch === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function isClientId(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

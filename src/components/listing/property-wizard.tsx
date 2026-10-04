import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AlertCircle, Check, ImagePlus, Loader2, RotateCcw, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { listAreasForCity, listCitiesForProvince, listProvinces } from "@/lib/server/locations";
import { createDraft, deleteListingImage, saveDraft, setCoverImage, submitListing } from "@/lib/server/listings";
import {
  FURNISHED_LABEL,
  FURNISHED_STATUSES,
  MAX_IMAGES,
  PURPOSE_KICKER,
  PROPERTY_TYPES,
  type ListingPurpose,
} from "@/lib/constants";
import { formatListingPrice, formatLocation } from "@/lib/utils";
import { autoListingTitle, needsAutoTitle } from "@/lib/listing-title";
import {
  clearLocalDraft,
  getLocalAdId,
  pickDraftFields,
  resetLocalAdId,
  saveLocalFields,
  saveLocalPhotos,
  savePosterPrefs,
  type LocalPhoto,
} from "@/lib/local-draft";
import {
  createSubmitLock,
  createTaskQueue,
  fieldErrors,
  fieldForMessage,
  firstStepWithError,
  newClientId,
  PHOTO_ACCEPT,
  PHOTO_CONCURRENCY,
  PHOTO_MESSAGES,
  precheckPhoto,
  publishFailureMessage,
  publishListing,
  stepErrors,
  stepForField,
  WIZARD_STEPS,
  type PublishStage,
  type WizardField,
} from "@/lib/post-ad";
import type { AreaNode, LocationNode, OwnerListing } from "@/lib/types";

const STEPS = WIZARD_STEPS;
/** 16px text on phones so iOS does not zoom into the field on focus. */
const FIELD = "min-h-12 text-base font-normal sm:text-sm";

const AMENITIES = [
  ["parking", "Parking"],
  ["electricity", "Electricity"],
  ["gas", "Gas"],
  ["water", "Water"],
  ["maintenance", "Maintenance included"],
  ["familyAllowed", "Family allowed"],
  ["bachelorAllowed", "Bachelor allowed"],
  ["petsAllowed", "Pets allowed"],
] as const;

type PhotoStatus = "processing" | "local" | "uploading" | "uploaded" | "failed";
type WizardPhoto = {
  id: string;
  previewUrl: string | null;
  blob?: Blob;
  dataUrl?: string;
  width: number;
  height: number;
  isCover: boolean;
  status: PhotoStatus;
  progress: number;
  error?: string;
  retryable?: boolean;
  uploadedTo?: string;
  name?: string;
};

type Errors = Partial<Record<WizardField, string>>;

const STAGE_LABEL: Record<PublishStage, string> = {
  draft: "Saving your ad…",
  save: "Saving details…",
  photos: "Uploading photos…",
  activate: "Putting your ad live…",
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm font-medium normal-case tracking-normal text-danger" role="alert">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

function photosFromLocal(list: LocalPhoto[]): WizardPhoto[] {
  return list.map((p) => ({
    id: p.id,
    previewUrl: p.blob ? URL.createObjectURL(p.blob) : (p.dataUrl ?? null),
    blob: p.blob,
    dataUrl: p.dataUrl,
    width: p.width,
    height: p.height,
    isCover: p.isCover,
    status: p.uploadedTo ? "uploaded" : "local",
    progress: p.uploadedTo ? 100 : 0,
    uploadedTo: p.uploadedTo,
  }));
}

function withOneCover(list: WizardPhoto[]): WizardPhoto[] {
  const usable = list.filter((p) => p.status !== "failed" || p.retryable);
  if (!usable.length || usable.some((p) => p.isCover)) return list;
  const first = usable[0].id;
  return list.map((p) => (p.id === first ? { ...p, isCover: true } : p));
}

export function PropertyWizard({
  initial,
  initialPhotos,
  mode,
  signedIn,
  onNeedSignIn,
  autoPublish = false,
}: {
  initial: OwnerListing;
  /** New ads: photos restored from this device. */
  initialPhotos?: LocalPhoto[];
  /** "new" keeps the form on this device until Publish; "edit" works on a saved listing. */
  mode: "new" | "edit";
  signedIn: boolean;
  /** Guest pressed Publish with a valid ad: ask them to sign in (the form stays saved on the device). */
  onNeedSignIn?: () => void;
  /** Publish straight away (a guest just signed in after pressing Publish). */
  autoPublish?: boolean;
}) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [provinces, setProvinces] = useState<LocationNode[]>([]);
  const [cities, setCities] = useState<LocationNode[]>([]);
  const [areas, setAreas] = useState<AreaNode[]>([]);
  const [listing, setListing] = useState(initial);
  const [photos, setPhotosState] = useState<WizardPhoto[]>(() =>
    mode === "edit"
      ? initial.images.map((img) => ({
          id: img.id,
          previewUrl: img.url,
          width: img.width ?? 0,
          height: img.height ?? 0,
          isCover: img.isCover,
          status: "uploaded" as const,
          progress: 100,
          uploadedTo: initial.id,
        }))
      : photosFromLocal(initialPhotos ?? []),
  );
  const [errors, setErrors] = useState<Errors>({});
  const [publishing, setPublishing] = useState(false);
  const [stage, setStage] = useState<PublishStage | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const photosRef = useRef(photos);
  const listingRef = useRef(listing);
  const fieldsDirty = useRef(false);
  const photosDirty = useRef(false);
  const lock = useRef(createSubmitLock());
  const adIdRef = useRef<string | null>(mode === "edit" ? initial.id : null);
  const draftReady = useRef<Promise<string> | null>(mode === "edit" ? Promise.resolve(initial.id) : null);
  const inflight = useRef(new Map<string, Promise<boolean>>());
  const autoPublished = useRef(false);
  const live = listing.status === "PUBLISHED" || listing.status === "PAUSED";

  listingRef.current = listing;

  const setPhotos = useCallback((fn: (cur: WizardPhoto[]) => WizardPhoto[]) => {
    setPhotosState((cur) => {
      const next = fn(cur);
      photosRef.current = next;
      return next;
    });
  }, []);
  const patchPhoto = useCallback(
    (id: string, patch: Partial<WizardPhoto>) => setPhotos((cur) => cur.map((p) => (p.id === id ? { ...p, ...patch } : p))),
    [setPhotos],
  );

  function update(patch: Partial<OwnerListing>) {
    fieldsDirty.current = true;
    setListing((l) => ({ ...l, ...patch }));
    const cleared = Object.keys(patch) as string[];
    setErrors((e) => {
      const next = { ...e };
      for (const k of cleared) delete next[k as WizardField];
      if (cleared.includes("listingPurpose")) delete next.monthlyRent;
      return next;
    });
  }

  /* ------------------------------------------------------------ locations */

  useEffect(() => {
    void listProvinces()
      .then(setProvinces)
      .catch(() => setProvinces([]));
  }, []);

  useEffect(() => {
    if (!listing.provinceId) {
      setCities([]);
      return;
    }
    let cancelled = false;
    void listCitiesForProvince({ data: { provinceId: listing.provinceId } })
      .then((rows) => {
        if (!cancelled) setCities(rows);
      })
      .catch(() => {
        if (!cancelled) setCities([]);
      });
    return () => {
      cancelled = true;
    };
  }, [listing.provinceId]);

  useEffect(() => {
    if (!listing.districtId) {
      setAreas([]);
      return;
    }
    let cancelled = false;
    void listAreasForCity({ data: { districtId: listing.districtId } })
      .then((rows) => {
        if (!cancelled) setAreas(rows);
      })
      .catch(() => {
        if (!cancelled) setAreas([]);
      });
    return () => {
      cancelled = true;
    };
  }, [listing.districtId]);

  /* ------------------------------------------------------------ keep the form on this device (new ads) */

  useEffect(() => {
    if (mode !== "new" || !fieldsDirty.current) return;
    saveLocalFields(pickDraftFields(listing));
  }, [mode, listing]);

  useEffect(() => {
    if (mode !== "new" || !photosDirty.current) return;
    void saveLocalPhotos(
      photos
        .filter((p) => (p.blob || p.dataUrl) && p.status !== "processing" && !(p.status === "failed" && !p.retryable))
        .map((p) => ({
          id: p.id,
          blob: p.blob,
          dataUrl: p.blob ? undefined : p.dataUrl,
          width: p.width,
          height: p.height,
          isCover: p.isCover,
          uploadedTo: p.uploadedTo,
        })),
    );
  }, [mode, photos]);

  // Warn before leaving while photos are still uploading.
  useEffect(() => {
    const busyUploading = photos.some((p) => p.status === "uploading" || p.status === "processing");
    if (!busyUploading && !publishing) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [photos, publishing]);

  useEffect(
    () => () => {
      for (const p of photosRef.current) if (p.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(p.previewUrl);
    },
    [],
  );

  /* ------------------------------------------------------------ draft id + uploads */

  /** The saved listing photos go to. New ads: the hidden draft made with this form's own id. */
  const ensureDraft = useCallback(async (): Promise<string> => {
    if (draftReady.current) return draftReady.current;
    const attempt = async (): Promise<string> => {
      const id = adIdRef.current ?? getLocalAdId();
      adIdRef.current = id;
      try {
        await createDraft({ data: { id } });
        return id;
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        if (/out of date/i.test(message)) {
          // That id belongs to another account on this device: start a fresh ad id, photos upload again.
          const fresh = resetLocalAdId();
          adIdRef.current = fresh;
          setPhotos((cur) => cur.map((p) => (p.uploadedTo ? { ...p, uploadedTo: undefined, status: "local", progress: 0 } : p)));
          await createDraft({ data: { id: fresh } });
          return fresh;
        }
        throw err;
      }
    };
    draftReady.current = attempt().catch((err) => {
      draftReady.current = null;
      throw err;
    });
    return draftReady.current;
  }, [setPhotos]);

  const runUpload = useCallback(
    async (photoId: string): Promise<boolean> => {
      const start = photosRef.current.find((p) => p.id === photoId);
      if (!start) return false;
      if (start.status === "uploaded" && start.uploadedTo && start.uploadedTo === adIdRef.current) return true;
      patchPhoto(photoId, { status: "uploading", progress: 1, error: undefined });
      let target: string;
      try {
        target = await ensureDraft();
      } catch (err) {
        const message = err instanceof Error && /too many|wait/i.test(err.message) ? err.message : PHOTO_MESSAGES.uploadFailed;
        patchPhoto(photoId, { status: "failed", error: message, retryable: true, progress: 0 });
        return false;
      }
      const { uploadPhoto } = await import("@/lib/upload-photo");
      const { dataUrlToBlob } = await import("@/lib/photo-process");
      for (let tries = 0; tries < 2; tries += 1) {
        const photo = photosRef.current.find((p) => p.id === photoId);
        if (!photo) return false; // removed while waiting
        let blob = photo.blob;
        if (!blob && photo.dataUrl) blob = await dataUrlToBlob(photo.dataUrl).catch(() => undefined);
        if (!blob) {
          patchPhoto(photoId, { status: "failed", error: PHOTO_MESSAGES.readFailed, retryable: false });
          return false;
        }
        const index = photosRef.current.findIndex((p) => p.id === photoId);
        const result = await uploadPhoto({
          propertyId: target,
          photoId,
          blob,
          width: photo.width,
          height: photo.height,
          sortOrder: Math.max(0, index),
          isCover: photo.isCover,
          onProgress: (progress) => patchPhoto(photoId, { progress }),
        });
        if (result.ok) {
          patchPhoto(photoId, { status: "uploaded", progress: 100, uploadedTo: target, error: undefined });
          photosDirty.current = true;
          return true;
        }
        const transient = result.status === 0 || result.status >= 500;
        if (!transient || tries === 1) {
          patchPhoto(photoId, { status: "failed", error: result.error, retryable: result.status !== 413 && result.status !== 415, progress: 0 });
          return false;
        }
        patchPhoto(photoId, { progress: 1 });
        await new Promise((r) => setTimeout(r, 1500));
      }
      return false;
    },
    [ensureDraft, patchPhoto],
  );

  const runUploadRef = useRef(runUpload);
  runUploadRef.current = runUpload;
  const queueRef = useRef<ReturnType<typeof createTaskQueue<{ id: string; resolve: (ok: boolean) => void }>> | null>(null);
  if (!queueRef.current) {
    queueRef.current = createTaskQueue<{ id: string; resolve: (ok: boolean) => void }>(PHOTO_CONCURRENCY, async (item) => {
      let ok = false;
      try {
        ok = await runUploadRef.current(item.id);
      } finally {
        inflight.current.delete(item.id);
        item.resolve(ok);
      }
    });
  }

  /** Upload one photo (3 at a time overall). Calling it again while it is uploading returns the same promise. */
  const startUpload = useCallback((photoId: string): Promise<boolean> => {
    const running = inflight.current.get(photoId);
    if (running) return running;
    const promise = new Promise<boolean>((resolve) => queueRef.current!.add({ id: photoId, resolve }));
    inflight.current.set(photoId, promise);
    return promise;
  }, []);

  const uploadsOnPick = signedIn;

  /* ------------------------------------------------------------ picking photos */

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const room = MAX_IMAGES - photosRef.current.filter((p) => p.status !== "failed" || p.retryable).length;
    const picked = Array.from(files);
    if (picked.length > room) toast.error(PHOTO_MESSAGES.tooMany(MAX_IMAGES));
    const accepted = picked.slice(0, Math.max(0, room));
    if (!accepted.length) return;
    photosDirty.current = true;
    setErrors((e) => ({ ...e, photos: undefined }));
    const tiles: WizardPhoto[] = accepted.map((file) => {
      const check = precheckPhoto(file);
      return {
        id: newClientId(),
        previewUrl: null,
        width: 0,
        height: 0,
        isCover: false,
        name: file.name,
        status: check.kind === "reject" ? "failed" : "processing",
        error: check.kind === "reject" ? check.message : undefined,
        retryable: false,
        progress: 0,
      };
    });
    setPhotos((cur) => withOneCover([...cur, ...tiles]));
    const { shrinkPhoto } = await import("@/lib/photo-process");
    // Shrink one at a time (it is heavy on phones); each photo starts uploading as soon as it is ready.
    for (let i = 0; i < accepted.length; i += 1) {
      const tile = tiles[i];
      if (tile.status === "failed") continue;
      try {
        const out = await shrinkPhoto(accepted[i]);
        if (!photosRef.current.some((p) => p.id === tile.id)) continue; // removed meanwhile
        patchPhoto(tile.id, {
          blob: out.blob,
          width: out.width,
          height: out.height,
          previewUrl: URL.createObjectURL(out.blob),
          status: "local",
          progress: 0,
        });
        if (uploadsOnPick) void startUpload(tile.id);
      } catch (err) {
        patchPhoto(tile.id, {
          status: "failed",
          retryable: false,
          error: err instanceof Error && err.message ? err.message : PHOTO_MESSAGES.readFailed,
        });
      }
    }
  }

  function retryPhoto(id: string) {
    patchPhoto(id, { status: "local", error: undefined, progress: 0 });
    if (uploadsOnPick) void startUpload(id);
  }

  function setCover(imgId: string) {
    photosDirty.current = true;
    setPhotos((cur) => cur.map((p) => ({ ...p, isCover: p.id === imgId })));
    const photo = photosRef.current.find((p) => p.id === imgId);
    if (mode === "edit" && photo?.uploadedTo) {
      void setCoverImage({ data: { propertyId: initial.id, imageId: imgId } }).catch(() =>
        toast.error("Could not change the cover photo. It will be fixed when you save."),
      );
    }
  }

  function removePhoto(imgId: string) {
    const photo = photosRef.current.find((p) => p.id === imgId);
    photosDirty.current = true;
    setPhotos((cur) => withOneCover(cur.filter((p) => p.id !== imgId).map((p) => (photo?.isCover ? { ...p, isCover: false } : p))));
    if (photo?.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(photo.previewUrl);
    if (photo?.uploadedTo) {
      void deleteListingImage({ data: { propertyId: photo.uploadedTo, imageId: imgId } }).catch(() => {
        /* a draft's extra photos are removed again when the ad goes live */
      });
    }
  }

  /* ------------------------------------------------------------ validation + navigation */

  function input() {
    const l = listingRef.current;
    return {
      title: l.title,
      description: l.description,
      propertyType: l.propertyType,
      listingPurpose: l.listingPurpose,
      provinceId: l.provinceId,
      districtId: l.districtId,
      areaId: l.areaId,
      area: l.area,
      monthlyRent: l.monthlyRent,
      bedrooms: l.bedrooms,
      bathrooms: l.bathrooms,
      furnishedStatus: l.furnishedStatus,
      contactPhone: l.contactPhone,
      contactWhatsapp: l.contactWhatsapp,
    };
  }

  function goTo(target: number) {
    setStep(target);
    setMaxStep((m) => Math.max(m, target));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function persistEditInBackground() {
    if (mode !== "edit") return;
    void persistEdit().catch(() => toast.error("Could not save this step. We will try again when you publish."));
  }

  function onContinue() {
    const problems = stepErrors(step, input(), photosRef.current);
    if (Object.keys(problems).length) {
      setErrors((e) => ({ ...e, ...problems }));
      return;
    }
    persistEditInBackground();
    goTo(Math.min(step + 1, STEPS.length - 1));
  }

  async function persistEdit() {
    const l = listingRef.current;
    const result = await saveDraft({
      data: {
        id: l.id,
        title: l.title,
        description: l.description,
        propertyType: l.propertyType,
        listingPurpose: l.listingPurpose,
        provinceId: l.provinceId,
        districtId: l.districtId,
        tehsilId: l.tehsilId,
        areaId: l.areaId,
        area: l.area,
        address: l.address,
        monthlyRent: l.monthlyRent,
        bedrooms: l.bedrooms,
        bathrooms: l.bathrooms,
        furnishedStatus: l.furnishedStatus,
        parking: l.parking,
        electricity: l.electricity,
        gas: l.gas,
        water: l.water,
        maintenance: l.maintenance,
        familyAllowed: l.familyAllowed,
        bachelorAllowed: l.bachelorAllowed,
        petsAllowed: l.petsAllowed,
        contactPhone: l.contactPhone,
        contactWhatsapp: l.contactWhatsapp,
      },
    });
    if (!result.ok) throw new Error(result.error);
    return result;
  }

  /** Show every remaining problem inline and jump to the first step that has one. */
  function blockOnErrors(): boolean {
    const problems = fieldErrors(input(), photosRef.current);
    const usable = Object.fromEntries(Object.entries(problems).filter(([k]) => k !== "other")) as Errors;
    if (problems.other && !Object.keys(usable).length) {
      setPublishError(problems.other);
      return true;
    }
    if (!Object.keys(usable).length) return false;
    setErrors(usable);
    const first = firstStepWithError(usable);
    goTo(first);
    toast.error("Please fix the highlighted field before publishing.");
    return true;
  }

  function rememberPoster() {
    const l = listingRef.current;
    savePosterPrefs({
      listingPurpose: l.listingPurpose as "RENT" | "SALE",
      provinceId: l.provinceId ?? undefined,
      districtId: l.districtId ?? undefined,
      contactPhone: l.contactPhone || undefined,
      contactWhatsapp: l.contactWhatsapp || undefined,
    });
  }

  function showServerError(message: string) {
    setPublishError(message);
    const field = fieldForMessage(message);
    if (field !== "other") {
      setErrors((e) => ({ ...e, [field]: message }));
      goTo(stepForField(field));
    }
  }

  async function publishNew() {
    if (!signedIn) {
      if (blockOnErrors()) return;
      saveLocalFields({ ...pickDraftFields(listingRef.current), publishRequested: true });
      onNeedSignIn?.();
      return;
    }
    if (!lock.current.tryAcquire()) return;
    setPublishing(true);
    setPublishError(null);
    try {
      if (blockOnErrors()) return;
      saveLocalFields({ ...pickDraftFields(listingRef.current), publishRequested: true });
      let adId: string;
      try {
        adId = await ensureDraft();
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        setPublishError(
          publishFailureMessage({ ok: false, adId: "", stage: "draft", message, failedPhotoIds: [] }, !navigator.onLine),
        );
        return;
      }
      const usable = photosRef.current.filter((p) => p.status !== "failed" || p.retryable);
      const result = await publishListing(
        {
          ensureDraft: async () => ({ ok: true }),
          saveFields: async (id) => {
            const l = listingRef.current;
            const r = await saveDraft({ data: { id, ...pickDraftFields(l), tehsilId: l.tehsilId } });
            return r.ok ? { ok: true } : { ok: false, error: r.error };
          },
          uploadPhoto: async (_id, photoId) =>
            (await startUpload(photoId)) ? { ok: true } : { ok: false, error: PHOTO_MESSAGES.uploadFailed },
          activate: async (id, imageIds, coverId) => {
            const r = await submitListing({ data: { id, imageIds, coverId } });
            return r.ok ? { ok: true, status: r.status } : { ok: false, error: r.error };
          },
          onStage: setStage,
        },
        {
          adId,
          photos: usable.map((p) => ({ id: p.id, uploaded: p.status === "uploaded" && p.uploadedTo === adId, isCover: p.isCover })),
        },
      );
      if (!result.ok) {
        saveLocalFields({ ...pickDraftFields(listingRef.current), publishRequested: false });
        const message = publishFailureMessage(result, !navigator.onLine);
        // A rule from the server (e.g. rent too low) points at its field; a dropped connection does not.
        if (result.stage === "activate" && message === result.message) showServerError(message);
        else {
          setPublishError(message);
          if (result.stage === "photos") goTo(2);
        }
        return;
      }
      rememberPoster();
      await clearLocalDraft();
      toast.success(result.status === "PENDING_REVIEW" ? "Your ad was sent for a quick review." : "Your property is now live.");
      await navigate({ to: "/account/listings", replace: true });
    } catch {
      setPublishError("Something went wrong. Your details and photos are still here. Please tap Publish again.");
    } finally {
      setStage(null);
      lock.current.release();
      setPublishing(false);
    }
  }

  async function saveOrPublishEdit() {
    if (!lock.current.tryAcquire()) return;
    setPublishing(true);
    setPublishError(null);
    try {
      if (!live && blockOnErrors()) return;
      setStage("save");
      await persistEdit();
      setStage("photos");
      const pending = photosRef.current.filter((p) => p.status === "local" || p.status === "uploading");
      const results = await Promise.all(pending.map((p) => startUpload(p.id)));
      if (results.some((ok) => !ok) || photosRef.current.some((p) => p.status === "failed" && p.retryable)) {
        setPublishError("Some photos did not upload. Tap Retry on the photo, then save again.");
        goTo(2);
        return;
      }
      if (live) {
        rememberPoster();
        toast.success("Your listing has been updated.");
        await navigate({ to: "/account/listings" });
        return;
      }
      setStage("activate");
      const kept = photosRef.current.filter((p) => p.status === "uploaded");
      const r = await submitListing({
        data: { id: initial.id, imageIds: kept.map((p) => p.id), coverId: kept.find((p) => p.isCover)?.id ?? null },
      });
      if (!r.ok) {
        showServerError(r.error);
        return;
      }
      rememberPoster();
      toast.success(r.status === "PENDING_REVIEW" ? "Your ad was sent for a quick review." : "Your property is now live.");
      await navigate({ to: "/account/listings" });
    } catch (err) {
      setPublishError(
        !navigator.onLine
          ? "No internet connection. Your changes are still here. Connect and tap the button again."
          : err instanceof Error && err.message
            ? err.message
            : "Something went wrong. Please try again.",
      );
    } finally {
      setStage(null);
      lock.current.release();
      setPublishing(false);
    }
  }

  function onPublish() {
    if (publishing || lock.current.held) return;
    void (mode === "edit" ? saveOrPublishEdit() : publishNew());
  }

  // A guest pressed Publish, signed in, and came back: publish now without another tap.
  useEffect(() => {
    if (!autoPublish || !signedIn || autoPublished.current) return;
    autoPublished.current = true;
    goTo(STEPS.length - 1);
    void publishNew();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when the signed-in guest returns
  }, [autoPublish, signedIn]);

  /* ------------------------------------------------------------ render */

  const progress = ((step + 1) / STEPS.length) * 100;
  const locLabel = useMemo(() => formatLocation(listing), [listing]);
  const price = formatListingPrice(listing.monthlyRent, listing.listingPurpose);
  const suggestedTitle = autoListingTitle({
    propertyType: listing.propertyType,
    bedrooms: listing.bedrooms,
    listingPurpose: listing.listingPurpose,
    area: listing.area,
    districtName: cities.find((c) => c.id === listing.districtId)?.name ?? listing.districtName,
  });
  const shownTitle = needsAutoTitle(listing.title) ? suggestedTitle : listing.title;
  const coverPhoto = photos.find((p) => p.isCover && p.previewUrl) ?? photos.find((p) => p.previewUrl);
  const uploadingCount = photos.filter((p) => p.status === "uploading").length;
  const doneCount = photos.filter((p) => p.status === "uploaded").length;
  const visiblePhotos = photos.filter((p) => p.status !== "failed" || p.retryable).length;
  const publishLabel = live ? "Save changes" : "Publish ad";

  return (
    <div className="mx-auto w-[min(760px,calc(100%-24px))] pb-36 pt-6 sm:py-8 sm:pb-36">
      <p className="text-[10px] font-extrabold tracking-[0.16em] text-forest">{live ? "EDIT YOUR AD" : "POST A PROPERTY"}</p>
      <h1 className="font-display mt-2 text-3xl tracking-tight">{live ? "Edit your property" : "List your property"}</h1>
      <p className="mt-1 text-sm text-muted">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}.{" "}
        {live ? "Changes show on your live ad after you save." : "Your ad goes live as soon as you publish."}
      </p>
      {mode === "new" && !signedIn ? (
        <p className="mt-1 text-xs text-muted">
          No account needed to fill this in. Your details and photos are saved on this device; you sign in only when you
          press Publish.
        </p>
      ) : null}

      <ol className="mt-4 flex gap-1" aria-label="Steps">
        {STEPS.map((label, i) => {
          const reachable = i <= maxStep && !publishing;
          return (
            <li key={label} className="flex-1">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => goTo(i)}
                aria-current={i === step ? "step" : undefined}
                aria-label={`Step ${i + 1}: ${label}`}
                className="block h-11 w-full disabled:cursor-default"
              >
                <span
                  className={`block h-1.5 rounded-full ${i <= step ? "bg-forest" : i <= maxStep ? "bg-forest/30" : "bg-sand"}`}
                />
                <span className={`mt-1.5 hidden text-[11px] font-semibold sm:block ${i === step ? "text-forest" : "text-muted"}`}>
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="sr-only" aria-live="polite">
        Step {step + 1} of {STEPS.length}, {Math.round(progress)} percent
      </div>

      <div className="mt-6 grid gap-5">
        {step === 0 && (
          <>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Rent or sale">
              {(["RENT", "SALE"] as const).map((purpose) => (
                <button
                  key={purpose}
                  type="button"
                  role="radio"
                  aria-checked={listing.listingPurpose === purpose}
                  className={`min-h-12 rounded-md border text-base font-bold ${
                    listing.listingPurpose === purpose ? "border-forest bg-forest text-white" : "border-line bg-white text-ink"
                  }`}
                  onClick={() => update({ listingPurpose: purpose })}
                >
                  {purpose === "RENT" ? "For rent" : "For sale"}
                </button>
              ))}
            </div>
            <Label>
              Province / region
              <Select
                className={FIELD}
                value={listing.provinceId || ""}
                aria-invalid={Boolean(errors.provinceId)}
                aria-describedby={errors.provinceId ? "err-province" : undefined}
                onChange={(e) =>
                  update({ provinceId: e.target.value, districtId: null, tehsilId: null, areaId: null, area: "" })
                }
              >
                <option value="">Select province</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
              <FieldError id="err-province" message={errors.provinceId} />
            </Label>
            <Label>
              City
              <Select
                className={FIELD}
                value={listing.districtId || ""}
                disabled={!listing.provinceId}
                aria-invalid={Boolean(errors.districtId)}
                aria-describedby={errors.districtId ? "err-city" : undefined}
                onChange={(e) => update({ districtId: e.target.value || null, tehsilId: null, areaId: null, area: "" })}
              >
                <option value="">{listing.provinceId ? "Select city" : "Choose a province first"}</option>
                {cities.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
                {listing.districtId && !cities.some((c) => c.id === listing.districtId) ? (
                  <option value={listing.districtId}>{listing.districtName || "Your last city"}</option>
                ) : null}
              </Select>
              <FieldError id="err-city" message={errors.districtId} />
            </Label>
            <Label>
              Area (recommended)
              <Select
                className={FIELD}
                value={listing.areaId || ""}
                disabled={!listing.districtId}
                onChange={(e) => {
                  const selected = areas.find((a) => a.id === e.target.value);
                  update({ areaId: e.target.value || null, area: selected?.name || "" });
                }}
              >
                <option value="">Select area</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
                {listing.area && !areas.some((a) => a.id === listing.areaId || a.name === listing.area) && (
                  <option value={listing.areaId || ""}>{listing.area}</option>
                )}
              </Select>
            </Label>
            <Label>
              Address (optional)
              <Input
                className={FIELD}
                value={listing.address}
                autoComplete="street-address"
                onChange={(e) => update({ address: e.target.value })}
                placeholder="Street, house number or nearby landmark"
              />
            </Label>
          </>
        )}

        {step === 1 && (
          <>
            <Label>
              Property type
              <Select
                className={FIELD}
                value={listing.propertyType}
                onChange={(e) => update({ propertyType: e.target.value as OwnerListing["propertyType"] })}
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Label>
            <Label>
              {listing.listingPurpose === "SALE" ? "Sale price (Rs.)" : "Monthly rent (Rs.)"}
              <Input
                className={FIELD}
                inputMode="numeric"
                enterKeyHint="next"
                value={listing.monthlyRent ? listing.monthlyRent.toLocaleString("en-PK") : ""}
                aria-invalid={Boolean(errors.monthlyRent)}
                aria-describedby={errors.monthlyRent ? "err-price" : "price-hint"}
                onChange={(e) => update({ monthlyRent: Number(e.target.value.replace(/[^\d]/g, "").slice(0, 10)) || 0 })}
                placeholder={listing.listingPurpose === "SALE" ? "18,500,000" : "65,000"}
              />
              {errors.monthlyRent ? (
                <FieldError id="err-price" message={errors.monthlyRent} />
              ) : listing.monthlyRent ? (
                <span id="price-hint" className="text-sm font-semibold normal-case tracking-normal text-forest">
                  {price.amount}
                  {price.suffix ? ` ${price.suffix}` : ""}
                </span>
              ) : null}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Label>
                Bedrooms
                <Select
                  className={FIELD}
                  value={String(listing.bedrooms)}
                  onChange={(e) => update({ bedrooms: Number(e.target.value) })}
                >
                  {Array.from({ length: 11 }, (_, n) => (
                    <option key={n} value={n}>
                      {n === 0 ? "Studio / none" : n === 10 ? "10+" : n}
                    </option>
                  ))}
                </Select>
              </Label>
              <Label>
                Bathrooms
                <Select
                  className={FIELD}
                  value={String(listing.bathrooms)}
                  onChange={(e) => update({ bathrooms: Number(e.target.value) })}
                >
                  {Array.from({ length: 11 }, (_, n) => (
                    <option key={n} value={n}>
                      {n === 10 ? "10+" : n}
                    </option>
                  ))}
                </Select>
              </Label>
            </div>
            <Label>
              Furnished status
              <Select
                className={FIELD}
                value={listing.furnishedStatus}
                onChange={(e) => update({ furnishedStatus: e.target.value as OwnerListing["furnishedStatus"] })}
              >
                {FURNISHED_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {FURNISHED_LABEL[s]}
                  </option>
                ))}
              </Select>
            </Label>
            <Label>
              Listing title (optional)
              <Input
                className={FIELD}
                value={listing.title === "Untitled listing" ? "" : listing.title}
                maxLength={80}
                placeholder={`Leave blank to use: ${suggestedTitle}`}
                onChange={(e) => update({ title: e.target.value })}
              />
            </Label>
          </>
        )}

        {step === 2 && (
          <div>
            <p className="text-sm text-muted">
              Add at least 1 photo (up to {MAX_IMAGES}). JPG, PNG or iPhone (HEIC). Big photos are shrunk on your phone
              so they upload fast.
            </p>
            {visiblePhotos < MAX_IMAGES ? (
              <label
                className={`mt-3 flex min-h-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed bg-sand px-4 text-center text-base font-semibold text-ink active:bg-sand/70 ${
                  errors.photos ? "border-danger" : "border-line"
                }`}
              >
                <ImagePlus className="size-7 text-forest" aria-hidden="true" />
                {photos.length ? "Add more photos" : "Add photos"}
                <span className="text-xs font-normal text-muted">Tap to choose from your gallery or camera</span>
                <input
                  type="file"
                  accept={PHOTO_ACCEPT}
                  multiple
                  className="sr-only"
                  aria-describedby={errors.photos ? "err-photos" : undefined}
                  onChange={(e) => {
                    void onFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            ) : null}
            <div className="mt-2">
              <FieldError id="err-photos" message={errors.photos} />
            </div>
            {photos.length ? (
              <p className="mt-3 text-xs text-muted" aria-live="polite">
                {uploadingCount
                  ? `Uploading ${uploadingCount} photo${uploadingCount > 1 ? "s" : ""}… you can keep filling in the form.`
                  : signedIn
                    ? `${doneCount} of ${visiblePhotos} photo${visiblePhotos === 1 ? "" : "s"} saved.`
                    : "Photos are kept on this device and upload when you publish."}
              </p>
            ) : null}
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((img) => (
                <div
                  key={img.id}
                  className={`relative overflow-hidden rounded-lg border ${img.status === "failed" ? "border-danger" : "border-line"}`}
                >
                  <div className="relative h-32 bg-sand">
                    {img.previewUrl ? (
                      <img src={img.previewUrl} alt="" className="h-32 w-full object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-xs text-muted">
                        {img.status === "processing" ? (
                          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                        ) : (
                          <AlertCircle className="size-5 text-danger" aria-hidden="true" />
                        )}
                      </div>
                    )}
                    {img.isCover && img.status !== "failed" ? (
                      <span className="absolute left-2 top-2 rounded bg-lime px-1.5 py-0.5 text-[10px] font-bold">Cover</span>
                    ) : null}
                    {img.status === "uploaded" && signedIn ? (
                      <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-forest text-white">
                        <Check className="size-3.5" aria-label="Uploaded" />
                      </span>
                    ) : null}
                    {img.status === "processing" || img.status === "uploading" ? (
                      <div className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1 text-[11px] font-semibold text-white">
                        {img.status === "processing" ? "Preparing…" : `Uploading ${img.progress}%`}
                        <div className="mt-1 h-1 overflow-hidden rounded bg-white/30">
                          <div
                            className="h-full bg-white transition-[width]"
                            style={{ width: `${img.status === "processing" ? 8 : img.progress}%` }}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                  {img.status === "failed" ? (
                    <div className="grid gap-1 p-2">
                      <p className="text-[11px] leading-snug text-danger" role="alert">
                        {img.name ? <strong className="block truncate">{img.name}</strong> : null}
                        {img.error}
                      </p>
                      <div className="flex">
                        {img.retryable ? (
                          <button
                            type="button"
                            className="flex min-h-11 flex-1 items-center justify-center gap-1 text-sm font-semibold text-forest"
                            onClick={() => retryPhoto(img.id)}
                          >
                            <RotateCcw className="size-4" /> Retry
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="flex min-h-11 flex-1 items-center justify-center gap-1 text-sm text-danger"
                          onClick={() => removePhoto(img.id)}
                        >
                          <Trash2 className="size-4" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex">
                      <button
                        type="button"
                        className="flex min-h-11 flex-1 items-center justify-center gap-1 text-sm disabled:opacity-40"
                        disabled={img.isCover || img.status === "processing"}
                        onClick={() => setCover(img.id)}
                        aria-label="Make this the cover photo"
                      >
                        <Star className="size-4" /> Cover
                      </button>
                      <button
                        type="button"
                        className="flex min-h-11 flex-1 items-center justify-center gap-1 text-sm text-danger"
                        onClick={() => removePhoto(img.id)}
                        aria-label="Remove this photo"
                      >
                        <Trash2 className="size-4" /> Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <>
            <Label>
              Description (optional)
              <Textarea
                className="text-base font-normal sm:text-sm"
                rows={6}
                maxLength={4000}
                value={listing.description}
                placeholder="Mention parking, utilities, furnished status, nearby landmarks and who the home suits."
                onChange={(e) => update({ description: e.target.value })}
              />
            </Label>
            <fieldset className="grid gap-2 sm:grid-cols-2">
              <legend className="mb-1 text-sm font-semibold text-ink">What does this home include? (optional)</legend>
              {AMENITIES.map(([key, label]) => (
                <label key={key} className="flex min-h-12 items-center gap-3 rounded-md border border-line px-3 text-base sm:text-sm">
                  <input
                    type="checkbox"
                    className="size-5 accent-forest"
                    checked={Boolean(listing[key])}
                    onChange={(e) => update({ [key]: e.target.checked } as Partial<OwnerListing>)}
                  />
                  {label}
                </label>
              ))}
            </fieldset>
          </>
        )}

        {step === 4 && (
          <>
            <Label>
              Mobile number
              <Input
                className={FIELD}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={listing.contactPhone || ""}
                placeholder="03xx xxxxxxx"
                aria-invalid={Boolean(errors.contactPhone)}
                aria-describedby={errors.contactPhone ? "err-phone" : undefined}
                onChange={(e) => update({ contactPhone: e.target.value })}
              />
              <FieldError id="err-phone" message={errors.contactPhone} />
            </Label>
            <Label>
              WhatsApp (optional)
              <Input
                className={FIELD}
                type="tel"
                inputMode="tel"
                value={listing.contactWhatsapp || ""}
                placeholder="Same as mobile if left blank"
                aria-invalid={Boolean(errors.contactWhatsapp)}
                aria-describedby={errors.contactWhatsapp ? "err-wa" : undefined}
                onChange={(e) => update({ contactWhatsapp: e.target.value })}
              />
              <FieldError id="err-wa" message={errors.contactWhatsapp} />
            </Label>
            <p className="text-xs text-muted">
              People will use these numbers to call or message you. Do not add CNIC, email or payment details.
            </p>
          </>
        )}

        {step === 5 && (
          <div className="overflow-hidden rounded-xl border border-line bg-sand">
            {coverPhoto?.previewUrl ? <img src={coverPhoto.previewUrl} alt="" className="h-48 w-full object-cover" /> : null}
            <div className="p-5">
              <p className="text-[10px] font-extrabold tracking-[0.16em] text-forest">PREVIEW</p>
              <p className="mt-2 text-[10px] font-extrabold tracking-[0.14em] text-forest">
                {PURPOSE_KICKER[listing.listingPurpose as ListingPurpose]}
              </p>
              <h2 className="font-display mt-1 text-2xl">{shownTitle}</h2>
              <p className="mt-1 text-lg font-extrabold">
                {price.amount}
                {price.suffix ? <span className="text-sm font-normal text-muted"> {price.suffix}</span> : null}
              </p>
              <p className="text-sm text-muted">
                {locLabel || "Location not set"} · {listing.propertyType}
              </p>
              <p className="mt-3 text-sm">
                {listing.bedrooms} beds · {listing.bathrooms} baths · {visiblePhotos} photo{visiblePhotos === 1 ? "" : "s"}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{listing.description || "No description yet."}</p>
              <p className="mt-4 text-sm">
                Phone: {listing.contactPhone || "Not set"}
                {listing.contactWhatsapp ? ` · WhatsApp: ${listing.contactWhatsapp}` : ""}
              </p>
              <p className="mt-4 text-sm text-muted">
                {mode === "new" && !signedIn
                  ? "When you press Publish you will be asked to sign in (Google or email). Your ad then goes live straight away."
                  : live
                    ? "Your changes show on the live ad after you save."
                    : "This listing goes live as soon as its photos are saved."}
              </p>
            </div>
          </div>
        )}

        {publishError ? (
          <div className="flex items-start gap-2 rounded-md bg-red-50 px-3 py-3 text-sm text-danger" role="alert">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{publishError}</span>
          </div>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto flex w-[min(760px,100%)] gap-3">
          {step > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="min-w-24"
              onClick={() => goTo(step - 1)}
              disabled={publishing}
            >
              Back
            </Button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <Button type="button" size="lg" className="flex-1" onClick={onContinue} disabled={publishing}>
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              className="flex-1"
              onClick={onPublish}
              disabled={publishing}
              aria-busy={publishing}
            >
              {publishing ? (
                <>
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  {stage ? STAGE_LABEL[stage] : "Publishing…"}
                </>
              ) : publishError ? (
                live ? "Save again" : "Publish again"
              ) : (
                publishLabel
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

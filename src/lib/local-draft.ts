/**
 * Keeps a logged-out visitor's listing on their own device until they sign in to publish.
 * Fields go to localStorage; compressed photos go to IndexedDB (too large for localStorage).
 */
import type { OwnerListing } from "./types";

const FIELDS_KEY = "apnaghar:post-draft:v1";
const DB_NAME = "apnaghar-post";
const STORE = "photos";
const PHOTOS_KEY = "draft";

export type LocalPhoto = { id: string; dataUrl: string; width: number; height: number; isCover: boolean };
export type LocalDraftFields = Pick<
  OwnerListing,
  | "title"
  | "description"
  | "propertyType"
  | "listingPurpose"
  | "provinceId"
  | "districtId"
  | "areaId"
  | "area"
  | "address"
  | "monthlyRent"
  | "bedrooms"
  | "bathrooms"
  | "furnishedStatus"
  | "parking"
  | "electricity"
  | "gas"
  | "water"
  | "maintenance"
  | "familyAllowed"
  | "bachelorAllowed"
  | "petsAllowed"
  | "contactPhone"
  | "contactWhatsapp"
> & { publishRequested?: boolean; savedAt?: string };

export const LOCAL_DRAFT_ID = "local-draft";

export function blankLocalListing(): OwnerListing {
  const now = new Date().toISOString();
  return {
    id: LOCAL_DRAFT_ID,
    slug: "",
    title: "",
    description: "",
    propertyType: "House",
    listingPurpose: "RENT",
    status: "DRAFT",
    provinceId: null,
    districtId: null,
    tehsilId: null,
    areaId: null,
    provinceName: null,
    districtName: null,
    tehsilName: null,
    areaName: null,
    provinceSlug: null,
    districtSlug: null,
    tehsilSlug: null,
    areaSlug: null,
    area: "",
    address: "",
    latitude: null,
    longitude: null,
    monthlyRent: 0,
    securityDeposit: null,
    advanceRent: null,
    bedrooms: 0,
    bathrooms: 0,
    propertySize: null,
    sizeUnit: "MARLA",
    floor: null,
    totalFloors: null,
    furnishedStatus: "UNFURNISHED",
    parking: false,
    electricity: true,
    gas: false,
    water: true,
    maintenance: false,
    familyAllowed: true,
    bachelorAllowed: false,
    petsAllowed: false,
    availableFrom: null,
    isFeatured: false,
    isSample: false,
    viewCount: 0,
    createdAt: now,
    publishedAt: null,
    expiresAt: null,
    coverImage: null,
    images: [],
    advertiser: { displayName: "", imageUrl: null, googleVerified: false, trustedAdvertiser: false },
    contactPhone: "",
    contactWhatsapp: null,
    ownerId: "",
    rejectionReason: null,
    saveCount: 0,
    callClicks: 0,
    whatsappClicks: 0,
  } as OwnerListing;
}

export function pickDraftFields(l: OwnerListing): LocalDraftFields {
  return {
    title: l.title,
    description: l.description,
    propertyType: l.propertyType,
    listingPurpose: l.listingPurpose,
    provinceId: l.provinceId,
    districtId: l.districtId,
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
  };
}

export function saveLocalFields(fields: LocalDraftFields) {
  try {
    localStorage.setItem(FIELDS_KEY, JSON.stringify({ ...fields, savedAt: new Date().toISOString() }));
  } catch {
    /* storage full or blocked: the in-memory draft still works */
  }
}

export function loadLocalFields(): LocalDraftFields | null {
  try {
    const raw = localStorage.getItem(FIELDS_KEY);
    return raw ? (JSON.parse(raw) as LocalDraftFields) : null;
  } catch {
    return null;
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveLocalPhotos(photos: LocalPhoto[]) {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(photos, PHOTOS_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* ignore: photos stay in memory for this visit */
  }
}

export async function loadLocalPhotos(): Promise<LocalPhoto[]> {
  try {
    const db = await openDb();
    const result = await new Promise<LocalPhoto[]>((resolve, reject) => {
      const req = db.transaction(STORE, "readonly").objectStore(STORE).get(PHOTOS_KEY);
      req.onsuccess = () => resolve((req.result as LocalPhoto[] | undefined) ?? []);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return result;
  } catch {
    return [];
  }
}

export async function clearLocalDraft() {
  try {
    localStorage.removeItem(FIELDS_KEY);
  } catch {
    /* ignore */
  }
  await saveLocalPhotos([]);
}

export function hasMeaningfulDraft(fields: LocalDraftFields | null): boolean {
  if (!fields) return false;
  return Boolean(fields.districtId || fields.monthlyRent || (fields.contactPhone || "").trim());
}

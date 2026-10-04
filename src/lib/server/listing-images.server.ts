/**
 * Saving one listing photo (server-only). Shared by the `addListingImage` server function and the
 * `/api/listing-images` upload route (which the browser uses for real upload progress).
 *
 * Idempotent: the browser makes the photo id. If that id is already saved on this listing (a retry after
 * a dropped connection), the saved photo is returned instead of a second copy.
 */
import { getSql } from "@/lib/db";
import { MAX_IMAGE_BYTES, MAX_IMAGES } from "@/lib/constants";
import { canMutateListing } from "@/lib/authz";
import { byteLengthOfBase64, sniffImageMime } from "@/lib/image-magic";
import { isClientId } from "@/lib/post-ad";
import { newId } from "@/lib/utils";
import { requireActiveProfile } from "./profile";

export type SavedImage = {
  id: string;
  url: string;
  sortOrder: number;
  isCover: boolean;
  width: number | null;
  height: number | null;
};

export type InsertImageInput = {
  propertyId: string;
  /** Base64 (or a data: URL) of the already-shrunk photo. */
  dataBase64: string;
  id?: string;
  width?: number | null;
  height?: number | null;
  sortOrder?: number | null;
  isCover?: boolean | null;
};

export type InsertImageResult = { ok: true; image: SavedImage; duplicate: boolean } | { ok: false; error: string; status: number };

function toInt(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n < 100_000 ? Math.round(n) : null;
}

export async function insertListingImage(userId: string, input: InsertImageInput): Promise<InsertImageResult> {
  const profile = await requireActiveProfile(userId);
  const sql = await getSql();
  const rows = await sql`select owner_id, status from properties where id = ${input.propertyId} limit 1`;
  const row = rows[0];
  if (!row) return { ok: false, error: "Listing not found.", status: 404 };
  if (!canMutateListing({ userId, role: profile.role, status: profile.status }, String(row.owner_id))) {
    return { ok: false, error: "You do not have permission to change this listing.", status: 403 };
  }
  if (row.status === "DELETED") return { ok: false, error: "This listing has been deleted.", status: 409 };

  const id = isClientId(input.id) ? input.id : newId();
  const width = toInt(input.width);
  const height = toInt(input.height);
  const existing = await sql<{
    id: string;
    property_id: string;
    sort_order: number;
    is_cover: boolean;
    width: number | null;
    height: number | null;
  }>`select id, property_id, sort_order, is_cover, width, height from property_images where id = ${id} limit 1`;
  if (existing[0]) {
    if (existing[0].property_id !== input.propertyId) {
      return { ok: false, error: "This photo belongs to another listing.", status: 409 };
    }
    const e = existing[0];
    return {
      ok: true,
      duplicate: true,
      image: { id: e.id, url: `/api/images/${e.id}`, sortOrder: e.sort_order, isCover: e.is_cover, width: e.width, height: e.height },
    };
  }

  const count = await sql<{ n: number }>`select count(*)::int as n from property_images where property_id = ${input.propertyId}`;
  const n = count[0]?.n ?? 0;
  if (n >= MAX_IMAGES) return { ok: false, error: `You can add up to ${MAX_IMAGES} photos.`, status: 409 };

  const raw = input.dataBase64.includes(",") ? input.dataBase64.slice(input.dataBase64.indexOf(",") + 1) : input.dataBase64;
  const mime = sniffImageMime(raw);
  if (!mime) return { ok: false, error: "Only JPEG, PNG and WebP images are allowed.", status: 415 };
  if (byteLengthOfBase64(raw) > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Each photo must be under 1.5 MB after compression.", status: 413 };
  }

  const sortOrder = toInt(input.sortOrder) ?? n;
  // Parallel uploads all see the same count, so the browser says which photo is the cover.
  const isCover = typeof input.isCover === "boolean" ? input.isCover : n === 0;
  await sql`insert into property_images (
      id, property_id, storage_key, mime_type, byte_data, width, height, sort_order, is_cover
    ) values (
      ${id}, ${input.propertyId}, ${`properties/${input.propertyId}/${id}`}, ${mime}, ${raw},
      ${width}, ${height}, ${sortOrder}, ${isCover}
    ) on conflict (id) do nothing`;

  // Two uploads racing past the limit: keep the earlier ones, undo this one.
  const after = await sql<{ n: number }>`select count(*)::int as n from property_images where property_id = ${input.propertyId}`;
  if ((after[0]?.n ?? 0) > MAX_IMAGES) {
    await sql`delete from property_images where id = ${id} and property_id = ${input.propertyId}`;
    return { ok: false, error: `You can add up to ${MAX_IMAGES} photos.`, status: 409 };
  }
  if (isCover) {
    await sql`update property_images set is_cover = false where property_id = ${input.propertyId} and id <> ${id}`;
  }
  return { ok: true, duplicate: false, image: { id, url: `/api/images/${id}`, sortOrder, isCover, width, height } };
}

/**
 * Before an ad goes live: keep only the photos the form still shows, in its order, with exactly one cover.
 * Photos removed while offline are deleted here. Only used for listings that are not live yet.
 */
export async function syncDraftImages(propertyId: string, ordered: { id: string; sortOrder: number; isCover: boolean }[]) {
  const sql = await getSql();
  const saved = await sql<{ id: string }>`select id from property_images where property_id = ${propertyId}`;
  const keep = new Set(ordered.map((o) => o.id));
  for (const s of saved) {
    if (!keep.has(s.id)) await sql`delete from property_images where id = ${s.id} and property_id = ${propertyId}`;
  }
  const savedIds = new Set(saved.map((s) => s.id));
  for (const o of ordered) {
    if (!savedIds.has(o.id)) continue;
    await sql`update property_images set sort_order = ${o.sortOrder}, is_cover = ${o.isCover}
      where id = ${o.id} and property_id = ${propertyId}`;
  }
}

/** Make sure a listing has exactly one cover (the flagged one, else the first by order). */
export async function ensureOneCover(propertyId: string) {
  const sql = await getSql();
  const imgs = await sql<{ id: string; is_cover: boolean; sort_order: number }>`
    select id, is_cover, sort_order from property_images where property_id = ${propertyId} order by sort_order asc, created_at asc`;
  if (!imgs.length) return;
  const covers = imgs.filter((i) => i.is_cover);
  if (covers.length === 1) return;
  const chosen = covers[0]?.id ?? imgs[0].id;
  await sql`update property_images set is_cover = (id = ${chosen}) where property_id = ${propertyId}`;
}

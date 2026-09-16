import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { LISTING_DURATION_DAYS, MAX_IMAGE_BYTES, MAX_IMAGES } from "@/lib/constants";
import { canMutateListing } from "@/lib/authz";
import { canOwnerTransition, daysFromNow, isExpired, ownerNextStatus, type OwnerAction } from "@/lib/listing-lifecycle";
import { byteLengthOfBase64, sniffImageMime } from "@/lib/image-magic";
import { normalizePkPhone } from "@/lib/phone";
import { slugify, newId } from "@/lib/utils";
import { validateForSubmit } from "@/lib/validate-listing";
import { requireActiveProfile } from "./profile";
import { ensureSeedData } from "./seed";
import { mapImage, mapOwner, mapPublic, PROPERTY_FROM, PROPERTY_SELECT, type PropertyRow } from "./mappers";

const DraftSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  propertyType: z.string().optional(),
  provinceId: z.string().nullable().optional(),
  districtId: z.string().nullable().optional(),
  tehsilId: z.string().nullable().optional(),
  area: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  monthlyRent: z.number().optional(),
  securityDeposit: z.number().nullable().optional(),
  advanceRent: z.number().nullable().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  propertySize: z.number().nullable().optional(),
  sizeUnit: z.string().optional(),
  floor: z.number().nullable().optional(),
  totalFloors: z.number().nullable().optional(),
  furnishedStatus: z.string().optional(),
  parking: z.boolean().optional(),
  electricity: z.boolean().optional(),
  gas: z.boolean().optional(),
  water: z.boolean().optional(),
  maintenance: z.boolean().optional(),
  familyAllowed: z.boolean().optional(),
  bachelorAllowed: z.boolean().optional(),
  petsAllowed: z.boolean().optional(),
  availableFrom: z.string().nullable().optional(),
  contactPhone: z.string().optional(),
  contactWhatsapp: z.string().nullable().optional(),
});

async function uniqueSlug(title: string, area: string, districtName: string, excludeId?: string) {
  const sql = await getSql();
  const base = [slugify(title), slugify(area), slugify(districtName)].filter(Boolean).join("-") || "rental-home";
  let slug = base;
  let n = 0;
  while (true) {
    const rows = excludeId
      ? await sql`select id from properties where slug = ${slug} and id <> ${excludeId} limit 1`
      : await sql`select id from properties where slug = ${slug} limit 1`;
    if (rows.length === 0) return slug;
    n += 1;
    slug = `${base}-${n + 1}`;
  }
}

async function loadOwnerListing(id: string, userId: string) {
  const sql = await getSql();
  const rows = await sql.query<PropertyRow>(
    `select ${PROPERTY_SELECT} from ${PROPERTY_FROM} where p.id = $1 limit 1`,
    [id],
  );
  const row = rows[0];
  if (!row || row.owner_id !== userId) return null;
  const imageRows = await sql.query<{
    id: string;
    url: string | null;
    sort_order: number;
    is_cover: boolean;
    width: number | null;
    height: number | null;
  }>(
    `select id, url, sort_order, is_cover, width, height from property_images where property_id = $1 order by sort_order asc`,
    [id],
  );
  const saves = await sql<{ n: number }>`select count(*)::int as n from favorites where property_id = ${id}`;
  const calls = await sql<{ n: number }>`select count(*)::int as n from listing_events where property_id = ${id} and event_type = 'call'`;
  const wa = await sql<{ n: number }>`select count(*)::int as n from listing_events where property_id = ${id} and event_type = 'whatsapp'`;
  return mapOwner(row, imageRows.map(mapImage), {
    saves: saves[0]?.n ?? 0,
    calls: calls[0]?.n ?? 0,
    whatsapp: wa[0]?.n ?? 0,
  });
}

export const createDraft = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await ensureSeedData();
    await requireActiveProfile(context.userId);
    const sql = await getSql();
    const id = newId();
    const slug = `draft-${id.slice(0, 8)}`;
    await sql`insert into properties (id, owner_id, title, slug, status)
      values (${id}, ${context.userId}, ${"Untitled listing"}, ${slug}, ${"DRAFT"})`;
    const listing = await loadOwnerListing(id, context.userId);
    return listing!;
  });

export const saveDraft = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) => DraftSchema.parse(data))
  .handler(async ({ context, data }) => {
    const profile = await requireActiveProfile(context.userId);
    const sql = await getSql();
    if (!data.id) return { ok: false as const, error: "Missing listing id." };
    const existing = await sql`select * from properties where id = ${data.id} limit 1`;
    const row = existing[0];
    if (!row) return { ok: false as const, error: "Listing not found." };
    if (!canMutateListing({ userId: context.userId, role: profile.role, status: profile.status }, String(row.owner_id))) {
      return { ok: false as const, error: "You do not have permission to edit this listing." };
    }
    if (row.status === "DELETED") return { ok: false as const, error: "This listing has been deleted." };

    const phone = data.contactPhone ? normalizePkPhone(data.contactPhone) : String(row.contact_phone || "");
    const wa = data.contactWhatsapp
      ? normalizePkPhone(data.contactWhatsapp)
      : data.contactPhone
        ? phone
        : String(row.contact_whatsapp || "");
    const title = (data.title ?? String(row.title)).trim().slice(0, 80) || "Untitled listing";
    let slug = String(row.slug);
    if (title !== row.title || data.area) {
      const districtRows = data.districtId
        ? await sql<{ name: string }>`select name from districts where id = ${data.districtId} limit 1`
        : [];
      slug = await uniqueSlug(title, data.area || String(row.area || ""), districtRows[0]?.name || "", data.id);
    }
    await sql`update properties set
      title = ${title},
      slug = ${slug},
      description = ${data.description ?? row.description},
      property_type = ${data.propertyType ?? row.property_type},
      province_id = ${data.provinceId === undefined ? row.province_id : data.provinceId},
      district_id = ${data.districtId === undefined ? row.district_id : data.districtId},
      tehsil_id = ${data.tehsilId === undefined ? row.tehsil_id : data.tehsilId},
      area = ${data.area ?? row.area},
      address = ${data.address ?? row.address},
      latitude = ${data.latitude === undefined ? row.latitude : data.latitude},
      longitude = ${data.longitude === undefined ? row.longitude : data.longitude},
      monthly_rent = ${data.monthlyRent ?? row.monthly_rent},
      security_deposit = ${data.securityDeposit === undefined ? row.security_deposit : data.securityDeposit},
      advance_rent = ${data.advanceRent === undefined ? row.advance_rent : data.advanceRent},
      bedrooms = ${data.bedrooms ?? row.bedrooms},
      bathrooms = ${data.bathrooms ?? row.bathrooms},
      property_size = ${data.propertySize === undefined ? row.property_size : data.propertySize},
      size_unit = ${data.sizeUnit ?? row.size_unit},
      floor = ${data.floor === undefined ? row.floor : data.floor},
      total_floors = ${data.totalFloors === undefined ? row.total_floors : data.totalFloors},
      furnished_status = ${data.furnishedStatus ?? row.furnished_status},
      parking = ${data.parking ?? row.parking},
      electricity = ${data.electricity ?? row.electricity},
      gas = ${data.gas ?? row.gas},
      water = ${data.water ?? row.water},
      maintenance = ${data.maintenance ?? row.maintenance},
      family_allowed = ${data.familyAllowed ?? row.family_allowed},
      bachelor_allowed = ${data.bachelorAllowed ?? row.bachelor_allowed},
      pets_allowed = ${data.petsAllowed ?? row.pets_allowed},
      available_from = ${data.availableFrom === undefined ? row.available_from : data.availableFrom},
      contact_phone = ${phone || row.contact_phone},
      contact_whatsapp = ${wa || row.contact_whatsapp},
      updated_at = ${new Date().toISOString()}
      where id = ${data.id} and owner_id = ${context.userId}`;
    const listing = await loadOwnerListing(data.id, context.userId);
    return { ok: true as const, listing };
  });

export const submitListing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    await requireActiveProfile(context.userId);
    const sql = await getSql();
    const listing = await loadOwnerListing(data.id, context.userId);
    if (!listing) return { ok: false as const, error: "Listing not found." };
    const imageCount = listing.images.length;
    const errors = validateForSubmit({
      title: listing.title,
      description: listing.description,
      propertyType: listing.propertyType,
      provinceId: listing.provinceId,
      districtId: listing.districtId,
      tehsilId: listing.tehsilId,
      area: listing.area,
      monthlyRent: listing.monthlyRent,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      contactPhone: listing.contactPhone,
      contactWhatsapp: listing.contactWhatsapp,
      imageCount,
      sizeUnit: listing.sizeUnit,
      furnishedStatus: listing.furnishedStatus,
    });
    if (errors.length) return { ok: false as const, error: errors[0], errors };
    const settings = await sql<{ value: string }>`select value from platform_settings where key = 'auto_publish'`;
    const autoPublish = settings[0]?.value === "true";
    const next = ownerNextStatus(listing.status, "submit", { autoPublish });
    if (!next) return { ok: false as const, error: "This listing cannot be submitted in its current state." };
    const durationRows = await sql<{ value: string }>`select value from platform_settings where key = 'listing_duration_days'`;
    const days = Number(durationRows[0]?.value) || LISTING_DURATION_DAYS;
    const expires = daysFromNow(days).toISOString();
    const publishedAt = next === "PUBLISHED" ? new Date().toISOString() : listing.publishedAt;
    await sql`update properties set
      status = ${next},
      published_at = ${publishedAt},
      expires_at = ${next === "PUBLISHED" ? expires : listing.expiresAt},
      rejection_reason = null,
      updated_at = ${new Date().toISOString()}
      where id = ${data.id} and owner_id = ${context.userId}`;
    await sql`insert into audit_log (id, actor_id, action, entity_type, entity_id, meta)
      values (${newId()}, ${context.userId}, ${"submit"}, ${"property"}, ${data.id}, ${next})`;
    return { ok: true as const, status: next, listing: await loadOwnerListing(data.id, context.userId) };
  });

export const ownerAction = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string; action: OwnerAction }) => data)
  .handler(async ({ context, data }) => {
    const profile = await requireActiveProfile(context.userId);
    const sql = await getSql();
    const rows = await sql`select * from properties where id = ${data.id} limit 1`;
    const row = rows[0];
    if (!row) return { ok: false as const, error: "Listing not found." };
    if (!canMutateListing({ userId: context.userId, role: profile.role, status: profile.status }, String(row.owner_id))) {
      return { ok: false as const, error: "You do not have permission to change this listing." };
    }
    const expired = isExpired(row.expires_at as string | null);
    if (!canOwnerTransition(String(row.status) as never, data.action)) {
      return { ok: false as const, error: "That action is not available for this listing." };
    }
    const next = ownerNextStatus(String(row.status) as never, data.action, { expired });
    if (!next) return { ok: false as const, error: "That action is not available for this listing." };
    const durationRows = await sql<{ value: string }>`select value from platform_settings where key = 'listing_duration_days'`;
    const days = Number(durationRows[0]?.value) || LISTING_DURATION_DAYS;
    const expires = data.action === "renew" ? daysFromNow(days).toISOString() : row.expires_at;
    const deletedAt = data.action === "delete" ? new Date().toISOString() : null;
    const publishedAt =
      next === "PUBLISHED" && !row.published_at ? new Date().toISOString() : row.published_at;
    const ownerFilter =
      profile.role === "ADMIN" || profile.role === "MODERATOR" ? String(row.owner_id) : context.userId;
    await sql`update properties set
      status = ${next},
      expires_at = ${expires},
      deleted_at = ${deletedAt},
      published_at = ${publishedAt},
      updated_at = ${new Date().toISOString()}
      where id = ${data.id} and owner_id = ${ownerFilter}`;
    await sql`insert into audit_log (id, actor_id, action, entity_type, entity_id, meta)
      values (${newId()}, ${context.userId}, ${data.action}, ${"property"}, ${data.id}, ${next})`;
    return { ok: true as const, status: next };
  });

export const listMyListings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireActiveProfile(context.userId);
    const sql = await getSql();
    const rows = await sql.query<PropertyRow>(
      `select ${PROPERTY_SELECT} from ${PROPERTY_FROM}
       where p.owner_id = $1 and p.deleted_at is null
       order by p.updated_at desc`,
      [context.userId],
    );
    const ids = rows.map((r) => r.id);
    const images = ids.length
      ? await sql.query<{
          id: string;
          property_id: string;
          url: string | null;
          sort_order: number;
          is_cover: boolean;
          width: number | null;
          height: number | null;
        }>(
          `select id, property_id, url, sort_order, is_cover, width, height from property_images
           where property_id in (${ids.map((_, i) => `$${i + 1}`).join(",")})
           order by sort_order asc`,
          ids,
        )
      : [];
    const byProp = new Map<string, ReturnType<typeof mapImage>[]>();
    for (const img of images) {
      const list = byProp.get(img.property_id) ?? [];
      list.push(mapImage(img));
      byProp.set(img.property_id, list);
    }
    return rows.map((row) =>
      mapOwner(row, byProp.get(row.id) ?? [], { saves: 0, calls: 0, whatsapp: 0 }),
    );
  });

export const getMyListing = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    await requireActiveProfile(context.userId);
    const listing = await loadOwnerListing(data.id, context.userId);
    if (!listing) return { ok: false as const, error: "Listing not found." };
    return { ok: true as const, listing };
  });

export const addListingImage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { propertyId: string; dataBase64: string; width?: number; height?: number }) => data)
  .handler(async ({ context, data }) => {
    const profile = await requireActiveProfile(context.userId);
    const sql = await getSql();
    const rows = await sql`select owner_id, status from properties where id = ${data.propertyId} limit 1`;
    const row = rows[0];
    if (!row) return { ok: false as const, error: "Listing not found." };
    if (!canMutateListing({ userId: context.userId, role: profile.role, status: profile.status }, String(row.owner_id))) {
      return { ok: false as const, error: "You do not have permission to change this listing." };
    }
    const count = await sql<{ n: number }>`select count(*)::int as n from property_images where property_id = ${data.propertyId}`;
    if ((count[0]?.n ?? 0) >= MAX_IMAGES) {
      return { ok: false as const, error: `You can add up to ${MAX_IMAGES} photos.` };
    }
    const raw = data.dataBase64.includes(",")
      ? data.dataBase64.slice(data.dataBase64.indexOf(",") + 1)
      : data.dataBase64;
    const mime = sniffImageMime(raw);
    if (!mime) return { ok: false as const, error: "Only JPEG, PNG and WebP images are allowed." };
    const bytes = byteLengthOfBase64(raw);
    if (bytes > MAX_IMAGE_BYTES) {
      return { ok: false as const, error: "Each photo must be under 1.5 MB after compression." };
    }
    const id = newId();
    const isCover = (count[0]?.n ?? 0) === 0;
    await sql`insert into property_images (
      id, property_id, storage_key, mime_type, byte_data, width, height, sort_order, is_cover
    ) values (
      ${id}, ${data.propertyId}, ${`properties/${data.propertyId}/${id}`}, ${mime}, ${raw},
      ${data.width ?? null}, ${data.height ?? null}, ${count[0]?.n ?? 0}, ${isCover}
    )`;
    return { ok: true as const, image: { id, url: `/api/images/${id}`, sortOrder: count[0]?.n ?? 0, isCover, width: data.width ?? null, height: data.height ?? null } };
  });

export const deleteListingImage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { propertyId: string; imageId: string }) => data)
  .handler(async ({ context, data }) => {
    const profile = await requireActiveProfile(context.userId);
    const sql = await getSql();
    const rows = await sql`select owner_id from properties where id = ${data.propertyId} limit 1`;
    if (!rows[0] || !canMutateListing({ userId: context.userId, role: profile.role, status: profile.status }, String(rows[0].owner_id))) {
      return { ok: false as const, error: "You do not have permission to change this listing." };
    }
    await sql`delete from property_images where id = ${data.imageId} and property_id = ${data.propertyId}`;
    const remaining = await sql`select id from property_images where property_id = ${data.propertyId} order by sort_order asc`;
    if (remaining[0]) {
      await sql`update property_images set is_cover = (id = ${remaining[0].id}) where property_id = ${data.propertyId}`;
    }
    return { ok: true as const };
  });

export const setCoverImage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { propertyId: string; imageId: string }) => data)
  .handler(async ({ context, data }) => {
    const profile = await requireActiveProfile(context.userId);
    const sql = await getSql();
    const rows = await sql`select owner_id from properties where id = ${data.propertyId} limit 1`;
    if (!rows[0] || !canMutateListing({ userId: context.userId, role: profile.role, status: profile.status }, String(rows[0].owner_id))) {
      return { ok: false as const, error: "You do not have permission to change this listing." };
    }
    await sql`update property_images set is_cover = (id = ${data.imageId}) where property_id = ${data.propertyId}`;
    return { ok: true as const };
  });

export const publicPreview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    const listing = await loadOwnerListing(data.id, context.userId);
    if (!listing) return null;
    return mapPublic(listing as never, listing.images, { includeContact: true });
  });

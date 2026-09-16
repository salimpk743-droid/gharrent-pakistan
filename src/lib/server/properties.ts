import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { PAGE_SIZE, typeFromSlug } from "@/lib/constants";
import { escapeLike } from "@/lib/utils";
import { normalizeSearchFilters, SORT_SQL, type SearchFilters } from "@/lib/search";
import { ensureSeedData } from "./seed";
import { expireOverdueListings } from "./expire";
import { mapImage, mapPublic, PROPERTY_FROM, PROPERTY_SELECT, type PropertyRow } from "./mappers";
import { resolveLocation } from "./locations";

const SearchSchema = z.object({
  provinceSlug: z.string().optional(),
  districtSlug: z.string().optional(),
  tehsilSlug: z.string().optional(),
  typeSlug: z.string().optional(),
  q: z.string().optional(),
  area: z.string().optional(),
  minRent: z.number().optional(),
  maxRent: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  minSize: z.number().optional(),
  maxSize: z.number().optional(),
  furnished: z.string().optional(),
  parking: z.boolean().optional(),
  family: z.boolean().optional(),
  bachelor: z.boolean().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  sort: z.enum(["newest", "rent_asc", "rent_desc"]).optional(),
});

async function loadImages(propertyIds: string[]) {
  if (propertyIds.length === 0) return new Map();
  const sql = await getSql();
  const placeholders = propertyIds.map((_, i) => `$${i + 1}`).join(",");
  const rows = await sql.query<{
    id: string;
    property_id: string;
    url: string | null;
    sort_order: number;
    is_cover: boolean;
    width: number | null;
    height: number | null;
  }>(
    `select id, property_id, url, sort_order, is_cover, width, height
     from property_images
     where property_id in (${placeholders})
     order by is_cover desc, sort_order asc`,
    propertyIds,
  );
  const map = new Map<string, ReturnType<typeof mapImage>[]>();
  for (const row of rows) {
    const list = map.get(row.property_id) ?? [];
    list.push(mapImage(row));
    map.set(row.property_id, list);
  }
  return map;
}

export async function searchPropertiesInternal(raw: SearchFilters) {
  await ensureSeedData();
  await expireOverdueListings();
  const filters = normalizeSearchFilters(raw);
  const location = await resolveLocation({
    provinceSlug: filters.provinceSlug,
    districtSlug: filters.districtSlug,
    tehsilSlug: filters.tehsilSlug,
  });
  const type = filters.type ?? typeFromSlug(filters.typeSlug);

  const conditions: string[] = ["p.deleted_at is null", "p.status = 'PUBLISHED'"];
  const params: unknown[] = [];
  const add = (sql: string, value: unknown) => {
    params.push(value);
    conditions.push(sql.replace("?", `$${params.length}`));
  };

  if (location.province) add("p.province_id = ?", location.province.id);
  if (location.district) add("p.district_id = ?", location.district.id);
  if (location.tehsil) add("p.tehsil_id = ?", location.tehsil.id);
  if (type) add("p.property_type = ?", type);
  if (filters.minRent != null) add("p.monthly_rent >= ?", filters.minRent);
  if (filters.maxRent != null) add("p.monthly_rent <= ?", filters.maxRent);
  if (filters.bedrooms != null) add("p.bedrooms >= ?", filters.bedrooms);
  if (filters.bathrooms != null) add("p.bathrooms >= ?", filters.bathrooms);
  if (filters.minSize != null) add("p.property_size >= ?", filters.minSize);
  if (filters.maxSize != null) add("p.property_size <= ?", filters.maxSize);
  if (filters.furnished) add("p.furnished_status = ?", filters.furnished);
  if (filters.parking) conditions.push("p.parking = true");
  if (filters.family) conditions.push("p.family_allowed = true");
  if (filters.bachelor) conditions.push("p.bachelor_allowed = true");
  if (filters.q) {
    params.push(`%${escapeLike(filters.q)}%`);
    const i = params.length;
    conditions.push(
      `(p.title ilike $${i} escape '\\' or p.area ilike $${i} escape '\\' or p.description ilike $${i} escape '\\' or p.address ilike $${i} escape '\\')`,
    );
  }

  const where = conditions.join(" and ");
  const order = SORT_SQL[filters.sort ?? "newest"];
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? PAGE_SIZE;
  const offset = (page - 1) * pageSize;
  const sql = await getSql();

  const countRows = await sql.query<{ n: number }>(
    `select count(*)::int as n from ${PROPERTY_FROM} where ${where}`,
    params,
  );
  const total = countRows[0]?.n ?? 0;
  const rows = await sql.query<PropertyRow>(
    `select ${PROPERTY_SELECT} from ${PROPERTY_FROM} where ${where} order by ${order} limit $${params.length + 1} offset $${params.length + 2}`,
    [...params, pageSize, offset],
  );
  const images = await loadImages(rows.map((r) => r.id));
  const items = rows.map((row) => mapPublic(row, images.get(row.id) ?? []));
  return {
    items,
    total,
    page,
    pageSize,
    locationLabel: location.label,
    province: location.province,
    district: location.district,
    tehsil: location.tehsil,
    type: type ?? null,
  };
}

export const searchProperties = createServerFn({ method: "GET" })
  .validator((data: unknown) => SearchSchema.parse(data ?? {}))
  .handler(async ({ data }) => searchPropertiesInternal(data));

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeedData();
  await expireOverdueListings();
  const latest = await searchPropertiesInternal({ page: 1, pageSize: 6, sort: "newest" });
  const featured = await searchPropertiesInternal({ page: 1, pageSize: 4, sort: "newest" });
  const featuredItems = featured.items.filter((p) => p.isFeatured);
  return {
    latest: latest.items,
    featured: featuredItems.length ? featuredItems : featured.items.slice(0, 4),
    totalPublished: latest.total,
  };
});

export const getPropertyBySlug = createServerFn({ method: "GET" })
  .validator((data: { slug: string; userId?: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeedData();
    await expireOverdueListings();
    const sql = await getSql();
    const rows = await sql.query<PropertyRow>(
      `select ${PROPERTY_SELECT} from ${PROPERTY_FROM} where p.slug = $1 and p.deleted_at is null limit 1`,
      [data.slug],
    );
    const row = rows[0];
    if (!row) return null;
    if (row.status !== "PUBLISHED") return { notPublic: true as const, id: row.id, status: row.status };
    const images = await loadImages([row.id]);
    let saved = false;
    if (data.userId) {
      const fav = await sql`select 1 from favorites where user_id = ${data.userId} and property_id = ${row.id} limit 1`;
      saved = fav.length > 0;
    }
    await sql`update properties set view_count = view_count + 1 where id = ${row.id}`;
    await sql`insert into listing_events (id, property_id, user_id, event_type)
      values (${crypto.randomUUID()}, ${row.id}, ${data.userId ?? null}, ${"view"})`;
    return mapPublic(row, images.get(row.id) ?? [], { includeContact: true, saved });
  });

export const recordContactClick = createServerFn({ method: "POST" })
  .validator((data: { propertyId: string; type: "call" | "whatsapp" | "share" }) => data)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const eventType = data.type === "call" ? "call" : data.type === "whatsapp" ? "whatsapp" : "share";
    await sql`insert into listing_events (id, property_id, event_type)
      values (${crypto.randomUUID()}, ${data.propertyId}, ${eventType})`;
    return { ok: true };
  });

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { ensureSeedData } from "./seed";
import { parseSeoIntent, seoIntentSlugs, SEO_INTENT_MIN_INDEXABLE, SEO_AREA_INTENT_MIN_INDEXABLE } from "@/lib/seo-intent";
import { PROPERTY_TYPE_META, type PropertyType } from "@/lib/constants";

const PROVINCE_SLUG_ALIASES: Record<string, string> = {
  islamabad: "islamabad-capital-territory",
};

function canonicalProvinceSlug(slug?: string) {
  if (!slug) return slug;
  return PROVINCE_SLUG_ALIASES[slug] ?? slug;
}

export const listProvinces = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeedData();
  const sql = await getSql();
  return sql<{ id: string; slug: string; name: string }>`
    select id, slug, name from provinces order by sort_order asc, name asc
  `;
});

export const listCitiesForProvince = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ provinceId: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    await ensureSeedData();
    const sql = await getSql();
    return sql<{ id: string; slug: string; name: string }>`
      select id, slug, name from districts
      where province_id = ${data.provinceId}
      order by name asc
    `;
  });

export const listLocationTree = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeedData();
  const sql = await getSql();
  const provinces = await sql<{ id: string; slug: string; name: string }>`
    select id, slug, name from provinces order by sort_order asc, name asc
  `;
  const districts = await sql<{ id: string; province_id: string; slug: string; name: string }>`
    select id, province_id, slug, name from districts order by name asc
  `;
  return provinces.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    districts: districts
      .filter((d) => d.province_id === p.id)
      .map((d) => ({
        id: d.id,
        slug: d.slug,
        name: d.name,
      })),
  }));
});

export const listAreasForCity = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ districtId: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    await ensureSeedData();
    const sql = await getSql();
    return sql<{ id: string; slug: string; name: string; aliases: string }>`
      select id, slug, name, aliases from areas
      where district_id = ${data.districtId}
      order by name asc
    `;
  });


export type SeoArea = {
  id: string;
  slug: string;
  name: string;
  count: number;
  lastmod: string | Date | null;
};

export async function listSeoAreas(opts: {
  provinceSlug: string;
  districtSlug: string;
  purpose: "RENT" | "SALE";
  type?: string;
}): Promise<SeoArea[]> {
  await ensureSeedData();
  const sql = await getSql();
  const typeCondition = opts.type ? sql`and p.property_type = ${opts.type}` : sql``;
  return sql<SeoArea>`
    select a.id, a.slug, a.name, count(*)::int as count,
           max(p.updated_at::date) as lastmod
    from properties p
    join provinces pr on pr.id = p.province_id
    join districts d on d.id = p.district_id
    join areas a on a.id = p.area_id
    where p.status = 'PUBLISHED'
      and p.deleted_at is null
      and p.is_sample = false
      and p.listing_purpose = ${opts.purpose}
      and pr.slug = ${opts.provinceSlug}
      and d.slug = ${opts.districtSlug}
      ${typeCondition}
    group by a.id, a.slug, a.name
    having count(*) > 0
    order by count(*) desc, a.name asc
  `;
}

export type SeoIntentSummary = {
  slug: string;
  label: string;
  kind: "budget" | "bedrooms" | "size";
  count: number;
};

export async function listSeoIntents(opts: {
  provinceSlug: string;
  districtSlug: string;
  purpose: "RENT" | "SALE";
  type: string;
  areaSlug?: string;
}): Promise<SeoIntentSummary[]> {
  await ensureSeedData();
  const sql = await getSql();
  const intentDefinitions = seoIntentSlugs(opts.purpose).map((slug) => {
    const intent = parseSeoIntent(slug, opts.purpose);
    if (!intent) return null;
    return {
      slug,
      kind: intent.kind,
      value: intent.kind === "budget" ? intent.max : intent.kind === "bedrooms" ? intent.bedrooms : intent.size,
      unit: intent.kind === "size" ? intent.unit : null,
      label: intent.label,
    };
  }).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const params: unknown[] = [];
  const values = intentDefinitions.map((item) => {
    const start = params.length + 1;
    params.push(item.slug, item.kind, item.value, item.unit);
    return "(" + [start, start + 1, start + 2, start + 3].map((n) => "$" + n).join(", ") + ")";
  }).join(", ");
  const rows = await sql.query<{ slug: string; kind: SeoIntentSummary["kind"]; count: number }>(
    `select i.slug, i.kind, count(*)::int as count
     from properties p
     join provinces pr on pr.id = p.province_id
     join districts d on d.id = p.district_id
     join areas a on a.id = p.area_id
     cross join (values ${values}) as i(slug, kind, value, unit)
     where p.status = 'PUBLISHED'
       and p.deleted_at is null
       and p.is_sample = false
       and p.listing_purpose = $${params.length + 1}
       and pr.slug = $${params.length + 2}
       and d.slug = $${params.length + 3}
       and p.property_type = ${params.length + 4}
       ${opts.areaSlug ? "and a.slug = $" + (params.length + 5) : ""}
       and (
         (i.kind = 'budget' and p.monthly_rent <= i.value::numeric)
         or (i.kind = 'bedrooms' and p.bedrooms = i.value::int)
         or (i.kind = 'size' and p.property_size = i.value::numeric and p.size_unit = i.unit)
       )
     group by i.slug, i.kind
     having count(*) >= ${opts.areaSlug ? SEO_AREA_INTENT_MIN_INDEXABLE : SEO_INTENT_MIN_INDEXABLE}`,
    [...params, opts.purpose, opts.provinceSlug, opts.districtSlug, opts.type, ...(opts.areaSlug ? [opts.areaSlug] : [])],
  );
  const labels = new Map(intentDefinitions.map((item) => [item.slug, item.label]));
  return rows
    .map((row) => ({ ...row, label: labels.get(row.slug) ?? row.slug }))
    .sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug));
}

export type SeoTypeSummary = {
  type: PropertyType;
  slug: string;
  plural: string;
  count: number;
};

export async function listSeoTypeSummaries(opts: {
  provinceSlug: string;
  districtSlug: string;
  purpose: "RENT" | "SALE";
  areaSlug?: string;
}): Promise<SeoTypeSummary[]> {
  await ensureSeedData();
  const sql = await getSql();
  const rows = await sql<{
    property_type: PropertyType;
    count: number;
  }>`
    select p.property_type, count(*)::int as count
    from properties p
    join provinces pr on pr.id = p.province_id
    join districts d on d.id = p.district_id
    left join areas a on a.id = p.area_id
    where p.status = 'PUBLISHED'
      and p.deleted_at is null
      and p.is_sample = false
      and p.listing_purpose = ${opts.purpose}
      and pr.slug = ${opts.provinceSlug}
      and d.slug = ${opts.districtSlug}
      ${opts.areaSlug ? sql`and a.slug = ${opts.areaSlug}` : sql``}
    group by p.property_type
    order by count(*) desc
  `;
  return rows
    .filter((row) => PROPERTY_TYPE_META[row.property_type])
    .map((row) => ({
      type: row.property_type,
      slug: PROPERTY_TYPE_META[row.property_type].slug,
      plural: PROPERTY_TYPE_META[row.property_type].plural,
      count: row.count,
    }));
}

export async function getSeoArea(opts: {
  provinceSlug: string;
  districtSlug: string;
  areaSlug: string;
}) {
  await ensureSeedData();
  const sql = await getSql();
  const rows = await sql<{ id: string; slug: string; name: string }>`
    select a.id, a.slug, a.name
    from areas a
    join districts d on d.id = a.district_id
    join provinces p on p.id = d.province_id
    where p.slug = ${opts.provinceSlug}
      and d.slug = ${opts.districtSlug}
      and a.slug = ${opts.areaSlug}
    limit 1
  `;
  return rows[0] ?? null;
}

export async function resolveLocation(slugs: {
  provinceSlug?: string;
  districtSlug?: string;
  tehsilSlug?: string;
  areaSlug?: string;
}) {
  await ensureSeedData();
  const sql = await getSql();
  let province: { id: string; slug: string; name: string } | null = null;
  let district: { id: string; slug: string; name: string; province_id: string } | null = null;
  let tehsil: { id: string; slug: string; name: string } | null = null;
  let area: { id: string; slug: string; name: string } | null = null;
  const provinceSlug = canonicalProvinceSlug(slugs.provinceSlug);
  if (provinceSlug) {
    const rows = await sql<{ id: string; slug: string; name: string }>`
      select id, slug, name from provinces where slug = ${provinceSlug} limit 1
    `;
    province = rows[0] ?? null;
  }
  if (province && slugs.districtSlug) {
    const rows = await sql<{ id: string; slug: string; name: string; province_id: string }>`
      select id, slug, name, province_id from districts
      where province_id = ${province.id} and slug = ${slugs.districtSlug} limit 1
    `;
    district = rows[0] ?? null;
  }
  if (district && slugs.tehsilSlug) {
    const rows = await sql<{ id: string; slug: string; name: string }>`
      select id, slug, name from tehsils
      where district_id = ${district.id} and slug = ${slugs.tehsilSlug} limit 1
    `;
    tehsil = rows[0] ?? null;
  }
  if (district && slugs.areaSlug) {
    const rows = await sql<{ id: string; slug: string; name: string }>`
      select id, slug, name from areas
      where district_id = ${district.id} and slug = ${slugs.areaSlug} limit 1
    `;
    area = rows[0] ?? null;
  }
  const label = [area?.name, district?.name, province?.name].filter(Boolean).join(", ");
  return { province, district, tehsil, area, label: label || "Pakistan" };
}

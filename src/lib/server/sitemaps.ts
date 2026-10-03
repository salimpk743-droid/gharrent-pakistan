import { getSql } from "@/lib/db";
import { PROPERTY_TYPE_META, type PropertyType } from "@/lib/constants";
import { QUESTION_GUIDE_PATHS } from "@/lib/question-guides";
import {
  LISTING_SITEMAP_CHUNK,
  listingSitemapPages,
  type SitemapEntry,
} from "@/lib/seo";
import { ensureSeedData } from "./seed";
import { parseSeoIntent, seoIntentSlugs, SEO_INTENT_MIN_INDEXABLE, SEO_AREA_INTENT_MIN_INDEXABLE } from "@/lib/seo-intent";

async function readySql() {
  await ensureSeedData();
  return getSql();
}

export async function sitemapStaticEntries(): Promise<SitemapEntry[]> {
  const sql = await readySql();
  const live = await sql<{ purpose: string; slug: string }>`
    select distinct p.listing_purpose as purpose, pr.slug as slug
    from properties p
    join provinces pr on pr.id = p.province_id
    where p.status = 'PUBLISHED'
      and p.deleted_at is null
      and p.is_sample = false
  `;
  const rentProvinces = [...new Set(live.filter((row) => row.purpose === "RENT").map((row) => row.slug))];
  const saleProvinces = [...new Set(live.filter((row) => row.purpose === "SALE").map((row) => row.slug))];
  return [
    { path: "/" },
    ...(rentProvinces.length > 0 ? [{ path: "/rent" }] : []),
    ...(saleProvinces.length > 0 ? [{ path: "/sale" }] : []),
    { path: "/locations" },
    { path: "/guides" },
    ...QUESTION_GUIDE_PATHS.map((path) => ({ path })),
    { path: "/guides/cities/rawalpindi" },
    { path: "/guides/cities/lahore" },
    { path: "/guides/cities/karachi" },
    { path: "/guides/buying/property-buying-due-diligence-pakistan" },
    { path: "/guides/buying/fard-registry-intiqal-punjab" },
    { path: "/guides/buying/sale-agreement-registration-pakistan" },
    { path: "/guides/landlords/landlord-responsibilities-pakistan" },
    { path: "/guides/landlords/security-deposit-rent-terms-pakistan" },
    { path: "/how-to-rent-a-house-in-pakistan" },
    { path: "/guides/renting/rental-budget-and-costs-pakistan" },
    { path: "/guides/renting/house-vs-flat-vs-portion-pakistan" },
    { path: "/guides/buying/how-to-buy-property-in-pakistan" },
    // Empty rent and sale URLs are soft 404s. A province enters this sitemap
    // only when it has a real published listing. City and area URLs are added
    // by sitemapLocationEntries on the same rule.
    { path: "/about" },
    { path: "/safety" },
    { path: "/privacy" },
    { path: "/terms" },
    { path: "/disclaimer" },
    { path: "/contact" },
    { path: "/account-deletion" },
    ...rentProvinces.map((slug) => ({ path: `/rent/${slug}` })),
    ...saleProvinces.map((slug) => ({ path: `/sale/${slug}` })),
  ];
}

export async function sitemapLocationEntries(): Promise<SitemapEntry[]> {
  const sql = await readySql();
  const rows = await sql<{
    pslug: string;
    dslug: string;
    purpose: string;
    ptype: string;
    lastmod: string | Date | null;
  }>`
    select
      pr.slug as pslug,
      d.slug as dslug,
      p.listing_purpose as purpose,
      p.property_type as ptype,
      max(p.updated_at::date) as lastmod
    from properties p
    join districts d on d.id = p.district_id
    join provinces pr on pr.id = d.province_id
    where p.status = 'PUBLISHED' and p.deleted_at is null and p.is_sample = false
    group by pr.slug, d.slug, p.listing_purpose, p.property_type
  `;
  const city = new Map<string, string | Date | null>();
  const type = new Map<string, string | Date | null>();
  const area = new Map<string, string | Date | null>();
  const areaType = new Map<string, string | Date | null>();
  for (const row of rows) {
    const purposePath = row.purpose === "SALE" ? "sale" : "rent";
    const cityPath = `/${purposePath}/${row.pslug}/${row.dslug}`;
    const prevCity = city.get(cityPath);
    if (!prevCity) city.set(cityPath, row.lastmod);
    const typeSlug = PROPERTY_TYPE_META[row.ptype as PropertyType]?.slug;
    if (typeSlug) type.set(`${cityPath}/${typeSlug}`, row.lastmod);
  }

  const areaRows = await sql<{
    pslug: string;
    dslug: string;
    aslug: string;
    purpose: string;
    ptype: string;
    lastmod: string | Date | null;
  }>`
    select
      pr.slug as pslug,
      d.slug as dslug,
      a.slug as aslug,
      p.listing_purpose as purpose,
      p.property_type as ptype,
      max(p.updated_at::date) as lastmod
    from properties p
    join districts d on d.id = p.district_id
    join provinces pr on pr.id = d.province_id
    join areas a on a.id = p.area_id
    where p.status = 'PUBLISHED' and p.deleted_at is null and p.is_sample = false
    group by pr.slug, d.slug, a.slug, p.listing_purpose, p.property_type
  `;
  for (const row of areaRows) {
    const purposePath = row.purpose === "SALE" ? "sale" : "rent";
    const areaPath = `/${purposePath}/${row.pslug}/${row.dslug}/areas/${row.aslug}`;
    const prevArea = area.get(areaPath);
    if (!prevArea) area.set(areaPath, row.lastmod);
    const typeSlug = PROPERTY_TYPE_META[row.ptype as PropertyType]?.slug;
    if (typeSlug) areaType.set(`${areaPath}/${typeSlug}`, row.lastmod);
  }

  const intentDefinitions = (["RENT", "SALE"] as const).flatMap((purpose) =>
    seoIntentSlugs(purpose).map((slug) => {
      const intent = parseSeoIntent(slug, purpose);
      if (!intent) return null;
      return {
        purpose,
        slug,
        kind: intent.kind,
        value: intent.kind === "budget" ? intent.max : intent.kind === "bedrooms" ? intent.bedrooms : intent.size,
        unit: intent.kind === "size" ? intent.unit : null,
      };
    }).filter((item): item is NonNullable<typeof item> => Boolean(item)),
  );
  const intentParams: unknown[] = [];
  const intentValues = intentDefinitions.map((item) => {
    const start = intentParams.length + 1;
    intentParams.push(item.purpose, item.slug, item.kind, item.value, item.unit);
    return "(" + [start, start + 1, start + 2, start + 3, start + 4].map((n) => "$" + n).join(", ") + ")";
  }).join(", ");
  const intentRows = await sql.query<{
    pslug: string;
    dslug: string;
    ptype: string;
    intent: string;
    purpose: "RENT" | "SALE";
    lastmod: string | Date | null;
  }>(
    `select
       pr.slug as pslug,
       d.slug as dslug,
       p.property_type as ptype,
       i.slug as intent,
       i.purpose as purpose,
       max(p.updated_at::date) as lastmod
     from properties p
     join districts d on d.id = p.district_id
     join provinces pr on pr.id = d.province_id
     cross join (values ${intentValues}) as i(purpose, slug, kind, value, unit)
     where p.status = 'PUBLISHED'
       and p.deleted_at is null
       and p.is_sample = false
       and p.listing_purpose = i.purpose
       and (
         (i.kind = 'budget' and p.monthly_rent <= i.value::numeric)
         or (i.kind = 'bedrooms' and p.bedrooms = i.value::int)
         or (i.kind = 'size' and p.property_size = i.value::numeric and p.size_unit = i.unit)
       )
     group by pr.slug, d.slug, p.property_type, i.slug, i.purpose
     having count(*) >= ${SEO_INTENT_MIN_INDEXABLE}`,
    intentParams,
  );
  const intentEntries = intentRows.flatMap((row) => {
    const typeSlug = PROPERTY_TYPE_META[row.ptype as PropertyType]?.slug;
    if (!typeSlug) return [];
    const purpose = row.purpose;
    const purposePath = purpose === "SALE" ? "sale" : "rent";
    return [{
      path: `/${purposePath}/${row.pslug}/${row.dslug}/${typeSlug}/${row.intent}`,
      lastmod: row.lastmod,
    }];
  });

  const areaIntentParams: unknown[] = [];
  const areaIntentValues = intentDefinitions.map((item) => {
    const start = areaIntentParams.length + 1;
    areaIntentParams.push(item.purpose, item.slug, item.kind, item.value, item.unit);
    return "(" + [start, start + 1, start + 2, start + 3, start + 4].map((n) => "$" + n).join(", ") + ")";
  }).join(", ");
  const areaIntentRows = await sql.query<{
    pslug: string;
    dslug: string;
    aslug: string;
    ptype: string;
    intent: string;
    purpose: "RENT" | "SALE";
    lastmod: string | Date | null;
  }>(
    `select
       pr.slug as pslug,
       d.slug as dslug,
       a.slug as aslug,
       p.property_type as ptype,
       i.slug as intent,
       i.purpose as purpose,
       max(p.updated_at::date) as lastmod
     from properties p
     join districts d on d.id = p.district_id
     join provinces pr on pr.id = d.province_id
     join areas a on a.id = p.area_id
     cross join (values ${areaIntentValues}) as i(purpose, slug, kind, value, unit)
     where p.status = 'PUBLISHED'
       and p.deleted_at is null
       and p.is_sample = false
       and p.listing_purpose = i.purpose
       and (
         (i.kind = 'budget' and p.monthly_rent <= i.value::numeric)
         or (i.kind = 'bedrooms' and p.bedrooms = i.value::int)
         or (i.kind = 'size' and p.property_size = i.value::numeric and p.size_unit = i.unit)
       )
     group by pr.slug, d.slug, a.slug, p.property_type, i.slug, i.purpose
     having count(*) >= ${SEO_AREA_INTENT_MIN_INDEXABLE}`,
    areaIntentParams,
  );
  const areaIntentEntries = areaIntentRows.flatMap((row) => {
    const typeSlug = PROPERTY_TYPE_META[row.ptype as PropertyType]?.slug;
    if (!typeSlug) return [];
    const purposePath = row.purpose === "SALE" ? "sale" : "rent";
    return [{
      path: `/${purposePath}/${row.pslug}/${row.dslug}/areas/${row.aslug}/${typeSlug}/${row.intent}`,
      lastmod: row.lastmod,
    }];
  });

  return [
    ...[...city.entries()].map(([path, lastmod]) => ({ path, lastmod })),
    ...[...type.entries()].map(([path, lastmod]) => ({ path, lastmod })),
    ...[...area.entries()].map(([path, lastmod]) => ({ path, lastmod })),
    ...[...areaType.entries()].map(([path, lastmod]) => ({ path, lastmod })),
    ...intentEntries,
    ...areaIntentEntries,
  ];
}

export async function sitemapListingCount(): Promise<number> {
  const sql = await readySql();
  const rows = await sql<{ n: number }>`
    select count(*)::int as n
    from properties p
    where p.status = 'PUBLISHED' and p.deleted_at is null and p.is_sample = false
  `;
  return rows[0]?.n ?? 0;
}

export async function sitemapListingEntries(page: number): Promise<SitemapEntry[]> {
  const sql = await readySql();
  const offset = (page - 1) * LISTING_SITEMAP_CHUNK;
  const rows = await sql.query<{ slug: string; lastmod: string | Date | null }>(
    `select slug, coalesce(updated_at, published_at, created_at)::date as lastmod
     from properties
     where status = 'PUBLISHED' and deleted_at is null and is_sample = false
     order by published_at desc nulls last, slug asc
     limit $1 offset $2`,
    [LISTING_SITEMAP_CHUNK, offset],
  );
  return rows.map((row) => ({ path: `/property/${row.slug}`, lastmod: row.lastmod }));
}

export async function sitemapIndexEntries(): Promise<SitemapEntry[]> {
  const total = await sitemapListingCount();
  const locations = await sitemapLocationEntries();
  const listingPages = listingSitemapPages(total);
  const listingSitemaps = Array.from({ length: listingPages }, (_, i) => ({
    path: `/sitemap-listings/${i + 1}`,
  }));

  return [
    { path: "/sitemap-pages.xml" },
    ...(locations.length > 0 ? [{ path: "/sitemap-locations.xml" }] : []),
    ...listingSitemaps,
  ];
}

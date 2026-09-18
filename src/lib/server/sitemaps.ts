import { getSql } from "@/lib/db";
import { PROPERTY_TYPE_META, type PropertyType } from "@/lib/constants";
import {
  LISTING_SITEMAP_CHUNK,
  listingSitemapPages,
  type SitemapEntry,
} from "@/lib/seo";
import { ensureSeedData } from "./seed";

async function readySql() {
  await ensureSeedData();
  return getSql();
}

export async function sitemapStaticEntries(): Promise<SitemapEntry[]> {
  const sql = await readySql();
  const provinces = await sql<{ slug: string }>`select slug from provinces order by sort_order`;
  return [
    { path: "/" },
    { path: "/rent" },
    { path: "/sale" },
    { path: "/locations" },
    { path: "/how-to-rent-a-house-in-pakistan" },
    { path: "/safety" },
    { path: "/privacy" },
    { path: "/terms" },
    { path: "/disclaimer" },
    { path: "/contact" },
    { path: "/account-deletion" },
    ...provinces.flatMap((p) => [{ path: `/rent/${p.slug}` }, { path: `/sale/${p.slug}` }]),
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
    where p.status = 'PUBLISHED' and p.deleted_at is null
    group by pr.slug, d.slug, p.listing_purpose, p.property_type
  `;
  const city = new Map<string, string | Date | null>();
  const type = new Map<string, string | Date | null>();
  for (const row of rows) {
    const purposePath = row.purpose === "SALE" ? "sale" : "rent";
    const cityPath = `/${purposePath}/${row.pslug}/${row.dslug}`;
    const prevCity = city.get(cityPath);
    if (!prevCity) city.set(cityPath, row.lastmod);
    const typeSlug = PROPERTY_TYPE_META[row.ptype as PropertyType]?.slug;
    if (typeSlug) type.set(`${cityPath}/${typeSlug}`, row.lastmod);
  }
  return [
    ...[...city.entries()].map(([path, lastmod]) => ({ path, lastmod })),
    ...[...type.entries()].map(([path, lastmod]) => ({ path, lastmod })),
  ];
}

export async function sitemapListingCount(): Promise<number> {
  const sql = await readySql();
  const rows = await sql<{ n: number }>`
    select count(*)::int as n
    from properties
    where status = 'PUBLISHED' and deleted_at is null
  `;
  return rows[0]?.n ?? 0;
}

export async function sitemapListingEntries(page: number): Promise<SitemapEntry[]> {
  const sql = await readySql();
  const offset = (page - 1) * LISTING_SITEMAP_CHUNK;
  const rows = await sql.query<{ slug: string; lastmod: string | Date | null }>(
    `select slug, coalesce(updated_at, published_at, created_at)::date as lastmod
     from properties
     where status = 'PUBLISHED' and deleted_at is null
     order by published_at desc nulls last, slug asc
     limit $1 offset $2`,
    [LISTING_SITEMAP_CHUNK, offset],
  );
  return rows.map((row) => ({ path: `/property/${row.slug}`, lastmod: row.lastmod }));
}

export async function sitemapIndexEntries(): Promise<SitemapEntry[]> {
  const total = await sitemapListingCount();
  const listingPages = listingSitemapPages(total);
  const listingSitemaps = Array.from({ length: listingPages }, (_, i) => ({
    path: `/sitemap-listings/${i + 1}`,
  }));
  return [{ path: "/sitemap-pages.xml" }, { path: "/sitemap-locations.xml" }, ...listingSitemaps];
}

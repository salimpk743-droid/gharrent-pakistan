import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { ensureSeedData } from "@/lib/server/seed";
import { PROPERTY_TYPE_META, type PropertyType } from "@/lib/constants";
import { renderSitemapXml, type SitemapEntry } from "@/lib/seo";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        await ensureSeedData();
        const sql = await getSql();
        const provinces = await sql<{ slug: string }>`select slug from provinces order by sort_order`;
        const liveLocations = await sql<{
          pslug: string;
          dslug: string;
          purpose: string;
          ptype: string;
        }>`
          select pr.slug as pslug, d.slug as dslug, p.listing_purpose as purpose, p.property_type as ptype
          from properties p
          join districts d on d.id = p.district_id
          join provinces pr on pr.id = d.province_id
          where p.status = 'PUBLISHED' and p.deleted_at is null
        `;
        const properties = await sql<{ slug: string; updated_at: string }>`
          select slug, updated_at from properties
          where status = 'PUBLISHED' and deleted_at is null
          order by published_at desc
          limit 5000
        `;

        const cityKeys = new Set<string>();
        const typeKeys = new Set<string>();
        for (const row of liveLocations) {
          const purposePath = row.purpose === "SALE" ? "sale" : "rent";
          cityKeys.add(`${purposePath}/${row.pslug}/${row.dslug}`);
          const typeSlug = PROPERTY_TYPE_META[row.ptype as PropertyType]?.slug;
          if (typeSlug) typeKeys.add(`${purposePath}/${row.pslug}/${row.dslug}/${typeSlug}`);
        }

        const entries: SitemapEntry[] = [
          { path: "/" },
          { path: "/rent" },
          { path: "/sale" },
          { path: "/locations" },
          { path: "/safety" },
          { path: "/privacy" },
          { path: "/terms" },
          { path: "/disclaimer" },
          { path: "/contact" },
          { path: "/account-deletion" },
          ...provinces.flatMap((p) => [{ path: `/rent/${p.slug}` }, { path: `/sale/${p.slug}` }]),
          ...[...cityKeys].map((path) => ({ path: `/${path}` })),
          ...[...typeKeys].map((path) => ({ path: `/${path}` })),
          ...properties.map((p) => ({
            path: `/property/${p.slug}`,
            lastmod: String(p.updated_at).slice(0, 10),
          })),
        ];

        return new Response(renderSitemapXml(entries), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});

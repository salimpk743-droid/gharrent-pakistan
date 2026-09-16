import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { ensureSeedData } from "@/lib/server/seed";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        await ensureSeedData();
        const origin = new URL(request.url).origin;
        const sql = await getSql();
        const provinces = await sql<{ slug: string }>`select slug from provinces order by sort_order`;
        const districts = await sql<{ pslug: string; dslug: string }>`
          select pr.slug as pslug, d.slug as dslug
          from districts d join provinces pr on pr.id = d.province_id
        `;
        const properties = await sql<{ slug: string; updated_at: string }>`
          select slug, updated_at from properties
          where status = 'PUBLISHED' and deleted_at is null
          order by published_at desc
          limit 5000
        `;
        const urls = [
          "",
          "/rent",
          "/locations",
          "/safety",
          "/privacy",
          "/terms",
          "/disclaimer",
          "/contact",
          "/report",
          ...provinces.map((p) => `/rent/${p.slug}`),
          ...districts.map((d) => `/rent/${d.pslug}/${d.dslug}`),
          ...properties.map((p) => `/property/${p.slug}`),
        ];
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (path) => `  <url><loc>${origin}${path}</loc></url>`,
  )
  .join("\n")}
</urlset>
`;
        return new Response(body, {
          headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});

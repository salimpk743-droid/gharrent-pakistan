import { createFileRoute } from "@tanstack/react-router";
import { listingSitemapPages, renderSitemapXml, xmlResponse } from "@/lib/seo";
import { sitemapListingCount, sitemapListingEntries } from "@/lib/server/sitemaps";

export const Route = createFileRoute("/sitemap-listings/$page")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const page = Number.parseInt(String(params.page), 10);
        if (!Number.isInteger(page) || page < 1) {
          return new Response("Not found", { status: 404 });
        }
        const total = await sitemapListingCount();
        if (page > listingSitemapPages(total)) {
          return new Response("Not found", { status: 404 });
        }
        return xmlResponse(renderSitemapXml(await sitemapListingEntries(page)));
      },
    },
  },
});

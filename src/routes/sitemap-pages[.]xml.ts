import { createFileRoute } from "@tanstack/react-router";
import { renderSitemapXml, xmlResponse } from "@/lib/seo";
import { sitemapStaticEntries } from "@/lib/server/sitemaps";

export const Route = createFileRoute("/sitemap-pages.xml")({
  server: {
    handlers: {
      GET: async () => xmlResponse(renderSitemapXml(await sitemapStaticEntries())),
    },
  },
});

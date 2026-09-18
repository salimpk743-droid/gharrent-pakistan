import { createFileRoute } from "@tanstack/react-router";
import { renderSitemapXml, xmlResponse } from "@/lib/seo";
import { sitemapLocationEntries } from "@/lib/server/sitemaps";

export const Route = createFileRoute("/sitemap-locations.xml")({
  server: {
    handlers: {
      GET: async () => xmlResponse(renderSitemapXml(await sitemapLocationEntries())),
    },
  },
});

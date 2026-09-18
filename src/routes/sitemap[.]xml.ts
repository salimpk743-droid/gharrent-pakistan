import { createFileRoute } from "@tanstack/react-router";
import { renderSitemapIndex, xmlResponse } from "@/lib/seo";
import { sitemapIndexEntries } from "@/lib/server/sitemaps";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => xmlResponse(renderSitemapIndex(await sitemapIndexEntries())),
    },
  },
});

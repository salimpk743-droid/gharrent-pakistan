/** 301 old guide URLs to the page that now owns that search intent (see src/lib/legacy-paths.ts). */
import { legacyPathRedirect } from "../../src/lib/legacy-paths.ts";

interface LegacyPathEvent {
  url: URL;
  req: { method: string };
}

export default function legacyPathsMiddleware(
  event: LegacyPathEvent,
  next: () => unknown | Promise<unknown>,
): unknown | Promise<unknown> {
  const method = (event.req.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") return next();
  const target = legacyPathRedirect(event.url.pathname, event.url.search);
  if (!target) return next();
  return new Response(null, {
    status: 301,
    headers: { location: target, "cache-control": "public, max-age=86400" },
  });
}

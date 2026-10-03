/**
 * Permanently redirect the legacy production host (gharrent-pakistan.vercel.app)
 * to https://apnaaghar.pk, without breaking previews or Google sign-in.
 *
 * The decision lives in `legacyHostRedirect` (unit-tested): it is inert on
 * preview deployments, on API/auth paths, and until BETTER_AUTH_URL points at
 * apnaaghar.pk, so OAuth callbacks that still land on vercel.app keep working.
 */
import { legacyHostRedirect } from "../../src/lib/auth-origin.ts";

interface CanonicalHostEvent {
  url: URL;
  req: { method: string; headers: Headers };
}

export default function canonicalHostMiddleware(
  event: CanonicalHostEvent,
  next: () => unknown | Promise<unknown>,
): unknown | Promise<unknown> {
  const method = (event.req.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") return next();
  const host =
    event.req.headers.get("x-forwarded-host") ?? event.req.headers.get("host") ?? event.url.host;
  const target = legacyHostRedirect({
    env: process.env,
    host,
    pathname: event.url.pathname,
    search: event.url.search,
  });
  if (!target) return next();
  return new Response(null, {
    status: 308,
    headers: { location: target, "cache-control": "public, max-age=3600" },
  });
}

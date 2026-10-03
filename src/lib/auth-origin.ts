import { PUBLIC_SITE_ORIGIN } from "./constants.ts";

/**
 * Public origin used by Better Auth for OAuth redirect_uri / trusted origins.
 * Isolated so it can be unit-tested without loading the Better Auth server.
 */

/**
 * Legacy Vercel production host. Auth falls back to it only when neither
 * BETTER_AUTH_URL nor VERCEL_PROJECT_PRODUCTION_URL is set. The intended
 * production value is BETTER_AUTH_URL=https://apnaaghar.pk (PUBLIC_SITE_ORIGIN),
 * set once the matching Google OAuth redirect URI is registered.
 */
export const KNOWN_PRODUCTION_ORIGIN = "https://gharrent-pakistan.vercel.app";
export const GOOGLE_CALLBACK_PATH = "/api/auth/callback/google";

const LOCAL_DEV_ORIGINS = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://[::1]:8080",
] as const;

export type EnvMap = Record<string, string | undefined>;

function trim(value: string | undefined): string | undefined {
  const v = value?.trim();
  return v ? v : undefined;
}

/** Turn a host or origin into an https origin. */
export function originFromHost(host: string | undefined): string | undefined {
  const cleaned = trim(host)?.replace(/\/+$/, "");
  if (!cleaned) return undefined;
  if (/^https?:\/\//i.test(cleaned)) return cleaned.replace(/\/+$/, "");
  return `https://${cleaned}`;
}

/**
 * Absolute origin Better Auth should advertise to Google.
 * Never returns localhost when running on Vercel.
 */
export function resolveAuthBaseURL(env: EnvMap): string | undefined {
  const explicit = originFromHost(trim(env.BETTER_AUTH_URL));
  if (explicit && !isLoopbackOrigin(explicit)) return explicit;
  if (explicit && !trim(env.VERCEL)) return explicit;

  const vercelProd = originFromHost(trim(env.VERCEL_PROJECT_PRODUCTION_URL));
  const vercelUrl = originFromHost(trim(env.VERCEL_URL));

  if (trim(env.VERCEL_ENV) === "production") {
    return vercelProd || KNOWN_PRODUCTION_ORIGIN;
  }
  if (trim(env.VERCEL)) {
    return vercelProd || vercelUrl || KNOWN_PRODUCTION_ORIGIN;
  }
  return explicit;
}

export function isLoopbackOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "::1";
  } catch {
    return /localhost|127\.0\.0\.1/.test(origin);
  }
}

export function googleCallbackURL(baseOrigin: string): string {
  return `${baseOrigin.replace(/\/+$/, "")}${GOOGLE_CALLBACK_PATH}`;
}

/**
 * Preview broker (`grok_preview`) is only valid for `*.grok-sandbox.com`.
 * Independent Vercel deploys must NOT fall back to it — that produces a
 * redirect_uri of localhost and a client_id Google/the broker will reject.
 */
export function shouldUsePreviewBrokerFallback(env: EnvMap): boolean {
  if (trim(env.GROK_AUTH_CLIENT_ID)) return false;
  if (trim(env.VERCEL)) return false;
  return true;
}

export function resolveTrustedOrigins(env: EnvMap): string[] {
  const urls = new Set<string>();
  const base = resolveAuthBaseURL(env);
  if (base) urls.add(base);
  urls.add(KNOWN_PRODUCTION_ORIGIN);
  urls.add(PUBLIC_SITE_ORIGIN);
  urls.add("https://www.apnaaghar.pk");
  const vercelUrl = originFromHost(trim(env.VERCEL_URL));
  if (vercelUrl) urls.add(vercelUrl);
  const vercelProd = originFromHost(trim(env.VERCEL_PROJECT_PRODUCTION_URL));
  if (vercelProd) urls.add(vercelProd);
  urls.add("https://*.vercel.app");
  for (const local of LOCAL_DEV_ORIGINS) urls.add(local);
  return [...urls];
}

export { LOCAL_DEV_ORIGINS };

function hostOnly(host: string | undefined): string {
  return String(host ?? "")
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();
}

/**
 * Where a request to a legacy `*.vercel.app` production host should be
 * permanently redirected, or null to serve it as-is.
 *
 * Only redirects when ALL of these hold, so previews and auth never break:
 * - this is the production deployment (`VERCEL_ENV=production`; previews are untouched);
 * - the request host is a `*.vercel.app` host (never the custom domain itself);
 * - auth has already moved to the public domain (`BETTER_AUTH_URL` resolves to
 *   PUBLIC_SITE_ORIGIN). Until then Google sign-in still completes on the
 *   vercel.app host and must keep working there;
 * - the path is not an API route (OAuth callbacks, image API).
 */
export function legacyHostRedirect(opts: {
  env: EnvMap;
  host: string | undefined;
  pathname: string;
  search?: string;
}): string | null {
  if (trim(opts.env.VERCEL_ENV) !== "production") return null;
  const host = hostOnly(opts.host);
  if (!host.endsWith(".vercel.app")) return null;
  if (resolveAuthBaseURL(opts.env) !== PUBLIC_SITE_ORIGIN) return null;
  const pathname = opts.pathname.startsWith("/") ? opts.pathname : `/${opts.pathname}`;
  if (pathname === "/api" || pathname.startsWith("/api/")) return null;
  return `${PUBLIC_SITE_ORIGIN}${pathname}${opts.search ?? ""}`;
}

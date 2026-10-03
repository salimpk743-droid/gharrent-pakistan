/** Old guide URLs merged into a single page per search intent. Served as permanent (301) redirects. */
export const LEGACY_PATH_REDIRECTS: Record<string, string> = {
  "/guides/landlords/rental-agreement-legal-checklist": "/guides/rent-agreement-format-pakistan",
};

export function legacyPathRedirect(pathname: string, search = ""): string | null {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const target = LEGACY_PATH_REDIRECTS[clean];
  return target ? `${target}${search}` : null;
}

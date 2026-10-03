/** Limits that stop floods of ads from one account without getting in the way of normal owners and agents. */
export const MAX_PUBLISHES_PER_DAY = 10;
export const MAX_DRAFTS_PER_HOUR = 20;

export type DupCandidate = {
  contactPhone?: string | null;
  districtId?: string | null;
  propertyType?: string | null;
  listingPurpose?: string | null;
  monthlyRent?: number | null;
  area?: string | null;
  title?: string | null;
};

function norm(s: string | null | undefined): string {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/**
 * Two ads count as the same property when the same phone number posts the same type, purpose and
 * price in the same city and area (or with the same title). Different price, area or type is allowed.
 */
export function isLikelyDuplicate(a: DupCandidate, b: DupCandidate): boolean {
  if (!a.contactPhone || a.contactPhone !== b.contactPhone) return false;
  if (!a.districtId || a.districtId !== b.districtId) return false;
  if (a.propertyType !== b.propertyType || (a.listingPurpose || "RENT") !== (b.listingPurpose || "RENT")) return false;
  if ((Number(a.monthlyRent) || 0) !== (Number(b.monthlyRent) || 0)) return false;
  const sameArea = norm(a.area) === norm(b.area);
  const sameTitle = norm(a.title) !== "" && norm(a.title) === norm(b.title);
  return sameArea || sameTitle;
}

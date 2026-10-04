/** Limits that stop floods of ads from one account without getting in the way of normal owners and agents. */
export const MAX_PUBLISHES_PER_DAY = 10;
export const MAX_DRAFTS_PER_HOUR = 20;
/** Prices this close (1%) count as the same price, so Rs 65,000 and Rs 65,500 are one property. */
export const DUPLICATE_PRICE_TOLERANCE = 0.01;

export type DupCandidate = {
  contactPhone?: string | null;
  districtId?: string | null;
  propertyType?: string | null;
  listingPurpose?: string | null;
  monthlyRent?: number | null;
  area?: string | null;
  /** Minor fields: accepted but never compared, so editing them does not make a copy look new. */
  title?: string | null;
  description?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
};

function norm(s: string | null | undefined): string {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function samePrice(a: number, b: number): boolean {
  if (!a || !b) return a === b;
  return Math.abs(a - b) <= Math.max(a, b) * DUPLICATE_PRICE_TOLERANCE;
}

/**
 * Two ads count as the same property when the same phone number posts the same type and purpose in the
 * same city and area at (almost) the same price. Minor fields (title, description, bedrooms, bathrooms,
 * amenities) are ignored: a new title or a reworded description does not turn a copy into a new ad.
 * A different area, type, purpose, phone or a clearly different price is a different property.
 */
export function isLikelyDuplicate(a: DupCandidate, b: DupCandidate): boolean {
  if (!a.contactPhone || a.contactPhone !== b.contactPhone) return false;
  if (!a.districtId || a.districtId !== b.districtId) return false;
  if (a.propertyType !== b.propertyType || (a.listingPurpose || "RENT") !== (b.listingPurpose || "RENT")) return false;
  if (!samePrice(Number(a.monthlyRent) || 0, Number(b.monthlyRent) || 0)) return false;
  return norm(a.area) === norm(b.area);
}

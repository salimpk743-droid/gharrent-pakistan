/**
 * Builds a plain, factual title from fields the advertiser already chose, so posting
 * does not require writing one. Only uses the advertiser's own data.
 */
export function autoListingTitle(input: {
  propertyType?: string | null;
  bedrooms?: number | null;
  listingPurpose?: string | null;
  area?: string | null;
  districtName?: string | null;
}): string {
  const type = (input.propertyType || "Property").trim() || "Property";
  const beds = Number(input.bedrooms) || 0;
  const noBeds = ["Plot", "Commercial", "Office", "Shop", "Farm"].includes(type);
  const lead = !noBeds && beds > 0 ? `${beds} Bed ${type}` : type;
  const purpose = input.listingPurpose === "SALE" ? "for Sale" : "for Rent";
  const place = [input.area, input.districtName]
    .map((s) => (s || "").trim())
    .filter(Boolean)
    .filter((s, i, all) => all.findIndex((x) => x.toLowerCase() === s.toLowerCase()) === i)
    .join(", ");
  const full = place ? `${lead} ${purpose} in ${place}` : `${lead} ${purpose}`;
  if (full.length <= 80) return full;
  const short = input.area ? `${lead} ${purpose} in ${input.area.trim()}` : `${lead} ${purpose}`;
  return short.slice(0, 80).trim();
}

/** True when the advertiser has not written a usable title of their own. */
export function needsAutoTitle(title: string | null | undefined): boolean {
  const t = (title || "").trim();
  return t.length < 8 || t === "Untitled listing";
}

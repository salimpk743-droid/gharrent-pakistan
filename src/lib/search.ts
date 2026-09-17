import { parseListingPurpose, PROPERTY_TYPE_META, typeFromSlug, type ListingPurpose, type PropertyType } from "./constants.ts";

export type SearchFilters = {
  purpose?: ListingPurpose;
  provinceSlug?: string;
  districtSlug?: string;
  tehsilSlug?: string;
  areaSlug?: string;
  type?: PropertyType;
  typeSlug?: string;
  area?: string;
  q?: string;
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  bathrooms?: number;
  minSize?: number;
  maxSize?: number;
  furnished?: string;
  parking?: boolean;
  family?: boolean;
  bachelor?: boolean;
  page?: number;
  pageSize?: number;
  sort?: "newest" | "rent_asc" | "rent_desc";
};

export function normalizeSearchFilters(raw: SearchFilters): SearchFilters {
  const type = raw.type ?? typeFromSlug(raw.typeSlug);
  const page = Math.max(1, Math.floor(Number(raw.page) || 1));
  const pageSize = Math.min(24, Math.max(1, Math.floor(Number(raw.pageSize) || 12)));
  const minRent = raw.minRent != null ? Math.max(0, Math.floor(Number(raw.minRent))) : undefined;
  const maxRent = raw.maxRent != null ? Math.max(0, Math.floor(Number(raw.maxRent))) : undefined;
  const sort = raw.sort === "rent_asc" || raw.sort === "rent_desc" ? raw.sort : "newest";
  const purpose = raw.purpose ? parseListingPurpose(raw.purpose) : undefined;
  return {
    ...raw,
    purpose,
    type,
    page,
    pageSize,
    minRent: Number.isFinite(minRent) ? minRent : undefined,
    maxRent: Number.isFinite(maxRent) ? maxRent : undefined,
    bedrooms: raw.bedrooms != null ? Math.max(0, Math.floor(Number(raw.bedrooms))) : undefined,
    bathrooms: raw.bathrooms != null ? Math.max(0, Math.floor(Number(raw.bathrooms))) : undefined,
    sort,
    q: raw.q?.trim() || undefined,
    area: raw.area?.trim() || undefined,
    areaSlug: raw.areaSlug?.trim() || undefined,
  };
}

export function searchHeading(filters: SearchFilters, locationLabel?: string): string {
  const place = locationLabel || "Pakistan";
  const type = filters.type ?? typeFromSlug(filters.typeSlug);
  const purpose = parseListingPurpose(filters.purpose);
  const verb = purpose === "SALE" ? "for sale" : "for rent";
  if (type) {
    const plural = PROPERTY_TYPE_META[type]?.plural || `${type}s`;
    return `${plural} ${verb} in ${place}`;
  }
  return purpose === "SALE" ? `Homes for sale in ${place}` : `Rental homes in ${place}`;
}

export const SORT_SQL: Record<NonNullable<SearchFilters["sort"]>, string> = {
  newest: "p.is_featured desc, p.published_at desc nulls last, p.created_at desc",
  rent_asc: "p.monthly_rent asc, p.published_at desc",
  rent_desc: "p.monthly_rent desc, p.published_at desc",
};

import { typeFromSlug, type PropertyType } from "./constants.ts";

export type SearchFilters = {
  provinceSlug?: string;
  districtSlug?: string;
  tehsilSlug?: string;
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
  return {
    ...raw,
    type,
    page,
    pageSize,
    minRent: Number.isFinite(minRent) ? minRent : undefined,
    maxRent: Number.isFinite(maxRent) ? maxRent : undefined,
    bedrooms: raw.bedrooms != null ? Math.max(0, Math.floor(Number(raw.bedrooms))) : undefined,
    bathrooms: raw.bathrooms != null ? Math.max(0, Math.floor(Number(raw.bathrooms))) : undefined,
    sort,
    q: raw.q?.trim() || raw.area?.trim() || undefined,
    area: raw.area?.trim() || undefined,
  };
}

export function searchHeading(filters: SearchFilters, locationLabel?: string): string {
  const place = locationLabel || "Pakistan";
  const type = filters.type ?? typeFromSlug(filters.typeSlug);
  if (type) return `${type}s for rent in ${place}`;
  return `Rental homes in ${place}`;
}

export const SORT_SQL: Record<NonNullable<SearchFilters["sort"]>, string> = {
  newest: "p.is_featured desc, p.published_at desc nulls last, p.created_at desc",
  rent_asc: "p.monthly_rent asc, p.published_at desc",
  rent_desc: "p.monthly_rent desc, p.published_at desc",
};

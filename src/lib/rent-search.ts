export type MarketplaceSearch = {
  q?: string;
  typeSlug?: string;
  minRent?: number;
  maxRent?: number;
  tehsilSlug?: string;
  areaSlug?: string;
  page?: number;
};

export type RentSearch = MarketplaceSearch;

export function parseMarketplaceSearch(s: Record<string, unknown>): MarketplaceSearch {
  const num = (v: unknown) => {
    if (v == null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  return {
    q: typeof s.q === "string" ? s.q : undefined,
    typeSlug: typeof s.typeSlug === "string" ? s.typeSlug : undefined,
    minRent: num(s.minRent),
    maxRent: num(s.maxRent),
    tehsilSlug: typeof s.tehsilSlug === "string" ? s.tehsilSlug : undefined,
    areaSlug: typeof s.areaSlug === "string" ? s.areaSlug : undefined,
    page: num(s.page),
  };
}

export const parseRentSearch = parseMarketplaceSearch;

export type RentSearch = {
  q?: string;
  typeSlug?: string;
  minRent?: number;
  maxRent?: number;
  tehsilSlug?: string;
  page?: number;
};

export function parseRentSearch(s: Record<string, unknown>): RentSearch {
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
    page: num(s.page),
  };
}

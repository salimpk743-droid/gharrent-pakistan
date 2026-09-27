import { PROPERTY_TYPE_META, type ListingPurpose, type PropertyType, typeFromSlug } from "@/lib/constants";

export const SEO_INTENT_MIN_INDEXABLE = 3;

type BudgetIntent = {
  kind: "budget";
  slug: string;
  min?: number;
  max?: number;
  label: string;
};

type BedroomIntent = {
  kind: "bedrooms";
  slug: string;
  bedrooms: number;
  label: string;
};

type SizeIntent = {
  kind: "size";
  slug: string;
  size: number;
  unit: "MARLA" | "KANAL" | "SQYARD";
  label: string;
};

export type SeoIntent = BudgetIntent | BedroomIntent | SizeIntent;

const RENT_BUDGETS = [
  [30000, "under-30000", "Under Rs. 30,000"],
  [50000, "under-50000", "Under Rs. 50,000"],
  [75000, "under-75000", "Under Rs. 75,000"],
  [100000, "under-100000", "Under Rs. 100,000"],
  [150000, "under-150000", "Under Rs. 150,000"],
  [200000, "under-200000", "Under Rs. 200,000"],
  [300000, "under-300000", "Under Rs. 300,000"],
] as const;

const SALE_BUDGETS = [
  [5_000_000, "under-50-lakh", "Under Rs. 50 lakh"],
  [10_000_000, "under-1-crore", "Under Rs. 1 crore"],
  [30_000_000, "under-3-crore", "Under Rs. 3 crore"],
  [50_000_000, "under-5-crore", "Under Rs. 5 crore"],
  [100_000_000, "under-10-crore", "Under Rs. 10 crore"],
] as const;

const BEDROOMS = [1, 2, 3, 4, 5] as const;
const SIZES = [
  [3, "3-marla", "MARLA", "3 Marla"],
  [5, "5-marla", "MARLA", "5 Marla"],
  [7, "7-marla", "MARLA", "7 Marla"],
  [10, "10-marla", "MARLA", "10 Marla"],
  [1, "1-kanal", "KANAL", "1 Kanal"],
  [2, "2-kanal", "KANAL", "2 Kanal"],
  [120, "120-sq-yard", "SQYARD", "120 sq yard"],
  [240, "240-sq-yard", "SQYARD", "240 sq yard"],
  [400, "400-sq-yard", "SQYARD", "400 sq yard"],
  [500, "500-sq-yard", "SQYARD", "500 sq yard"],
  [1000, "1000-sq-yard", "SQYARD", "1000 sq yard"],
] as const;

export function seoIntentSlugs(purpose: ListingPurpose): string[] {
  const budgets = purpose === "RENT" ? RENT_BUDGETS : SALE_BUDGETS;
  return [
    ...budgets.map(([, slug]) => slug),
    ...BEDROOMS.map((n) => `${n}-bedrooms`),
    ...SIZES.map(([, slug]) => slug),
  ];
}

export function parseSeoIntent(slug: string, purpose: ListingPurpose): SeoIntent | null {
  const budgets = purpose === "RENT" ? RENT_BUDGETS : SALE_BUDGETS;
  const budget = budgets.find(([, candidate]) => candidate === slug);
  if (budget) {
    return {
      kind: "budget",
      slug,
      max: budget[0],
      label: budget[2],
    };
  }

  const bedroomMatch = /^(\\d+)-bedrooms$/.exec(slug);
  if (bedroomMatch) {
    const bedrooms = Number(bedroomMatch[1]);
    if (BEDROOMS.includes(bedrooms as (typeof BEDROOMS)[number])) {
      return { kind: "bedrooms", slug, bedrooms, label: `${bedrooms} bedroom${bedrooms === 1 ? "" : "s"}` };
    }
  }

  const size = SIZES.find(([, candidate]) => candidate === slug);
  if (size) {
    return {
      kind: "size",
      slug,
      size: size[0],
      unit: size[2],
      label: size[3],
    };
  }

  return null;
}

export function seoIntentFilters(intent: SeoIntent) {
  if (intent.kind === "budget") return { maxRent: intent.max };
  if (intent.kind === "bedrooms") return { bedrooms: intent.bedrooms };
  return { minSize: intent.size, maxSize: intent.size, sizeUnit: intent.unit };
}

export function seoIntentTitle(opts: {
  purpose: ListingPurpose;
  place: string;
  type?: PropertyType | null;
  intent: SeoIntent;
}): string {
  const typeName = opts.type ? PROPERTY_TYPE_META[opts.type].plural : "Properties";
  const purpose = opts.purpose === "SALE" ? "for Sale" : "for Rent";
  if (opts.intent.kind === "budget") return `${typeName} ${purpose} ${opts.intent.label} in ${opts.place} | Apna Ghar`;
  if (opts.intent.kind === "bedrooms") return `${opts.intent.label} ${typeName.toLowerCase()} ${purpose} in ${opts.place} | Apna Ghar`;
  return `${opts.intent.label} ${typeName.toLowerCase()} ${purpose} in ${opts.place} | Apna Ghar`;
}

export function seoIntentDescription(opts: {
  purpose: ListingPurpose;
  place: string;
  type?: PropertyType | null;
  intent: SeoIntent;
}): string {
  const typeName = opts.type ? PROPERTY_TYPE_META[opts.type].plural.toLowerCase() : "properties";
  const purpose = opts.purpose === "SALE" ? "sale" : "rent";
  if (opts.intent.kind === "budget") {
    return `Browse ${typeName} ${purpose} ${opts.intent.label.toLowerCase()} in ${opts.place}. Compare current listings, price, size and location on Apna Ghar.`;
  }
  if (opts.intent.kind === "bedrooms") {
    return `Browse ${opts.intent.label} ${typeName} for ${purpose} in ${opts.place}. Compare current listings, price, size and location on Apna Ghar.`;
  }
  return `Browse ${opts.intent.label} ${typeName} for ${purpose} in ${opts.place}. Compare current listings, price, size and location on Apna Ghar.`;
}

export function seoIntentPath(opts: {
  purpose: ListingPurpose;
  province: string;
  district: string;
  type: string;
  intent: string;
}) {
  const base = opts.purpose === "SALE" ? "sale" : "rent";
  return `/${base}/${opts.province}/${opts.district}/${opts.type}/${opts.intent}`;
}

export function seoIntentAllowedType(intent: SeoIntent): boolean {
  if (intent.kind === "size") return true;
  return true;
}

export function seoIntentCanonicalType(typeSlug: string | undefined) {
  return typeFromSlug(typeSlug);
}

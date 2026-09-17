export const APP_NAME = "Apna Ghar";
export const APP_TAGLINE = "Find a home to rent or buy across Pakistan.";
export const APP_DESCRIPTION =
  "Search houses, flats, portions, plots and commercial properties for rent and sale across Pakistan by province, city, area, property type and budget.";

export const LISTING_PURPOSES = ["RENT", "SALE"] as const;
export type ListingPurpose = (typeof LISTING_PURPOSES)[number];

export const PURPOSE_LABEL: Record<ListingPurpose, string> = {
  RENT: "For rent",
  SALE: "For sale",
};

export const PURPOSE_KICKER: Record<ListingPurpose, string> = {
  RENT: "FOR RENT",
  SALE: "FOR SALE",
};

export const PROPERTY_TYPES = [
  "House",
  "Apartment",
  "Portion",
  "Room",
  "Hostel",
  "Plot",
  "Commercial",
  "Office",
  "Shop",
  "Farm",
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const FEATURED_PROPERTY_TYPES = ["House", "Apartment", "Portion", "Room", "Hostel"] as const satisfies readonly PropertyType[];

export const PROPERTY_TYPE_META: Record<
  PropertyType,
  { slug: string; plural: string; blurb: string }
> = {
  House: { slug: "houses", plural: "Houses", blurb: "Family homes" },
  Apartment: { slug: "apartments", plural: "Apartments", blurb: "City living" },
  Portion: { slug: "portions", plural: "Portions", blurb: "Independent spaces" },
  Room: { slug: "rooms", plural: "Rooms", blurb: "Private rooms" },
  Hostel: { slug: "hostels", plural: "Hostels", blurb: "Shared living" },
  Plot: { slug: "plots", plural: "Plots", blurb: "Residential land" },
  Commercial: { slug: "commercial", plural: "Commercial", blurb: "Business properties" },
  Office: { slug: "offices", plural: "Offices", blurb: "Workspaces" },
  Shop: { slug: "shops", plural: "Shops", blurb: "Retail spaces" },
  Farm: { slug: "farms", plural: "Farms", blurb: "Agricultural land" },
};

export const SIZE_UNITS = ["MARLA", "KANAL", "SQFT", "SQYARD"] as const;
export type SizeUnit = (typeof SIZE_UNITS)[number];

export const SIZE_UNIT_LABEL: Record<SizeUnit, string> = {
  MARLA: "Marla",
  KANAL: "Kanal",
  SQFT: "sq ft",
  SQYARD: "sq yard",
};

export const FURNISHED_STATUSES = ["UNFURNISHED", "SEMI_FURNISHED", "FURNISHED"] as const;
export type FurnishedStatus = (typeof FURNISHED_STATUSES)[number];

export const FURNISHED_LABEL: Record<FurnishedStatus, string> = {
  UNFURNISHED: "Unfurnished",
  SEMI_FURNISHED: "Semi-furnished",
  FURNISHED: "Furnished",
};

export const LISTING_STATUSES = [
  "DRAFT",
  "PENDING_REVIEW",
  "PUBLISHED",
  "PAUSED",
  "REJECTED",
  "RENTED",
  "EXPIRED",
  "DELETED",
] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const STATUS_LABEL: Record<ListingStatus, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Not published",
  PUBLISHED: "Published",
  PAUSED: "Paused",
  REJECTED: "Rejected",
  RENTED: "Rented",
  EXPIRED: "Expired",
  DELETED: "Deleted",
};

export function statusLabel(status: ListingStatus, purpose: ListingPurpose = "RENT"): string {
  if (status === "RENTED" && purpose === "SALE") return "Sold";
  return STATUS_LABEL[status];
}

export const USER_ROLES = ["USER", "MODERATOR", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PROFILE_STATUSES = ["ACTIVE", "SUSPENDED"] as const;
export type ProfileStatus = (typeof PROFILE_STATUSES)[number];

export const REPORT_REASONS = [
  { id: "FAKE", label: "Fake property" },
  { id: "INCORRECT", label: "Incorrect information" },
  { id: "ALREADY_RENTED", label: "Already rented or sold" },
  { id: "SCAM", label: "Scam / suspicious activity" },
  { id: "DUPLICATE", label: "Duplicate listing" },
  { id: "WRONG_LOCATION", label: "Wrong location" },
  { id: "INAPPROPRIATE", label: "Inappropriate content" },
  { id: "OTHER", label: "Other" },
] as const;

export const RENT_PRESETS = [
  { id: "any", label: "Any budget", min: undefined, max: undefined },
  { id: "under50", label: "Under Rs. 50,000", min: undefined, max: 49999 },
  { id: "50to100", label: "Rs. 50k – 100k", min: 50000, max: 100000 },
  { id: "100to200", label: "Rs. 100k – 200k", min: 100001, max: 200000 },
  { id: "above200", label: "Above Rs. 200k", min: 200001, max: undefined },
] as const;

export const SALE_PRESETS = [
  { id: "any", label: "Any price", min: undefined, max: undefined },
  { id: "under50l", label: "Under Rs. 50 lakh", min: undefined, max: 4_999_999 },
  { id: "50lto1cr", label: "Rs. 50 lakh – 1 crore", min: 5_000_000, max: 10_000_000 },
  { id: "1to3cr", label: "Rs. 1 – 3 crore", min: 10_000_001, max: 30_000_000 },
  { id: "3to10cr", label: "Rs. 3 – 10 crore", min: 30_000_001, max: 100_000_000 },
  { id: "above10cr", label: "Above Rs. 10 crore", min: 100_000_001, max: undefined },
] as const;

export const POPULAR_CITIES = [
  { label: "Lahore", provinceSlug: "punjab", districtSlug: "lahore", region: "Punjab" },
  { label: "Karachi", provinceSlug: "sindh", districtSlug: "karachi", region: "Sindh" },
  { label: "Islamabad", provinceSlug: "islamabad-capital-territory", districtSlug: "islamabad", region: "Capital Territory" },
  { label: "Rawalpindi", provinceSlug: "punjab", districtSlug: "rawalpindi", region: "Punjab" },
  { label: "Peshawar", provinceSlug: "khyber-pakhtunkhwa", districtSlug: "peshawar", region: "Khyber Pakhtunkhwa" },
] as const;

export const PAGE_SIZE = 12;
export const MAX_IMAGES = 8;
export const MAX_IMAGE_BYTES = 1_500_000;
export const LISTING_DURATION_DAYS = 60;
export const DEFAULT_PHONE_PLACEHOLDER = "03xx-xxxxxxx";

export function typeFromSlug(slug: string | undefined): PropertyType | undefined {
  if (!slug) return undefined;
  const s = slug.toLowerCase();
  return PROPERTY_TYPES.find((t) => PROPERTY_TYPE_META[t].slug === s || t.toLowerCase() === s);
}

export function typeToSlug(type: PropertyType): string {
  return PROPERTY_TYPE_META[type].slug;
}

export function parseListingPurpose(value: string | null | undefined): ListingPurpose {
  return value === "SALE" ? "SALE" : "RENT";
}

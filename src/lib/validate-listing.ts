import {
  FURNISHED_STATUSES,
  LISTING_PURPOSES,
  PROPERTY_TYPES,
  SIZE_UNITS,
  type ListingPurpose,
  type PropertyType,
} from "./constants.ts";
import { normalizePkPhone } from "./phone.ts";

export type ListingInput = {
  title?: string;
  description?: string;
  propertyType?: string;
  listingPurpose?: string;
  provinceId?: string | null;
  districtId?: string | null;
  tehsilId?: string | null;
  areaId?: string | null;
  area?: string;
  address?: string;
  monthlyRent?: number;
  securityDeposit?: number | null;
  advanceRent?: number | null;
  bedrooms?: number;
  bathrooms?: number;
  propertySize?: number | null;
  sizeUnit?: string;
  furnishedStatus?: string;
  contactPhone?: string;
  contactWhatsapp?: string | null;
  imageCount?: number;
};

export function validateForSubmit(input: ListingInput): string[] {
  const errors: string[] = [];
  const title = (input.title || "").trim();
  if (title.length < 8) errors.push("Add a clear title of at least 8 characters.");
  if (title.length > 80) errors.push("Title must be 80 characters or fewer.");
  if (!input.provinceId) errors.push("Choose a province or region.");
  if (!input.districtId) errors.push("Choose a city.");
  if (!(input.areaId || input.area || "").toString().trim()) errors.push("Choose the area or locality.");
  if (!PROPERTY_TYPES.includes((input.propertyType || "") as PropertyType)) {
    errors.push("Choose a valid property type.");
  }
  const purpose = (input.listingPurpose || "RENT") as ListingPurpose;
  if (input.listingPurpose && !LISTING_PURPOSES.includes(purpose)) {
    errors.push("Choose whether this listing is for rent or for sale.");
  }
  const amount = Number(input.monthlyRent) || 0;
  if (purpose === "SALE") {
    if (amount < 50_000) errors.push("Sale price must be at least Rs. 50,000.");
    if (amount > 2_000_000_000) errors.push("Sale price is unreasonably high. Please check the amount.");
  } else {
    if (amount < 1000) errors.push("Monthly rent must be at least Rs. 1,000.");
    if (amount > 50_000_000) errors.push("Monthly rent is unreasonably high. Please check the amount.");
  }
  const beds = Number(input.bedrooms);
  if (!Number.isFinite(beds) || beds < 0 || beds > 20) errors.push("Bedrooms must be between 0 and 20.");
  const baths = Number(input.bathrooms);
  if (!Number.isFinite(baths) || baths < 0 || baths > 20) errors.push("Bathrooms must be between 0 and 20.");
  const desc = (input.description || "").trim();
  if (desc.length < 40) errors.push("Write a description of at least 40 characters.");
  if (desc.length > 4000) errors.push("Description must be 4,000 characters or fewer.");
  if (!normalizePkPhone(input.contactPhone)) {
    errors.push("Enter a valid Pakistani mobile number so renters can contact you.");
  }
  if (input.contactWhatsapp && !normalizePkPhone(input.contactWhatsapp)) {
    errors.push("WhatsApp number must be a valid Pakistani mobile number.");
  }
  if ((input.imageCount ?? 0) < 1) errors.push("Add at least one cover photo.");
  if (input.sizeUnit && !SIZE_UNITS.includes(input.sizeUnit as (typeof SIZE_UNITS)[number])) {
    errors.push("Choose a valid size unit.");
  }
  if (
    input.furnishedStatus &&
    !FURNISHED_STATUSES.includes(input.furnishedStatus as (typeof FURNISHED_STATUSES)[number])
  ) {
    errors.push("Choose a valid furnished status.");
  }
  return errors;
}

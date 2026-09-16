import type { FurnishedStatus, ListingStatus, PropertyType, SizeUnit } from "@/lib/constants";
import type { OwnerListing, PropertyImage, PublicProperty } from "@/lib/types";

export type PropertyRow = {
  id: string;
  owner_id: string;
  title: string;
  slug: string;
  description: string;
  property_type: string;
  status: string;
  province_id: string | null;
  district_id: string | null;
  tehsil_id: string | null;
  province_name: string | null;
  district_name: string | null;
  tehsil_name: string | null;
  province_slug: string | null;
  district_slug: string | null;
  tehsil_slug: string | null;
  area: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  monthly_rent: number;
  security_deposit: number | null;
  advance_rent: number | null;
  bedrooms: number;
  bathrooms: number;
  property_size: number | null;
  size_unit: string;
  floor: number | null;
  total_floors: number | null;
  furnished_status: string;
  parking: boolean;
  electricity: boolean;
  gas: boolean;
  water: boolean;
  maintenance: boolean;
  family_allowed: boolean;
  bachelor_allowed: boolean;
  pets_allowed: boolean;
  available_from: string | null;
  is_featured: boolean;
  is_sample: boolean;
  rejection_reason: string | null;
  view_count: number;
  created_at: string;
  published_at: string | null;
  expires_at: string | null;
  contact_phone: string;
  contact_whatsapp: string | null;
  advertiser_name: string | null;
  advertiser_image: string | null;
  advertiser_google: boolean | null;
  advertiser_trusted: boolean | null;
};

export const PROPERTY_SELECT = `
  p.id, p.owner_id, p.title, p.slug, p.description, p.property_type, p.status,
  p.province_id, p.district_id, p.tehsil_id,
  pr.name as province_name, d.name as district_name, t.name as tehsil_name,
  pr.slug as province_slug, d.slug as district_slug, t.slug as tehsil_slug,
  p.area, p.address, p.latitude, p.longitude, p.monthly_rent, p.security_deposit, p.advance_rent,
  p.bedrooms, p.bathrooms, p.property_size, p.size_unit, p.floor, p.total_floors,
  p.furnished_status, p.parking, p.electricity, p.gas, p.water, p.maintenance,
  p.family_allowed, p.bachelor_allowed, p.pets_allowed, p.available_from,
  p.is_featured, p.is_sample, p.rejection_reason, p.view_count, p.created_at,
  p.published_at, p.expires_at, p.contact_phone, p.contact_whatsapp,
  coalesce(pf.display_name, case when p.is_sample then 'GharRent sample' else 'Advertiser' end) as advertiser_name,
  pf.image_url as advertiser_image,
  coalesce(pf.google_verified, false) as advertiser_google,
  coalesce(pf.trusted_advertiser, false) as advertiser_trusted
`;

export const PROPERTY_FROM = `
  properties p
  left join provinces pr on pr.id = p.province_id
  left join districts d on d.id = p.district_id
  left join tehsils t on t.id = p.tehsil_id
  left join profiles pf on pf.user_id = p.owner_id
`;

export function imageUrl(row: { id: string; url: string | null }): string {
  if (row.url && !row.url.startsWith("data:")) return row.url;
  return `/api/images/${row.id}`;
}

export function mapImage(row: {
  id: string;
  url: string | null;
  sort_order: number;
  is_cover: boolean;
  width: number | null;
  height: number | null;
}): PropertyImage {
  return {
    id: row.id,
    url: imageUrl(row),
    sortOrder: row.sort_order,
    isCover: row.is_cover,
    width: row.width,
    height: row.height,
  };
}

export function mapPublic(
  row: PropertyRow,
  images: PropertyImage[],
  extras?: { saved?: boolean; includeContact?: boolean },
): PublicProperty {
  const cover = images.find((i) => i.isCover) || images[0] || null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    propertyType: row.property_type as PropertyType,
    status: row.status as ListingStatus,
    provinceId: row.province_id,
    districtId: row.district_id,
    tehsilId: row.tehsil_id,
    provinceName: row.province_name,
    districtName: row.district_name,
    tehsilName: row.tehsil_name,
    provinceSlug: row.province_slug,
    districtSlug: row.district_slug,
    tehsilSlug: row.tehsil_slug,
    area: row.area,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    monthlyRent: Number(row.monthly_rent) || 0,
    securityDeposit: row.security_deposit == null ? null : Number(row.security_deposit),
    advanceRent: row.advance_rent == null ? null : Number(row.advance_rent),
    bedrooms: Number(row.bedrooms) || 0,
    bathrooms: Number(row.bathrooms) || 0,
    propertySize: row.property_size == null ? null : Number(row.property_size),
    sizeUnit: (row.size_unit as SizeUnit) || "MARLA",
    floor: row.floor == null ? null : Number(row.floor),
    totalFloors: row.total_floors == null ? null : Number(row.total_floors),
    furnishedStatus: (row.furnished_status as FurnishedStatus) || "UNFURNISHED",
    parking: Boolean(row.parking),
    electricity: Boolean(row.electricity),
    gas: Boolean(row.gas),
    water: Boolean(row.water),
    maintenance: Boolean(row.maintenance),
    familyAllowed: Boolean(row.family_allowed),
    bachelorAllowed: Boolean(row.bachelor_allowed),
    petsAllowed: Boolean(row.pets_allowed),
    availableFrom: row.available_from,
    isFeatured: Boolean(row.is_featured),
    isSample: Boolean(row.is_sample),
    viewCount: Number(row.view_count) || 0,
    createdAt: String(row.created_at),
    publishedAt: row.published_at ? String(row.published_at) : null,
    expiresAt: row.expires_at ? String(row.expires_at) : null,
    coverImage: cover,
    images,
    advertiser: {
      displayName: row.advertiser_name || "Advertiser",
      imageUrl: row.advertiser_image,
      googleVerified: Boolean(row.advertiser_google),
      trustedAdvertiser: Boolean(row.advertiser_trusted),
    },
    contactPhone: extras?.includeContact ? row.contact_phone : undefined,
    contactWhatsapp: extras?.includeContact ? row.contact_whatsapp : undefined,
    saved: extras?.saved,
  };
}

export function mapOwner(
  row: PropertyRow,
  images: PropertyImage[],
  counts: { saves: number; calls: number; whatsapp: number },
): OwnerListing {
  return {
    ...mapPublic(row, images, { includeContact: true }),
    ownerId: row.owner_id,
    rejectionReason: row.rejection_reason,
    saveCount: counts.saves,
    callClicks: counts.calls,
    whatsappClicks: counts.whatsapp,
  };
}

import type {
  FurnishedStatus,
  ListingPurpose,
  ListingStatus,
  ProfileStatus,
  PropertyType,
  SizeUnit,
  UserRole,
} from "./constants";

export type LocationNode = {
  id: string;
  slug: string;
  name: string;
};

export type AreaNode = LocationNode & { aliases: string };

export type ProvinceNode = LocationNode & {
  districts: LocationNode[];
};

export type PropertyImage = {
  id: string;
  url: string;
  sortOrder: number;
  isCover: boolean;
  width: number | null;
  height: number | null;
};

export type PublicProperty = {
  id: string;
  slug: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  listingPurpose: ListingPurpose;
  status: ListingStatus;
  provinceId: string | null;
  districtId: string | null;
  tehsilId: string | null;
  areaId: string | null;
  provinceName: string | null;
  districtName: string | null;
  tehsilName: string | null;
  areaName: string | null;
  provinceSlug: string | null;
  districtSlug: string | null;
  tehsilSlug: string | null;
  areaSlug: string | null;
  area: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  monthlyRent: number;
  securityDeposit: number | null;
  advanceRent: number | null;
  bedrooms: number;
  bathrooms: number;
  propertySize: number | null;
  sizeUnit: SizeUnit;
  floor: number | null;
  totalFloors: number | null;
  furnishedStatus: FurnishedStatus;
  parking: boolean;
  electricity: boolean;
  gas: boolean;
  water: boolean;
  maintenance: boolean;
  familyAllowed: boolean;
  bachelorAllowed: boolean;
  petsAllowed: boolean;
  availableFrom: string | null;
  isFeatured: boolean;
  isSample: boolean;
  viewCount: number;
  createdAt: string;
  publishedAt: string | null;
  expiresAt: string | null;
  coverImage: PropertyImage | null;
  images: PropertyImage[];
  advertiser: {
    displayName: string;
    imageUrl: string | null;
    googleVerified: boolean;
    trustedAdvertiser: boolean;
  };
  contactPhone?: string;
  contactWhatsapp?: string | null;
  saved?: boolean;
};

export type OwnerListing = PublicProperty & {
  ownerId: string;
  rejectionReason: string | null;
  saveCount: number;
  callClicks: number;
  whatsappClicks: number;
};

export type Profile = {
  userId: string;
  displayName: string | null;
  email: string | null;
  imageUrl: string | null;
  phone: string | null;
  role: UserRole;
  status: ProfileStatus;
  googleVerified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean;
  trustedAdvertiser: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

export type ReportRow = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertySlug: string | null;
  reporterId: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
};

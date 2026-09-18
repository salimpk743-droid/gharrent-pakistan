import { notFound, redirect } from "@tanstack/react-router";
import {
  APP_DESCRIPTION,
  APP_NAME,
  PROPERTY_TYPE_META,
  PUBLIC_SITE_ORIGIN,
  canonicalTypeSlug,
  type ListingPurpose,
  type PropertyType,
} from "./constants.ts";

export { PUBLIC_SITE_ORIGIN, PUBLIC_SITE_HOST } from "./constants.ts";

const PROVINCE_SLUG_ALIASES: Record<string, string> = {
  islamabad: "islamabad-capital-territory",
};

export const HOME_SEO_TITLE = `${APP_NAME} | Rent, Buy & Sell Properties in Pakistan`;
export const HOME_SEO_DESCRIPTION =
  "Find houses, flats, plots and commercial properties for rent, buy and sale across Pakistan. Search by province, city, area, type and budget on Apna Ghar.";

const SHARE_IMAGE = `${PUBLIC_SITE_ORIGIN}/og.jpg`;

export type HeadSnippet = {
  meta: Array<Record<string, string>>;
  links?: Array<Record<string, string>>;
};

export type ListingSeoInput = {
  slug: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  listingPurpose: ListingPurpose;
  status: string;
  areaName?: string | null;
  area?: string | null;
  districtName?: string | null;
  provinceName?: string | null;
  provinceSlug?: string | null;
  districtSlug?: string | null;
  monthlyRent: number;
  bedrooms: number;
  bathrooms: number;
  propertySize?: number | null;
  sizeUnit?: string | null;
  publishedAt?: string | null;
  address?: string | null;
  coverImage?: { url: string } | null;
  images?: { url: string }[];
};

export type SearchSeoData = {
  locationLabel?: string;
  total?: number;
  province?: { slug: string; name: string } | null;
  district?: { slug: string; name: string } | null;
  type?: PropertyType | null;
  area?: { slug: string; name: string } | null;
};

export function canonicalProvinceSlug(slug: string | undefined): string | undefined {
  if (!slug) return slug;
  return PROVINCE_SLUG_ALIASES[slug] ?? slug;
}

/** Path only: no query, no hash, no trailing slash except `/`. */
export function canonicalPath(input: string): string {
  let path = String(input || "/").trim();
  try {
    if (/^https?:\/\//i.test(path)) path = new URL(path).pathname;
  } catch {
    /* keep as path */
  }
  const cut = path.split(/[?#]/, 1)[0] || "/";
  let next = cut.startsWith("/") ? cut : `/${cut}`;
  next = next.replace(/\/{2,}/g, "/");
  if (next.length > 1) next = next.replace(/\/+$/, "");
  const parts = next.split("/");
  if ((parts[1] === "rent" || parts[1] === "sale") && parts[2]) {
    const aliased = canonicalProvinceSlug(parts[2]);
    if (aliased && aliased !== parts[2]) {
      parts[2] = aliased;
      next = parts.join("/");
    }
  }
  if ((parts[1] === "rent" || parts[1] === "sale") && parts[4]) {
    const aliased = canonicalTypeSlug(parts[4]);
    if (aliased && aliased !== parts[4]) {
      parts[4] = aliased;
      next = parts.join("/");
    }
  }
  return next || "/";
}

export function canonicalUrl(path = "/"): string {
  const clean = canonicalPath(path);
  return clean === "/" ? `${PUBLIC_SITE_ORIGIN}/` : `${PUBLIC_SITE_ORIGIN}${clean}`;
}

export function absoluteAssetUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("data:")) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${PUBLIC_SITE_ORIGIN}${url}`;
  return undefined;
}

export function formatPkrSeo(amount: number | string | null | undefined): string {
  const n = typeof amount === "number" ? amount : Number(String(amount ?? "").replace(/[^0-9.-]/g, "")) || 0;
  return `PKR ${Math.round(n).toLocaleString("en-US")}`;
}

export function jsonLdText(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;");
}

/** Calendar date for sitemap lastmod. Accepts Date, ISO, or YYYY-MM-DD. */
export function toSitemapDate(value: string | Date | null | undefined): string | undefined {
  if (value == null || value === "") return undefined;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return undefined;
    return value.toISOString().slice(0, 10);
  }
  const raw = String(value).trim();
  const isoDay = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoDay) return isoDay[1];
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
}

/** ISO-8601 timestamp for JSON-LD dates. */
export function toIsoDateTime(value: string | Date | null | undefined): string | undefined {
  if (value == null || value === "") return undefined;
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

export function robotsTxt(): string {
  return `User-agent: *
Allow: /
Allow: /account-deletion
Disallow: /account
Disallow: /admin
Disallow: /login
Disallow: /post
Disallow: /api/auth

Sitemap: ${PUBLIC_SITE_ORIGIN}/sitemap.xml
`;
}

export type SitemapEntry = { path: string; lastmod?: string | Date | null };

export const LISTING_SITEMAP_CHUNK = 10_000;

export function listingSitemapPages(total: number): number {
  return Math.max(1, Math.ceil(Math.max(0, total) / LISTING_SITEMAP_CHUNK));
}

export function renderSitemapXml(entries: SitemapEntry[]): string {
  const seen = new Set<string>();
  const rows: string[] = [];
  for (const entry of entries) {
    const loc = canonicalUrl(entry.path);
    if (seen.has(loc)) continue;
    seen.add(loc);
    const lastmod = toSitemapDate(entry.lastmod);
    const lastmodXml = lastmod ? `\n    <lastmod>${xmlEscape(lastmod)}</lastmod>` : "";
    rows.push(`  <url>\n    <loc>${xmlEscape(loc)}</loc>${lastmodXml}\n  </url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows.join("\n")}
</urlset>
`;
}

export function renderSitemapIndex(entries: SitemapEntry[]): string {
  const seen = new Set<string>();
  const rows: string[] = [];
  for (const entry of entries) {
    const loc = canonicalUrl(entry.path);
    if (seen.has(loc)) continue;
    seen.add(loc);
    const lastmod = toSitemapDate(entry.lastmod);
    const lastmodXml = lastmod ? `\n    <lastmod>${xmlEscape(lastmod)}</lastmod>` : "";
    rows.push(`  <sitemap>\n    <loc>${xmlEscape(loc)}</loc>${lastmodXml}\n  </sitemap>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows.join("\n")}
</sitemapindex>
`;
}

export function xmlResponse(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export function publicSeo(opts: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
}): HeadSnippet {
  const url = canonicalUrl(opts.path);
  const index = opts.index !== false;
  return {
    meta: [
      { title: opts.title },
      { name: "description", content: opts.description },
      { name: "robots", content: index ? "index, follow" : "noindex, follow" },
      { property: "og:title", content: opts.title },
      { property: "og:description", content: opts.description },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
      { property: "og:image", content: SHARE_IMAGE },
      { property: "og:site_name", content: APP_NAME },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: opts.title },
      { name: "twitter:description", content: opts.description },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export function privateSeo(opts: { title: string; description?: string }): HeadSnippet {
  return {
    meta: [
      { title: opts.title },
      ...(opts.description ? [{ name: "description", content: opts.description }] : []),
      { name: "robots", content: "noindex, nofollow" },
    ],
  };
}

export function locationPlaceName(data?: SearchSeoData | null, fallback = "Pakistan"): string {
  return data?.district?.name || data?.province?.name || fallback;
}

export function locationSeoTitle(opts: {
  purpose: ListingPurpose;
  place: string;
  type?: PropertyType | null;
}): string {
  const place = opts.place || "Pakistan";
  const verb = opts.purpose === "SALE" ? "Sale" : "Rent";
  if (opts.type) {
    const plural = PROPERTY_TYPE_META[opts.type]?.plural || `${opts.type}s`;
    return `${plural} for ${verb} in ${place} | ${APP_NAME}`;
  }
  if (opts.purpose === "SALE") {
    return place === "Pakistan"
      ? `Houses for Sale in Pakistan | ${APP_NAME}`
      : `Properties for Sale in ${place} | ${APP_NAME}`;
  }
  return `Houses for Rent in ${place} | ${APP_NAME}`;
}

export function locationSeoDescription(opts: {
  purpose: ListingPurpose;
  place: string;
  type?: PropertyType | null;
}): string {
  const place = opts.place || "Pakistan";
  const verb = opts.purpose === "SALE" ? "sale" : "rent";
  if (opts.type) {
    const plural = (PROPERTY_TYPE_META[opts.type]?.plural || `${opts.type}s`).toLowerCase();
    return `Find ${plural} for ${verb} in ${place} on Apna Ghar. Compare price, size and location, then contact the advertiser.`;
  }
  if (opts.purpose === "SALE") {
    return `Browse houses, plots and commercial properties for sale in ${place}. Compare asking price, size and location on Apna Ghar.`;
  }
  return `Browse houses, flats, portions and other homes for rent in ${place}. Compare rent, size and location on Apna Ghar.`;
}

export function searchPath(opts: {
  purpose: ListingPurpose;
  province?: string;
  district?: string;
  type?: string;
}): string {
  const segs = [opts.purpose === "SALE" ? "sale" : "rent"];
  const province = canonicalProvinceSlug(opts.province);
  if (province) segs.push(province);
  if (opts.district) segs.push(opts.district);
  const type = canonicalTypeSlug(opts.type);
  if (type) segs.push(type);
  return `/${segs.join("/")}`;
}

/** 308 alias URLs onto the official path; 404 unknown property-type segments. */
export function assertCanonicalMarketplacePath(opts: {
  purpose: ListingPurpose;
  province?: string;
  district?: string;
  type?: string;
}): void {
  if (opts.type && !canonicalTypeSlug(opts.type)) throw notFound();
  const canonicalHref = searchPath(opts);
  const purposeSeg = opts.purpose === "SALE" ? "sale" : "rent";
  const requestedHref = `/${[purposeSeg, opts.province, opts.district, opts.type].filter(Boolean).join("/")}`;
  if (canonicalHref !== requestedHref) {
    throw redirect({ href: canonicalHref, statusCode: 308 });
  }
}

export function searchRouteSeo(opts: {
  purpose: ListingPurpose;
  params?: { province?: string; district?: string; type?: string };
  data?: SearchSeoData | null;
}): HeadSnippet {
  const params = opts.params ?? {};
  const typeSlug = params.type ? canonicalTypeSlug(params.type) : undefined;
  const unknownType = Boolean(params.type && !typeSlug);
  const path = searchPath({
    purpose: opts.purpose,
    province: params.province,
    district: params.district,
    type: typeSlug,
  });
  const type = opts.data?.type ?? null;
  const place = locationPlaceName(opts.data);
  const hub = !params.district && !params.type;
  const total = opts.data?.total ?? 0;
  return publicSeo({
    title: locationSeoTitle({ purpose: opts.purpose, place, type }),
    description: locationSeoDescription({ purpose: opts.purpose, place, type }),
    path,
    index: !unknownType && (hub || total > 0),
  });
}

function listingPlace(p: ListingSeoInput): string {
  const area = (p.areaName || p.area || "").trim();
  const city = (p.districtName || "").trim();
  return [area, city].filter(Boolean).join(" ") || p.provinceName || "Pakistan";
}

function listingSizePrefix(p: ListingSeoInput): string {
  if (p.propertySize == null || !p.sizeUnit) return "";
  if (p.sizeUnit === "MARLA") return `${p.propertySize} Marla `;
  if (p.sizeUnit === "KANAL") return `${p.propertySize} Kanal `;
  return "";
}

export function listingSeoTitle(p: ListingSeoInput): string {
  const verb = p.listingPurpose === "SALE" ? "Sale" : "Rent";
  const core = `${listingSizePrefix(p)}${p.propertyType} for ${verb} in ${listingPlace(p)}`;
  return `${core} | ${formatPkrSeo(p.monthlyRent)} | ${APP_NAME}`;
}

export function listingSeoDescription(p: ListingSeoInput): string {
  const verb = p.listingPurpose === "SALE" ? "for sale" : "for rent";
  const price =
    p.listingPurpose === "SALE"
      ? formatPkrSeo(p.monthlyRent)
      : `${formatPkrSeo(p.monthlyRent)} per month`;
  const residential = p.propertyType === "House" || p.propertyType === "Apartment" || p.propertyType === "Portion" || p.propertyType === "Room" || p.propertyType === "Hostel";
  const rooms = residential
    ? ` ${p.bedrooms} bed${p.bedrooms === 1 ? "" : "s"}, ${p.bathrooms} bath${p.bathrooms === 1 ? "" : "s"}.`
    : "";
  return `${p.propertyType} ${verb} in ${listingPlace(p)}. ${price}.${rooms} Listed on Apna Ghar.`;
}

export function listingSeo(p: ListingSeoInput | null | undefined): HeadSnippet {
  if (!p) {
    return publicSeo({
      title: `Property | ${APP_NAME}`,
      description: APP_DESCRIPTION,
      path: "/",
      index: false,
    });
  }
  const publicListing = p.status === "PUBLISHED";
  return publicSeo({
    title: listingSeoTitle(p),
    description: listingSeoDescription(p),
    path: `/property/${p.slug}`,
    index: publicListing,
  });
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

export function homeJsonLd() {
  const origin = `${PUBLIC_SITE_ORIGIN}/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${PUBLIC_SITE_ORIGIN}/#organization`,
        name: APP_NAME,
        url: origin,
        logo: `${PUBLIC_SITE_ORIGIN}/favicon.svg`,
        description: HOME_SEO_DESCRIPTION,
        areaServed: "PK",
      },
      {
        "@type": "WebSite",
        "@id": `${PUBLIC_SITE_ORIGIN}/#website`,
        name: APP_NAME,
        url: origin,
        description: HOME_SEO_DESCRIPTION,
        publisher: { "@id": `${PUBLIC_SITE_ORIGIN}/#organization` },
        inLanguage: "en-PK",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${PUBLIC_SITE_ORIGIN}/rent?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export function resultsBreadcrumbJsonLd(opts: {
  purpose: ListingPurpose;
  provinceSlug?: string;
  provinceName?: string;
  districtSlug?: string;
  districtName?: string;
  typeSlug?: string;
  typeName?: string;
}) {
  const items = [
    { name: "Home", path: "/" },
    { name: opts.purpose === "SALE" ? "Buy" : "Rent", path: opts.purpose === "SALE" ? "/sale" : "/rent" },
  ];
  if (opts.provinceSlug && opts.provinceName) {
    items.push({
      name: opts.provinceName,
      path: searchPath({ purpose: opts.purpose, province: opts.provinceSlug }),
    });
  }
  if (opts.provinceSlug && opts.districtSlug && opts.districtName) {
    items.push({
      name: opts.districtName,
      path: searchPath({ purpose: opts.purpose, province: opts.provinceSlug, district: opts.districtSlug }),
    });
  }
  if (opts.provinceSlug && opts.districtSlug && opts.typeSlug && opts.typeName) {
    items.push({
      name: opts.typeName,
      path: searchPath({
        purpose: opts.purpose,
        province: opts.provinceSlug,
        district: opts.districtSlug,
        type: opts.typeSlug,
      }),
    });
  }
  return breadcrumbJsonLd(items);
}

export function resultsItemListJsonLd(items: { slug: string; title: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: canonicalUrl(`/property/${item.slug}`),
      name: item.title,
    })),
  };
}

function offeredType(type: PropertyType): string {
  switch (type) {
    case "House":
      return "House";
    case "Apartment":
      return "Apartment";
    case "Portion":
    case "Hostel":
      return "Accommodation";
    case "Room":
      return "Room";
    case "Shop":
    case "Office":
    case "Commercial":
    case "Plot":
    case "Farm":
      return "Place";
  }
}

function isResidential(type: PropertyType): boolean {
  return type === "House" || type === "Apartment" || type === "Portion" || type === "Room" || type === "Hostel";
}

function sizeUnitText(unit?: string | null): string | undefined {
  if (unit === "MARLA") return "Marla";
  if (unit === "KANAL") return "Kanal";
  if (unit === "SQFT") return "sq ft";
  if (unit === "SQYARD") return "sq yard";
  return undefined;
}

export function listingJsonLd(p: ListingSeoInput) {
  const url = canonicalUrl(`/property/${p.slug}`);
  const images = [p.coverImage?.url, ...(p.images ?? []).map((img) => img.url)]
    .map((u) => absoluteAssetUrl(u))
    .filter((u): u is string => Boolean(u));
  const uniqueImages = [...new Set(images)].slice(0, 4);
  const city = (p.districtName || "").trim() || undefined;
  const region = (p.provinceName || "").trim() || city;
  const area = (p.areaName || p.area || "").trim();
  const price = Number(p.monthlyRent) || 0;
  const sale = p.listingPurpose === "SALE";
  const about: Record<string, unknown> = {
    "@type": offeredType(p.propertyType),
    name: p.title,
  };
  if (isResidential(p.propertyType)) {
    about.numberOfBedrooms = p.bedrooms;
    about.numberOfBathroomsTotal = p.bathrooms;
  }
  if (p.propertySize != null) {
    about.floorSize = {
      "@type": "QuantitativeValue",
      value: p.propertySize,
      unitText: sizeUnitText(p.sizeUnit) || p.sizeUnit,
    };
  }
  const priceSpecification: Record<string, unknown> = {
    "@type": "UnitPriceSpecification",
    price,
    priceCurrency: "PKR",
  };
  if (!sale) {
    priceSpecification.unitCode = "MON";
    priceSpecification.unitText = "month";
  }
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.title,
    description: p.description.slice(0, 400),
    url,
    datePosted: toIsoDateTime(p.publishedAt),
    image: uniqueImages.length ? uniqueImages : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: p.address || area || undefined,
      addressLocality: city || area || undefined,
      addressRegion: region,
      addressCountry: "PK",
    },
    about,
    offers: {
      "@type": "Offer",
      url,
      price,
      priceCurrency: "PKR",
      availability: "https://schema.org/InStock",
      businessFunction: sale
        ? "http://purl.org/goodrelations/v1#Sell"
        : "http://purl.org/goodrelations/v1#LeaseOut",
      priceSpecification,
    },
  };
}

export function listingBreadcrumbJsonLd(p: ListingSeoInput) {
  const purpose = p.listingPurpose === "SALE" ? "SALE" : "RENT";
  const items = [
    { name: "Home", path: "/" },
    {
      name: purpose === "SALE" ? "Buy" : "Rent",
      path: purpose === "SALE" ? "/sale" : "/rent",
    },
  ];
  if (p.provinceSlug && p.provinceName) {
    items.push({
      name: p.provinceName,
      path: searchPath({ purpose, province: p.provinceSlug }),
    });
  }
  if (p.provinceSlug && p.districtSlug && p.districtName) {
    items.push({
      name: p.districtName,
      path: searchPath({ purpose, province: p.provinceSlug, district: p.districtSlug }),
    });
  }
  return breadcrumbJsonLd(items);
}

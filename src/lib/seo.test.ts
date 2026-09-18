import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  HOME_SEO_TITLE,
  LISTING_SITEMAP_CHUNK,
  canonicalPath,
  canonicalUrl,
  formatPkrSeo,
  jsonLdText,
  listingBreadcrumbJsonLd,
  listingJsonLd,
  listingSeo,
  listingSeoTitle,
  listingSitemapPages,
  locationSeoTitle,
  privateSeo,
  publicSeo,
  renderSitemapIndex,
  renderSitemapXml,
  resultsBreadcrumbJsonLd,
  robotsTxt,
  searchPath,
  searchRouteSeo,
  toIsoDateTime,
  toSitemapDate,
} from "./seo.ts";

describe("canonical URLs", () => {
  it("always uses apnaaghar.pk, never the Vercel host", () => {
    assert.equal(canonicalUrl("/"), "https://apnaaghar.pk/");
    assert.equal(canonicalUrl("/rent"), "https://apnaaghar.pk/rent");
    assert.ok(!canonicalUrl("/sale").includes("vercel.app"));
  });

  it("strips query strings, hashes and trailing slashes", () => {
    assert.equal(canonicalPath("/rent/punjab/lahore/?areaSlug=dha&minRent=50000&page=2"), "/rent/punjab/lahore");
    assert.equal(canonicalPath("/rent/"), "/rent");
    assert.equal(canonicalPath("https://gharrent-pakistan.vercel.app/sale/sindh/karachi/"), "/sale/sindh/karachi");
    assert.equal(canonicalPath("/"), "/");
  });

  it("aliases the short Islamabad province slug", () => {
    assert.equal(canonicalPath("/rent/islamabad"), "/rent/islamabad-capital-territory");
    assert.equal(canonicalPath("/sale/islamabad/islamabad"), "/sale/islamabad-capital-territory/islamabad");
    assert.equal(searchPath({ purpose: "RENT", province: "islamabad" }), "/rent/islamabad-capital-territory");
  });
});

describe("titles", () => {
  it("uses the approved homepage title", () => {
    assert.equal(HOME_SEO_TITLE, "Apna Ghar | Rent, Buy & Sell Properties in Pakistan");
  });

  it("builds location titles without stuffing the province onto the city", () => {
    assert.equal(locationSeoTitle({ purpose: "RENT", place: "Pakistan" }), "Houses for Rent in Pakistan | Apna Ghar");
    assert.equal(locationSeoTitle({ purpose: "SALE", place: "Pakistan" }), "Houses for Sale in Pakistan | Apna Ghar");
    assert.equal(
      locationSeoTitle({ purpose: "RENT", place: "Islamabad" }),
      "Houses for Rent in Islamabad | Apna Ghar",
    );
    assert.equal(
      locationSeoTitle({ purpose: "SALE", place: "Lahore" }),
      "Properties for Sale in Lahore | Apna Ghar",
    );
    assert.equal(
      locationSeoTitle({ purpose: "RENT", place: "Islamabad", type: "House" }),
      "Houses for Rent in Islamabad | Apna Ghar",
    );
  });

  it("builds listing titles from type, area, city and price", () => {
    assert.equal(
      listingSeoTitle({
        slug: "house-f10",
        title: "Family house",
        description: "A house",
        propertyType: "House",
        listingPurpose: "RENT",
        status: "PUBLISHED",
        areaName: "F-10",
        districtName: "Islamabad",
        monthlyRent: 85000,
        bedrooms: 3,
        bathrooms: 2,
      }),
      "House for Rent in F-10 Islamabad | PKR 85,000 | Apna Ghar",
    );
    assert.equal(
      listingSeoTitle({
        slug: "dha-house",
        title: "DHA house",
        description: "A house",
        propertyType: "House",
        listingPurpose: "SALE",
        status: "PUBLISHED",
        areaName: "DHA",
        districtName: "Lahore",
        monthlyRent: 25_000_000,
        bedrooms: 5,
        bathrooms: 4,
        propertySize: 5,
        sizeUnit: "MARLA",
      }),
      "5 Marla House for Sale in DHA Lahore | PKR 25,000,000 | Apna Ghar",
    );
    assert.equal(formatPkrSeo(85000), "PKR 85,000");
  });
});

describe("index / noindex", () => {
  it("indexes hubs even when empty, and skips empty city pages", () => {
    const national = searchRouteSeo({ purpose: "RENT", params: {}, data: { total: 0 } });
    assert.ok(national.meta.some((m) => m.name === "robots" && m.content === "index, follow"));
    const emptyCity = searchRouteSeo({
      purpose: "RENT",
      params: { province: "punjab", district: "chiniot" },
      data: { total: 0, district: { slug: "chiniot", name: "Chiniot" } },
    });
    assert.ok(emptyCity.meta.some((m) => m.name === "robots" && m.content === "noindex, follow"));
    const liveCity = searchRouteSeo({
      purpose: "SALE",
      params: { province: "punjab", district: "lahore" },
      data: { total: 4, district: { slug: "lahore", name: "Lahore" } },
    });
    assert.ok(liveCity.meta.some((m) => m.name === "robots" && m.content === "index, follow"));
    assert.ok(liveCity.links?.some((l) => l.rel === "canonical" && l.href === "https://apnaaghar.pk/sale/punjab/lahore"));
  });

  it("does not index unpublished listings", () => {
    const head = listingSeo({
      slug: "draft-home",
      title: "Draft",
      description: "n/a",
      propertyType: "House",
      listingPurpose: "RENT",
      status: "PAUSED",
      districtName: "Lahore",
      monthlyRent: 50000,
      bedrooms: 2,
      bathrooms: 1,
    });
    assert.ok(head.meta.some((m) => m.name === "robots" && m.content === "noindex, follow"));
  });

  it("marks private pages noindex, nofollow", () => {
    const head = privateSeo({ title: "Sign in — Apna Ghar" });
    assert.ok(head.meta.some((m) => m.name === "robots" && m.content === "noindex, nofollow"));
    assert.equal(head.links, undefined);
  });
});

describe("robots and sitemap", () => {
  it("allows public pages and blocks private ones", () => {
    const body = robotsTxt();
    assert.match(body, /Allow: \//);
    assert.match(body, /Allow: \/account-deletion/);
    assert.match(body, /Disallow: \/account$/m);
    assert.match(body, /Disallow: \/admin/);
    assert.match(body, /Disallow: \/login/);
    assert.match(body, /Disallow: \/post/);
    assert.match(body, /Disallow: \/api\/auth/);
    assert.match(body, /Sitemap: https:\/\/apnaaghar\.pk\/sitemap\.xml/);
    assert.doesNotMatch(body, /vercel\.app/);
  });

  it("writes loc values on the public origin and skips duplicate paths", () => {
    const xml = renderSitemapXml([
      { path: "/rent/" },
      { path: "/rent?page=2" },
      { path: "/property/house-f10", lastmod: "2026-09-18T10:00:00.000Z" },
      { path: "/property/house-date", lastmod: new Date("2026-09-17T18:30:00.000Z") },
    ]);
    assert.match(xml, /<loc>https:\/\/apnaaghar\.pk\/rent<\/loc>/);
    assert.match(xml, /<lastmod>2026-09-18<\/lastmod>/);
    assert.match(xml, /<lastmod>2026-09-17<\/lastmod>/);
    assert.equal((xml.match(/\/rent<\/loc>/g) || []).length, 1);
    assert.doesNotMatch(xml, /page=2/);
    assert.doesNotMatch(xml, /vercel\.app/);
    assert.doesNotMatch(xml, /limit 5000/);
  });

  it("builds a sitemap index of child sitemaps on the public origin", () => {
    const xml = renderSitemapIndex([
      { path: "/sitemap-pages.xml" },
      { path: "/sitemap-locations.xml" },
      { path: "/sitemap-listings/1" },
      { path: "/sitemap-listings/1" },
    ]);
    assert.match(xml, /<sitemapindex /);
    assert.match(xml, /<loc>https:\/\/apnaaghar\.pk\/sitemap-pages\.xml<\/loc>/);
    assert.match(xml, /<loc>https:\/\/apnaaghar\.pk\/sitemap-listings\/1<\/loc>/);
    assert.equal((xml.match(/sitemap-listings\/1<\/loc>/g) || []).length, 1);
    assert.doesNotMatch(xml, /vercel\.app/);
    assert.equal(listingSitemapPages(0), 1);
    assert.equal(listingSitemapPages(LISTING_SITEMAP_CHUNK), 1);
    assert.equal(listingSitemapPages(LISTING_SITEMAP_CHUNK + 1), 2);
    assert.ok(LISTING_SITEMAP_CHUNK > 5000);
  });

  it("normalises lastmod and JSON-LD dates from Date objects", () => {
    assert.equal(toSitemapDate("2026-09-18T10:00:00.000Z"), "2026-09-18");
    assert.equal(toSitemapDate(new Date("2026-09-17T22:00:00.000Z")), "2026-09-17");
    assert.equal(toIsoDateTime("2026-09-01T00:00:00.000Z"), "2026-09-01T00:00:00.000Z");
    assert.equal(toIsoDateTime(new Date("2026-09-01T00:00:00.000Z")), "2026-09-01T00:00:00.000Z");
  });
});

describe("structured data", () => {
  it("escapes HTML in JSON-LD and does not invent ratings or phone numbers", () => {
    const json = listingJsonLd({
      slug: "house-f10",
      title: "Family house",
      description: "A house <script>alert(1)</script> with a garden.",
      propertyType: "House",
      listingPurpose: "RENT",
      status: "PUBLISHED",
      areaName: "F-10",
      districtName: "Islamabad",
      monthlyRent: 85000,
      bedrooms: 3,
      bathrooms: 2,
      publishedAt: "2026-09-01T00:00:00.000Z",
    });
    const text = jsonLdText(json);
    assert.ok(text.includes("\\u003cscript>"));
    assert.equal("aggregateRating" in json, false);
    assert.equal("telephone" in json, false);
    assert.equal(JSON.stringify(json).includes("03"), false);
    assert.equal(json.offers.priceCurrency, "PKR");
    assert.equal(json.offers.price, 85000);
    assert.equal(json.offers.priceSpecification.unitCode, "MON");
    assert.equal(json.offers.businessFunction, "http://purl.org/goodrelations/v1#LeaseOut");
    assert.equal(json.datePosted, "2026-09-01T00:00:00.000Z");
    assert.equal(json.address.addressLocality, "Islamabad");
    assert.equal(json.address.addressCountry, "PK");
    assert.equal(json.url, "https://apnaaghar.pk/property/house-f10");
    const sale = listingJsonLd({
      slug: "dha-house",
      title: "DHA house",
      description: "A house",
      propertyType: "House",
      listingPurpose: "SALE",
      status: "PUBLISHED",
      areaName: "DHA",
      districtName: "Lahore",
      provinceName: "Punjab",
      monthlyRent: 25_000_000,
      bedrooms: 5,
      bathrooms: 4,
      publishedAt: "2026-08-01T00:00:00.000Z",
    });
    assert.equal(sale.offers.price, 25_000_000);
    assert.equal(sale.offers.priceSpecification.unitCode, undefined);
    assert.equal(sale.offers.businessFunction, "http://purl.org/goodrelations/v1#Sell");
    assert.equal(sale.address.addressLocality, "Lahore");
    assert.equal(sale.address.addressRegion, "Punjab");
  });

  it("maps listing about types without treating shops as Accommodation", () => {
    const base = {
      slug: "x",
      title: "T",
      description: "D",
      listingPurpose: "SALE" as const,
      status: "PUBLISHED",
      monthlyRent: 1,
      bedrooms: 0,
      bathrooms: 0,
    };
    assert.equal(listingJsonLd({ ...base, propertyType: "House" }).about["@type"], "House");
    assert.equal(listingJsonLd({ ...base, propertyType: "Apartment" }).about["@type"], "Apartment");
    assert.equal(listingJsonLd({ ...base, propertyType: "Portion" }).about["@type"], "Accommodation");
    assert.equal(listingJsonLd({ ...base, propertyType: "Hostel" }).about["@type"], "Accommodation");
    assert.equal(listingJsonLd({ ...base, propertyType: "Room" }).about["@type"], "Room");
    assert.equal(listingJsonLd({ ...base, propertyType: "Shop" }).about["@type"], "Place");
    assert.equal(listingJsonLd({ ...base, propertyType: "Office" }).about["@type"], "Place");
    assert.equal(listingJsonLd({ ...base, propertyType: "Commercial" }).about["@type"], "Place");
    assert.equal(listingJsonLd({ ...base, propertyType: "Plot" }).about["@type"], "Place");
    assert.equal(listingJsonLd({ ...base, propertyType: "Farm" }).about["@type"], "Place");
  });

  it("puts a canonical and Open Graph url on public pages", () => {
    const head = publicSeo({
      title: HOME_SEO_TITLE,
      description: "Find homes",
      path: "/",
    });
    assert.ok(head.links?.some((l) => l.rel === "canonical" && l.href === "https://apnaaghar.pk/"));
    assert.ok(head.meta.some((m) => m.property === "og:url" && m.content === "https://apnaaghar.pk/"));
    assert.ok(head.meta.some((m) => m.property === "og:image" && m.content === "https://apnaaghar.pk/og.jpg"));
  });

  it("matches breadcrumb URLs to canonical location paths", () => {
    const crumbs = resultsBreadcrumbJsonLd({
      purpose: "RENT",
      provinceSlug: "punjab",
      provinceName: "Punjab",
      districtSlug: "lahore",
      districtName: "Lahore",
      typeSlug: "houses",
      typeName: "Houses",
    });
    const items = crumbs.itemListElement;
    assert.equal(items[0].item, "https://apnaaghar.pk/");
    assert.equal(items[1].item, "https://apnaaghar.pk/rent");
    assert.equal(items[2].item, "https://apnaaghar.pk/rent/punjab");
    assert.equal(items[3].item, "https://apnaaghar.pk/rent/punjab/lahore");
    assert.equal(items[4].item, "https://apnaaghar.pk/rent/punjab/lahore/houses");
    const listingCrumbs = listingBreadcrumbJsonLd({
      slug: "house-f10",
      title: "Family house",
      description: "A house",
      propertyType: "House",
      listingPurpose: "SALE",
      status: "PUBLISHED",
      provinceName: "Punjab",
      provinceSlug: "punjab",
      districtName: "Lahore",
      districtSlug: "lahore",
      monthlyRent: 1,
      bedrooms: 3,
      bathrooms: 2,
    });
    const listingItems = listingCrumbs.itemListElement;
    assert.equal(listingItems[1].item, "https://apnaaghar.pk/sale");
    assert.equal(listingItems[2].item, "https://apnaaghar.pk/sale/punjab");
    assert.equal(listingItems[3].item, "https://apnaaghar.pk/sale/punjab/lahore");
  });
});

import { Link } from "@tanstack/react-router";
import { PropertyCard } from "@/components/property/property-card";
import { SearchBox } from "@/components/search/search-box";
import { PROPERTY_TYPE_META, PROPERTY_TYPES, type ListingPurpose, typeFromSlug } from "@/lib/constants";
import type { PublicProperty } from "@/lib/types";
import { searchHeading } from "@/lib/search";
import { searchPageCopy } from "@/lib/search-copy";
import { resultsBreadcrumbJsonLd, resultsItemListJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

export function ResultsPage({
  items,
  total,
  page,
  pageSize,
  locationLabel,
  provinceSlug,
  districtSlug,
  typeSlug,
  purpose = "RENT",
  title,
  description,
}: {
  items: PublicProperty[];
  total: number;
  page: number;
  pageSize: number;
  locationLabel: string;
  provinceSlug?: string;
  districtSlug?: string;
  typeSlug?: string;
  purpose?: ListingPurpose;
  title?: string;
  description?: string;
}) {
  const copy = searchPageCopy({
    purpose,
    province: provinceSlug,
    district: districtSlug,
    type: typeSlug,
  });
  const heading = copy?.h1 || title || searchHeading({ type: typeFromSlug(typeSlug), typeSlug, purpose }, locationLabel);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const rootLabel = purpose === "SALE" ? "Buy" : "Rent";
  const labelParts = locationLabel.split(", ").filter((part) => part && part !== "Pakistan");
  const provinceName = provinceSlug ? labelParts.at(-1) : undefined;
  const districtName = districtSlug ? (labelParts.length >= 2 ? labelParts.at(-2) : undefined) : undefined;
  const type = typeFromSlug(typeSlug);
  const typeName = type ? PROPERTY_TYPE_META[type].plural : undefined;
  const crumbClass = "text-muted no-underline hover:text-forest";
  return (
    <div className="pb-12">
      <JsonLd
        data={resultsBreadcrumbJsonLd({
          purpose,
          provinceSlug,
          provinceName,
          districtSlug,
          districtName,
          typeSlug,
          typeName,
        })}
      />
      {items.length > 0 ? <JsonLd data={resultsItemListJsonLd(items)} /> : null}
      <section className="bg-ink px-4 py-8 text-white">
        <div className="mx-auto w-[min(1120px,100%)] min-w-0">
          <p className="text-[10px] font-extrabold tracking-[0.16em] text-lime">
            {purpose === "SALE" ? "HOMES FOR SALE" : "RENTAL SEARCH"}
          </p>
          <h1 className="font-display mt-2 text-3xl tracking-tight sm:text-4xl">{heading}</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#d6e2dc]">
            {description ||
              (!provinceSlug && !districtSlug && !typeSlug
                ? purpose === "SALE"
                  ? "Browse houses, flats, plots and commercial properties for sale in Pakistan. Compare price, size and location, then contact the advertiser."
                  : "Browse houses, flats, portions and other properties for rent in Pakistan. Compare monthly rent, size and location, then contact the advertiser."
                : `${total} listing${total === 1 ? "" : "s"} · ${locationLabel}`)}
          </p>
          {copy?.intro ? <p className="mt-2 max-w-2xl text-sm text-[#d6e2dc]">{copy.intro}</p> : null}
          <div className="mt-5 min-w-0">
            <SearchBox compact purpose={purpose} />
          </div>
        </div>
      </section>
      <div className="mx-auto w-[min(1120px,calc(100%-32px))] py-8">
        <nav className="mb-5 flex flex-wrap gap-2 text-sm" aria-label="Breadcrumb">
          <Link to="/" className={crumbClass}>
            Home
          </Link>
          <span className="text-line">/</span>
          {purpose === "SALE" ? (
            <Link to="/sale" className={crumbClass}>
              {rootLabel}
            </Link>
          ) : (
            <Link to="/rent" className={crumbClass}>
              {rootLabel}
            </Link>
          )}
          {provinceSlug && provinceName && (
            <>
              <span className="text-line">/</span>
              {purpose === "SALE" ? (
                <Link to="/sale/$province" params={{ province: provinceSlug }} className={crumbClass}>
                  {provinceName}
                </Link>
              ) : (
                <Link to="/rent/$province" params={{ province: provinceSlug }} className={crumbClass}>
                  {provinceName}
                </Link>
              )}
            </>
          )}
          {provinceSlug && districtSlug && districtName && (
            <>
              <span className="text-line">/</span>
              {purpose === "SALE" ? (
                <Link
                  to="/sale/$province/$district"
                  params={{ province: provinceSlug, district: districtSlug }}
                  className={crumbClass}
                >
                  {districtName}
                </Link>
              ) : (
                <Link
                  to="/rent/$province/$district"
                  params={{ province: provinceSlug, district: districtSlug }}
                  className={crumbClass}
                >
                  {districtName}
                </Link>
              )}
            </>
          )}
          {provinceSlug && districtSlug && typeSlug && typeName && (
            <>
              <span className="text-line">/</span>
              {purpose === "SALE" ? (
                <Link
                  to="/sale/$province/$district/$type"
                  params={{ province: provinceSlug, district: districtSlug, type: typeSlug }}
                  className={crumbClass}
                >
                  {typeName}
                </Link>
              ) : (
                <Link
                  to="/rent/$province/$district/$type"
                  params={{ province: provinceSlug, district: districtSlug, type: typeSlug }}
                  className={crumbClass}
                >
                  {typeName}
                </Link>
              )}
            </>
          )}
        </nav>
        {districtSlug && provinceSlug && (
          <div className="mb-6 flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((t) => {
              const slug = PROPERTY_TYPE_META[t].slug;
              const active = typeSlug === slug;
              const chipClass = `rounded-full border px-3 py-1.5 text-xs font-semibold no-underline ${
                active ? "border-forest bg-forest text-white" : "border-line text-ink hover:border-forest"
              }`;
              return purpose === "SALE" ? (
                <Link
                  key={t}
                  to="/sale/$province/$district/$type"
                  params={{ province: provinceSlug, district: districtSlug, type: slug }}
                  className={chipClass}
                >
                  {PROPERTY_TYPE_META[t].plural}
                </Link>
              ) : (
                <Link
                  key={t}
                  to="/rent/$province/$district/$type"
                  params={{ province: provinceSlug, district: districtSlug, type: slug }}
                  className={chipClass}
                >
                  {PROPERTY_TYPE_META[t].plural}
                </Link>
              );
            })}
          </div>
        )}
        {items.length === 0 ? (
          <div className="rounded-xl border border-line bg-white px-6 py-8">
            <p className="font-semibold text-ink">
              {copy ? "No published listings match this landing page right now." : "No matching properties are currently available."}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {copy
                ? "The page remains available as a permanent location and property-type landing page. Broaden the search above, explore the main location page, or check again after advertisers publish new properties."
                : "Try a broader location, property type or budget."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
        {pages > 1 && (
          <p className="mt-8 text-center text-sm text-muted">
            Page {page} of {pages}
          </p>
        )}
        {copy?.landingContent ? (
          <section className="mt-10 max-w-4xl rounded-xl border border-line bg-white p-6">
            <h2 className="font-display text-2xl text-ink">{copy.landingContent.heading}</h2>
            {copy.landingContent.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-sm leading-6 text-muted">
                {paragraph}
              </p>
            ))}
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              {districtSlug && provinceSlug && typeSlug ? (
                <Link
                  to={purpose === "SALE" ? "/sale/$province/$district" : "/rent/$province/$district"}
                  params={{ province: provinceSlug, district: districtSlug }}
                  className="font-semibold text-forest underline"
                >
                  Browse all {locationLabel} properties
                </Link>
              ) : null}
              {districtSlug && provinceSlug && !typeSlug ? (
                <Link
                  to={purpose === "SALE" ? "/sale/$province" : "/rent/$province"}
                  params={{ province: provinceSlug }}
                  className="font-semibold text-forest underline"
                >
                  Browse more {provinceName ?? "local"} properties
                </Link>
              ) : null}
              {purpose === "RENT" ? (
                <Link to="/how-to-rent-a-house-in-pakistan" className="font-semibold text-forest underline">
                  Read the Pakistan rental guide
                </Link>
              ) : null}
            </div>
          </section>
        ) : null}
        {!provinceSlug && !districtSlug && !typeSlug && (
          <section className="mt-10 max-w-3xl rounded-xl border border-line bg-white p-6">
            <h2 className="font-display text-2xl text-ink">
              {purpose === "SALE" ? "Find property for sale in Pakistan" : "Find property for rent in Pakistan"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              {purpose === "SALE"
                ? "Use Apna Ghar to browse houses, flats, plots and commercial properties for sale in Pakistan. Compare asking price, property size and location, then contact the advertiser for the listing details."
                : "Use Apna Ghar to browse houses, flats, portions and other properties for rent in Pakistan. Compare monthly rent, property size and location, then contact the advertiser for the listing details."}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted">
              Search by location and property type, then narrow the results using budget and other available filters. For practical guidance before renting, read our{" "}
              <Link to="/how-to-rent-a-house-in-pakistan" className="font-semibold text-forest underline">
                guide to renting a house in Pakistan
              </Link>.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

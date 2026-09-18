import { Link } from "@tanstack/react-router";
import { PropertyCard } from "@/components/property/property-card";
import { SearchBox } from "@/components/search/search-box";
import { PROPERTY_TYPE_META, PROPERTY_TYPES, type ListingPurpose, typeFromSlug } from "@/lib/constants";
import type { PublicProperty } from "@/lib/types";
import { searchHeading } from "@/lib/search";
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
  const heading = title || searchHeading({ type: typeFromSlug(typeSlug), typeSlug, purpose }, locationLabel);
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
            {description || `${total} listing${total === 1 ? "" : "s"} · ${locationLabel}`}
          </p>
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
          <div className="rounded-xl border border-dashed border-line bg-white px-6 py-16 text-center text-muted">
            No properties found. Try a broader location or budget.
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
      </div>
    </div>
  );
}

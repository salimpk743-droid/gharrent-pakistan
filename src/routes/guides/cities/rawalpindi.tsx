import { Link, createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/legal-page";
import { JsonLd } from "@/components/seo/json-ld";
import { APP_NAME, PUBLIC_SITE_ORIGIN } from "@/lib/constants";
import {
  RAWALPINDI_GUIDE_DESCRIPTION,
  RAWALPINDI_GUIDE_PATH,
  RAWALPINDI_GUIDE_TITLE,
  breadcrumbJsonLd,
  canonicalUrl,
  guideSeo,
} from "@/lib/seo";

export const Route = createFileRoute("/guides/cities/rawalpindi")({
  head: () =>
    guideSeo({
      title: RAWALPINDI_GUIDE_TITLE,
      description: RAWALPINDI_GUIDE_DESCRIPTION,
      path: RAWALPINDI_GUIDE_PATH,
    }),
  component: Page,
});

function Page() {
  const url = canonicalUrl(RAWALPINDI_GUIDE_PATH);
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: "Rawalpindi", path: RAWALPINDI_GUIDE_PATH },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Rawalpindi Property & Rental Guide",
          description: RAWALPINDI_GUIDE_DESCRIPTION,
          inLanguage: "en-PK",
          datePublished: "2026-09-22",
          dateModified: "2026-09-22",
          mainEntityOfPage: url,
          url,
          author: { "@type": "Organization", name: APP_NAME, url: PUBLIC_SITE_ORIGIN + "/" },
          publisher: { "@type": "Organization", name: APP_NAME, url: PUBLIC_SITE_ORIGIN + "/" },
        }}
      />
      <LegalPage eyebrow="CITY PROPERTY GUIDE" title="Rawalpindi Property & Rental Guide" updated="22 September 2026">
        <div className="rounded-lg border border-line bg-cream p-4 text-ink">
          This guide is practical property information, not legal or financial advice. Rents, availability and local
          requirements can change, so confirm current details before signing an agreement or paying money.
        </div>
        <p>
          Rawalpindi is one of Pakistan’s major urban rental markets and is closely connected to Islamabad. For a
          renter, the useful starting points are the part of the city you need, the property type, the size of home,
          and the total monthly budget rather than rent alone.
        </p>
        <h2>Find current rental properties</h2>
        <p>
          Apna Ghar has a dedicated results page for{" "}
          <Link to="/rent/$province/$district" params={{ province: "punjab", district: "rawalpindi" }}>
            properties for rent in Rawalpindi
          </Link>
          . Use the live listings to compare asking rents, property types, sizes and locations before arranging a
          visit.
        </p>
        <h2>Common property types</h2>
        <p>Rental searches in Rawalpindi commonly include:</p>
        <ul>
          <li><strong>Houses</strong> for households looking for a self-contained property.</li>
          <li><strong>Portions</strong> when a separate floor or part of a house is more suitable.</li>
          <li><strong>Flats and apartments</strong> for people who prefer a building-based home.</li>
          <li><strong>Rooms or other accommodation</strong> where the listing and household requirements allow it.</li>
        </ul>
        <p>
          Availability changes over time. A property type that is common in one part of Rawalpindi may have fewer
          current listings in another, so use the live results rather than assuming every area has the same supply.
        </p>
        <h2>Popular areas to research</h2>
        <p>
          Rawalpindi is made up of neighbourhoods with different housing stock, road access and proximity to Islamabad.
          When comparing an area, look at the actual commute and the immediate streets around a property rather than
          relying only on an area name.
        </p>
        <p>
          Satellite Town, Bahria Town, Chaklala, Saddar and surrounding Rawalpindi neighbourhoods are examples of
          locations renters may encounter while searching. Availability and asking rents are not uniform across these
          areas.
        </p>
        <h2>5 Marla and 10 Marla homes</h2>
        <p>
          Marla is a common way to describe residential plot and house size in the Rawalpindi-Islamabad market. A
          “5 Marla house” and a “10 Marla house” can differ substantially in layout, age, condition, street and
          facilities even when the nominal size is the same.
        </p>
        <p>
          When comparing listings, check bedrooms, bathrooms, covered area where provided, parking, construction
          condition and the exact location alongside the advertised Marla size.
        </p>
        <h2>What can affect rent?</h2>
        <ul>
          <li>Location and access to major roads or Islamabad.</li>
          <li>House, portion, flat or other property type.</li>
          <li>Size and number of bedrooms and bathrooms.</li>
          <li>Furnished versus unfurnished condition.</li>
          <li>Age and condition of construction.</li>
          <li>Parking, security arrangements, backup power and water arrangements.</li>
          <li>Society or building charges and other recurring costs.</li>
        </ul>
        <p>
          Asking rent is only one part of the cost. Before agreeing, ask about security deposit, advance rent, utility
          bills, maintenance or society charges, and which repairs the landlord handles.
        </p>
        <h2>Before renting in Rawalpindi</h2>
        <p>
          Visit the actual property and inspect water pressure, electricity, gas arrangements, drainage, dampness,
          doors and locks, parking and existing damage. Ask who owns or is authorised to rent the property. Keep
          receipts for payments and read the written rent agreement before signing.
        </p>
        <p>
          For a full step-by-step checklist, see{" "}
          <Link className="font-semibold text-forest no-underline hover:underline" to="/how-to-rent-a-house-in-pakistan">
            How to Rent a House in Pakistan
          </Link>
          . For fraud and payment precautions, see{" "}
          <Link className="font-semibold text-forest no-underline hover:underline" to="/safety">
            Apna Ghar's safety guidance
          </Link>
          .
        </p>
        <h2>Rawalpindi rental search checklist</h2>
        <ul>
          <li>Choose the area based on your actual commute and daily needs.</li>
          <li>Set a total monthly budget, not just a rent figure.</li>
          <li>Compare current listings for the same property type and approximate size.</li>
          <li>Visit before paying a substantial amount.</li>
          <li>Confirm the advertiser is authorised to rent the property.</li>
          <li>Write rent, deposit, utilities and repair responsibilities into the agreement.</li>
          <li>Photograph existing damage and record meter readings at handover.</li>
        </ul>
        <section className="mt-10 rounded-xl border border-line bg-cream p-5">
          <h2 className="mt-0! text-xl!">Browse Rawalpindi properties</h2>
          <p>
            Ready to compare what is currently available?{" "}
            <Link
              className="font-semibold text-forest no-underline hover:underline"
              to="/rent/$province/$district"
              params={{ province: "punjab", district: "rawalpindi" }}
            >
              View Rawalpindi rental listings
            </Link>
            .
          </p>
        </section>
      </LegalPage>
    </>
  );
}

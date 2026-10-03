import { Link, createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/legal-page";
import { JsonLd } from "@/components/seo/json-ld";
import { APP_NAME, PUBLIC_SITE_ORIGIN } from "@/lib/constants";
import { breadcrumbJsonLd, canonicalUrl, guideSeo } from "@/lib/seo";

const PATH = "/guides/renting/house-vs-flat-vs-portion-pakistan";
const TITLE = "House vs Flat vs Portion for Rent in Pakistan: Which Suits You? | Apna Ghar";
const DESCRIPTION = "Compare houses, flats and portions for rent in Pakistan by privacy, space, recurring costs, parking, building rules and household needs.";

export const Route = createFileRoute("/guides/renting/house-vs-flat-vs-portion-pakistan")({
  head: () => guideSeo({ title: TITLE, description: DESCRIPTION, path: PATH }),
  component: Page,
});

function Page() {
  const url = canonicalUrl(PATH);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }, { name: "House vs Flat vs Portion", path: PATH }])} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: "House vs flat vs portion for rent in Pakistan: which suits you?", description: DESCRIPTION, inLanguage: "en-PK", mainEntityOfPage: url, url, author: { "@type": "Organization", name: APP_NAME, url: PUBLIC_SITE_ORIGIN + "/" }, publisher: { "@type": "Organization", name: APP_NAME, url: PUBLIC_SITE_ORIGIN + "/" } }} />
      <LegalPage eyebrow="RENTING IN PAKISTAN" title="House vs flat vs portion for rent in Pakistan: which suits you?" updated="3 October 2026">
        <p>The right property type depends on household size, privacy, budget, parking, building or society rules and how much maintenance you want to handle. Compare the whole living arrangement rather than only the advertised rent.</p>
        <h2>House</h2>
        <p>A house can provide more private space, outdoor or parking space and control over the immediate property. It may also involve a higher rent and more responsibility for utilities, security, maintenance or access arrangements.</p>
        <h2>Portion</h2>
        <p>A portion can provide some of the space and privacy of a house at a different price point. Before renting, confirm which entrance, parking, utilities, roof or outdoor areas are included and how shared areas are managed.</p>
        <h2>Flat or apartment</h2>
        <p>A flat can be practical for households that prefer building-based accommodation, shared security or facilities. Ask about maintenance charges, lift operation, backup power, parking and building rules in addition to rent.</p>
        <h2>How to compare them</h2>
        <ul>
          <li><strong>Privacy:</strong> identify shared entrances, walls, stairs and outdoor areas.</li>
          <li><strong>Total cost:</strong> include maintenance, utilities, parking and recurring charges.</li>
          <li><strong>Space:</strong> compare bedrooms, bathrooms and covered area where available.</li>
          <li><strong>Parking:</strong> confirm whether a dedicated space is actually included.</li>
          <li><strong>Rules:</strong> ask about pets, guests, business use, occupancy and other restrictions.</li>
          <li><strong>Maintenance:</strong> establish who handles ordinary and major repairs.</li>
        </ul>
        <h2>Find the right property type</h2>
        <p>Start with <Link className="font-semibold text-forest no-underline hover:underline" to="/rent">rental properties in Pakistan</Link>, then narrow by city, area and property type. Apna Ghar's live results are the useful source for current availability.</p>
        <section className="mt-10 rounded-xl border border-line bg-cream p-5">
          <h2 className="mt-0! text-xl!">Before you pay</h2>
          <p>Visit the actual property, verify the advertiser's authority, inspect the premises and read the written agreement. See <Link className="font-semibold text-forest no-underline hover:underline" to="/safety">rental safety guidance</Link> for payment and fraud precautions.</p>
        </section>
      </LegalPage>
    </>
  );
}

import { Link, createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/legal-page";
import { JsonLd } from "@/components/seo/json-ld";
import { APP_NAME, PUBLIC_SITE_ORIGIN } from "@/lib/constants";
import { breadcrumbJsonLd, canonicalUrl, guideSeo, GUIDES_DESCRIPTION, GUIDES_PATH, GUIDES_TITLE } from "@/lib/seo";

export const Route = createFileRoute("/guides/")({
  head: () => guideSeo({ title: GUIDES_TITLE, description: GUIDES_DESCRIPTION, path: GUIDES_PATH }),
  component: Page,
});

const groups = [
  {
    title: "Renting",
    description: "Practical help for finding, checking and renting a home in Pakistan.",
    links: [
      { label: "How to Rent a House in Pakistan", to: "/how-to-rent-a-house-in-pakistan" },
      { label: "Rental Safety Checks", to: "/safety" },
    ],
  },
  {
    title: "City guides",
    description: "Location-focused housing information connected to live Apna Ghar inventory.",
    links: [
      { label: "Rawalpindi Property & Rental Guide", to: "/guides/cities/rawalpindi" },
      { label: "Lahore Property & Rental Guide", to: "/guides/cities/lahore" },
      { label: "Karachi Property & Rental Guide", to: "/guides/cities/karachi" },
    ],
  },
  {
    title: "Buying",
    description: "Legal and practical guidance for checking property documents, sale agreements, registration and Punjab land records.",
    links: [
      { label: "Property Buying Due Diligence in Pakistan", to: "/guides/buying/property-buying-due-diligence-pakistan" },
      { label: "Fard, Registry and Intiqal in Punjab", to: "/guides/buying/fard-registry-intiqal-punjab" },
      { label: "Sale Agreement and Property Registration", to: "/guides/buying/sale-agreement-registration-pakistan" },
    ],
  },
  {
    title: "Landlords",
    description: "Practical and legal guidance for owners preparing, documenting and managing rental properties.",
    links: [
      { label: "Rental Agreement Legal Checklist", to: "/guides/landlords/rental-agreement-legal-checklist" },
      { label: "Landlord Responsibilities in Pakistan", to: "/guides/landlords/landlord-responsibilities-pakistan" },
      { label: "Security Deposit, Advance Rent and Rent Terms", to: "/guides/landlords/security-deposit-rent-terms-pakistan" },
    ],
  },
];

function Page() {
  const url = canonicalUrl(GUIDES_PATH);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Guides", path: GUIDES_PATH }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: GUIDES_TITLE,
          description: GUIDES_DESCRIPTION,
          url,
          inLanguage: "en-PK",
          publisher: { "@type": "Organization", name: APP_NAME, url: PUBLIC_SITE_ORIGIN + "/" },
        }}
      />
      <LegalPage eyebrow="PROPERTY & RENTAL GUIDES" title="Property & Rental Guides in Pakistan">
        <p>
          Practical information for renters, property owners and people researching the Pakistan property market.
          These guides are designed to answer useful questions, explain practical and legal considerations, and connect you with live Apna Ghar property listings.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <section key={group.title} className="rounded-xl border border-line bg-cream p-5">
              <h2 className="mt-0! text-xl!">{group.title}</h2>
              <p className="mt-2">{group.description}</p>
              {group.links.length > 0 ? (
                <ul className="mt-4 space-y-2! ps-0! list-none!">
                  {group.links.map((link) => (
                    <li key={link.to} className="my-0!">
                      <Link className="font-semibold text-forest no-underline hover:underline" to={link.to as never}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
        <section className="mt-10 rounded-xl border border-line p-5">
          <h2 className="mt-0! text-xl!">Looking for a property now?</h2>
          <p>
            Guides are useful for research, but current availability changes. Browse{" "}
            <Link className="font-semibold text-forest no-underline hover:underline" to="/rent">
              homes for rent
            </Link>{" "}
            or{" "}
            <Link className="font-semibold text-forest no-underline hover:underline" to="/sale">
              properties for sale
            </Link>{" "}
            on Apna Ghar.
          </p>
        </section>
      </LegalPage>
    </>
  );
}

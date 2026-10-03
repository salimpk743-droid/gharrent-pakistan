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
    title: "Find a home by city",
    description: "Where to look, what to check and the local registration rules, linked to live Apna Ghar listings.",
    links: [
      { label: "House for rent in Lahore", to: "/guides/cities/lahore" },
      { label: "How to find a flat for rent in Karachi", to: "/guides/cities/karachi" },
      { label: "House for rent in Rawalpindi", to: "/guides/cities/rawalpindi" },
    ],
  },
  {
    title: "Renting",
    description: "Practical and legal steps for tenants, from the search to the agreement and police registration.",
    links: [
      { label: "How to rent a house in Pakistan", to: "/how-to-rent-a-house-in-pakistan" },
      { label: "Rent agreement format in Pakistan", to: "/guides/rent-agreement-format-pakistan" },
      { label: "Tenant registration with Punjab Police", to: "/guides/tenant-registration-punjab-police" },
      { label: "Cost of renting a house in Pakistan", to: "/guides/renting/rental-budget-and-costs-pakistan" },
      { label: "House vs flat vs portion", to: "/guides/renting/house-vs-flat-vs-portion-pakistan" },
      { label: "Safety checks before you pay", to: "/safety" },
    ],
  },
  {
    title: "Landlords",
    description: "For owners renting out a house, portion or flat.",
    links: [
      { label: "How to rent out your house in Pakistan", to: "/guides/how-to-rent-out-your-house-in-pakistan" },
      { label: "Landlord responsibilities in Pakistan", to: "/guides/landlords/landlord-responsibilities-pakistan" },
      { label: "Security deposit and advance rent", to: "/guides/landlords/security-deposit-rent-terms-pakistan" },
      { label: "Post your property free", to: "/post" },
    ],
  },
  {
    title: "Buying",
    description: "The buying process, document checks, sale agreements, Punjab land records and taxes.",
    links: [
      { label: "How to buy property in Pakistan", to: "/guides/buying/how-to-buy-property-in-pakistan" },
      { label: "How to verify property documents", to: "/guides/buying/property-buying-due-diligence-pakistan" },
      { label: "Sale agreement, token money and registration", to: "/guides/buying/sale-agreement-registration-pakistan" },
      { label: "Fard, registry and intiqal in Punjab", to: "/guides/buying/fard-registry-intiqal-punjab" },
      { label: "Property tax on buying and selling (2026-27)", to: "/guides/property-tax-on-buying-and-selling-property-pakistan" },
    ],
  },
  {
    title: "Low-budget homes: reported prices",
    description: "Reported 2026 asking ranges, each labelled by its source. They are not quotes.",
    links: [
      { label: "Cheap house for rent in Lahore", to: "/guides/where-can-i-rent-an-affordable-home-in-lahore" },
      { label: "Cheap flat for rent in Karachi", to: "/guides/where-can-i-rent-an-affordable-home-in-karachi" },
      { label: "Cheap house or portion for rent in Islamabad", to: "/guides/where-can-i-rent-an-affordable-home-in-islamabad" },
      { label: "Cheap house for rent in Rawalpindi", to: "/guides/where-can-i-rent-an-affordable-home-in-rawalpindi" },
      { label: "Affordable homes for rent in Pakistan", to: "/guides/where-can-i-rent-an-affordable-home-in-pakistan" },
      { label: "Cheap house for sale in Lahore", to: "/guides/where-can-i-buy-an-affordable-home-in-lahore" },
      { label: "Cheap house for sale in Karachi", to: "/guides/where-can-i-buy-an-affordable-home-in-karachi" },
      { label: "Cheap house for sale in Islamabad", to: "/guides/where-can-i-buy-an-affordable-home-in-islamabad" },
      { label: "Cheap house for sale in Rawalpindi", to: "/guides/where-can-i-buy-an-affordable-home-in-rawalpindi" },
      { label: "Affordable houses for sale in Pakistan", to: "/guides/where-can-i-buy-an-affordable-home-in-pakistan" },
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
      <LegalPage eyebrow="PROPERTY & RENTAL GUIDES" title="Property and rental guides for Pakistan" updated="3 October 2026">
        <p>
          Practical information for renters, property owners and people researching the Pakistan property market.
          These guides answer common rent and sale questions with sourced figures, then connect you to live Apna Ghar
          listings when a landlord has published one.
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
            on Apna Ghar. Have a property?{" "}
            <Link className="font-semibold text-forest no-underline hover:underline" to="/post">
              Post it free
            </Link>
            .
          </p>
        </section>
      </LegalPage>
    </>
  );
}

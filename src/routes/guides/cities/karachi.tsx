import { Link, createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/legal-page";
import { JsonLd } from "@/components/seo/json-ld";
import { APP_NAME, PUBLIC_SITE_ORIGIN } from "@/lib/constants";
import {
  KARACHI_GUIDE_DESCRIPTION,
  KARACHI_GUIDE_PATH,
  KARACHI_GUIDE_TITLE,
  breadcrumbJsonLd,
  canonicalUrl,
  guideSeo,
} from "@/lib/seo";

export const Route = createFileRoute("/guides/cities/karachi")({
  head: () =>
    guideSeo({
      title: KARACHI_GUIDE_TITLE,
      description: KARACHI_GUIDE_DESCRIPTION,
      path: KARACHI_GUIDE_PATH,
    }),
  component: Page,
});

const areaGuide = [
  {
    name: "DHA Karachi",
    details:
      "A large multi-phase market with houses, portions and apartments. When comparing listings, check the exact phase, block, road access, parking, building or society rules and the total monthly cost.",
  },
  {
    name: "Clifton",
    details:
      "An established central and coastal market with apartments, houses and portions. For apartments, ask about building maintenance, parking, lift, water, backup power and any building-specific charges.",
  },
  {
    name: "PECHS",
    details:
      "A mature central residential area where houses, portions and apartments can appear in the rental market. Commute time, parking and the condition of older buildings can materially change the practical value of a listing.",
  },
  {
    name: "Gulshan-e-Iqbal",
    details:
      "A large established residential area with houses and apartments and strong access to universities, hospitals, commercial areas and major roads. Compare the exact block and street rather than treating the whole area as one market.",
  },
  {
    name: "Gulistan-e-Johar",
    details:
      "A major residential market with a substantial apartment and house/portion supply. Check road access, water arrangements, parking, building condition and your daily route before deciding.",
  },
  {
    name: "North Nazimabad",
    details:
      "An established family-oriented residential market with houses, portions and apartments. Compare the immediate block, parking, water, electricity arrangements and access to work and schools.",
  },
  {
    name: "Nazimabad",
    details:
      "A long-established central residential area with houses, portions and apartments. Older construction can make inspection especially important: check plumbing, dampness, electrical condition, ventilation and common access.",
  },
  {
    name: "Federal B Area",
    details:
      "A large established residential area with a mix of houses, portions and apartments. Check the exact block, street condition, parking, water supply and commute before comparing rent.",
  },
  {
    name: "Gulshan-e-Maymar",
    details:
      "A planned suburban residential option with houses and apartment-style accommodation. Check the distance to your workplace, school or university, plus transport and daily shopping needs.",
  },
  {
    name: "Bahria Town Karachi",
    details:
      "A large planned gated-community market with houses and apartments. Compare the exact precinct, possession and current access to services, and ask about recurring community or maintenance charges.",
  },
  {
    name: "Scheme 33",
    details:
      "A broad collection of residential developments with different stages of development and housing stock. Verify the exact project, ownership or authority, utilities, access roads and development status rather than relying on the wider Scheme 33 label.",
  },
  {
    name: "Malir and Malir Cantonment",
    details:
      "A broad eastern market containing different residential environments and property types. Exact location matters for commute, security arrangements, water, utilities, road access and property documentation.",
  },
  {
    name: "Korangi and Landhi",
    details:
      "Established eastern and southeastern residential areas with varied housing stock. For renters, commute to industrial and employment areas, transport availability, utilities and the immediate street environment can be important.",
  },
  {
    name: "Saddar and central Karachi",
    details:
      "Central Karachi offers apartments and older residential stock close to major commercial and employment destinations. Inspect building condition, parking, noise, access and water arrangements carefully.",
  },
  {
    name: "DHA City Karachi",
    details:
      "A newer, farther-out planned market that should be assessed as a location in its own right. Before renting or buying, verify current occupancy, utilities, road access and the actual travel time to your regular destinations.",
  },
];

function Page() {
  const url = canonicalUrl(KARACHI_GUIDE_PATH);
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: "Karachi", path: KARACHI_GUIDE_PATH },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Karachi Property & Rental Guide",
          description: KARACHI_GUIDE_DESCRIPTION,
          inLanguage: "en-PK",
          datePublished: "2026-09-22",
          dateModified: "2026-09-22",
          mainEntityOfPage: url,
          url,
          author: { "@type": "Organization", name: APP_NAME, url: PUBLIC_SITE_ORIGIN + "/" },
          publisher: { "@type": "Organization", name: APP_NAME, url: PUBLIC_SITE_ORIGIN + "/" },
        }}
      />
      <LegalPage eyebrow="CITY PROPERTY GUIDE" title="Karachi Property & Rental Guide" updated="22 September 2026">
        <div className="rounded-lg border border-line bg-cream p-4 text-ink">
          This guide is practical property information, not legal or financial advice. Karachi is a very large and
          varied market, so area-level conditions, rents, availability and local requirements can change. Confirm
          current details before signing an agreement, paying money or buying property.
        </div>

        <p>
          Karachi needs a more detailed guide than a simple list of neighbourhoods. The city has major apartment,
          house and portion markets, established central areas, premium coastal districts and large planned
          developments. The right comparison depends on your budget, property type, commute, household needs and the
          condition of the specific building or house.
        </p>

        <h2>Find current rental properties in Karachi</h2>
        <p>
          Start with{" "}
          <Link to="/rent/$province/$district" params={{ province: "sindh", district: "karachi" }}>
            current Karachi rental listings
          </Link>
          . Use live listings to compare asking rents, property types, sizes and locations. Because Karachi inventory
          changes quickly, use the live results for current availability rather than relying on an old city-wide rent
          number.
        </p>

        <h2>How to read the Karachi property market</h2>
        <p>
          Karachi's residential market is unusually broad. Apartments are a major part of the market, while houses
          and portions are common across many established neighbourhoods. Current 2026 market guides describe large
          differences between DHA and Clifton, central areas such as PECHS and Gulshan-e-Iqbal, and newer or farther-out
          developments such as Bahria Town Karachi and parts of Scheme 33.
        </p>
        <p>
          Do not compare two listings only by headline rent or sale price. Compare the exact location, size, property
          type, building condition, parking, utilities, recurring charges and your daily travel time.
        </p>

        <h2>Karachi uses square yards extensively</h2>
        <p>
          Karachi listings commonly describe residential plots and houses in square yards (often written as sq yd or
          gaz), including 120, 240, 400, 500 and larger sizes. This differs from the Marla terminology used heavily in
          Lahore, Rawalpindi and Islamabad. Some market guides use approximate Marla equivalents, but unit conventions
          can vary, so confirm the advertised size and the actual covered area before comparing properties.
        </p>
        <ul>
          <li><strong>Plot size is not covered area.</strong> A 240 sq yd plot does not tell you the exact built-up area.</li>
          <li><strong>Ask for the actual layout.</strong> Bedrooms, bathrooms, floors, parking and open space can differ substantially.</li>
          <li><strong>For flats, ask for covered area and building facilities.</strong> A quoted size should be understood before comparing two apartments.</li>
        </ul>

        <h2>Major Karachi residential areas</h2>
        <p>
          The list below is designed as a research map, not a ranking. Each area contains multiple blocks, phases,
          projects and streets, so the immediate property can matter as much as the area name.
        </p>
        <div className="space-y-4">
          {areaGuide.map((area) => (
            <section key={area.name} className="rounded-xl border border-line bg-cream p-4">
              <h3 className="mt-0! text-lg!">{area.name}</h3>
              <p className="mb-0!">{area.details}</p>
            </section>
          ))}
        </div>

        <h2>Choose by daily life, not just by neighbourhood name</h2>
        <p>
          Karachi is geographically spread out, so commute planning deserves its own step. A property with a lower
          monthly rent can have a different total cost if it adds substantial daily travel, fuel, ride-hailing or
          transport time.
        </p>
        <ul>
          <li><strong>Work:</strong> map the actual office or business location and test the route at your normal travel time.</li>
          <li><strong>Schools and universities:</strong> check the daily route, not only straight-line distance.</li>
          <li><strong>Healthcare:</strong> identify the hospitals or clinics your household is likely to use.</li>
          <li><strong>Shopping:</strong> check ordinary grocery and pharmacy access as well as major commercial centres.</li>
          <li><strong>Transport:</strong> consider your own vehicle, public transport, ride-hailing and parking needs.</li>
          <li><strong>Weather and drainage:</strong> ask about the property's recent drainage experience and inspect signs of dampness or water damage.</li>
        </ul>

        <h2>Houses, portions and apartments</h2>
        <h3>Houses</h3>
        <p>
          For a house, inspect the roof and upper floors, water pressure, drainage, electrical system, gas
          arrangements, boundary and gates, parking, ventilation and signs of dampness. Ask which repairs are the
          landlord's responsibility and record existing damage before move-in.
        </p>

        <h3>Portions</h3>
        <p>
          A portion can offer more space than an apartment, but confirm exactly what is private and what is shared.
          Ask about the entrance, staircase, roof access, electricity and gas meters, water storage, parking, utility
          responsibilities and whether the portion has a separate written agreement.
        </p>

        <h3>Flats and apartments</h3>
        <p>
          Apartment costs can include maintenance, parking, generator or backup-power charges and other building
          expenses. Ask who controls the building, how maintenance is collected, how water is supplied, what parking
          comes with the unit and what rules apply to tenants. Current Karachi market reporting describes a deep
          apartment segment across both premium and mid-market areas.
        </p>

        <h2>What affects Karachi rent?</h2>
        <ul>
          <li>Exact area, phase, block, project and street.</li>
          <li>House, portion, apartment, room or other property type.</li>
          <li>Plot size, covered area, bedrooms and bathrooms.</li>
          <li>Furnished, semi-furnished or unfurnished condition.</li>
          <li>Age, renovation quality and building condition.</li>
          <li>Parking, security, lift, generator or backup power and water arrangements.</li>
          <li>Maintenance, society, building or community charges.</li>
          <li>Distance and practical travel time to work, education and commercial areas.</li>
          <li>Availability and competition for comparable properties at the time you search.</li>
        </ul>
        <p>
          Published 2026 rental guides show wide differences by property type and neighbourhood. Those figures are
          market snapshots, not guaranteed asking rents for a particular property, so compare them with current Apna
          Ghar listings before making a budget.
        </p>

        <h2>Buying property in Karachi: extra checks</h2>
        <p>
          Buyers need a deeper document and development check than renters. Confirm the seller's identity and authority,
          the property's ownership and title documents, applicable lease or allotment documentation, outstanding dues,
          building or society approvals where relevant, and whether there are disputes or encumbrances.
        </p>
        <p>
          For plots and newer developments, verify the exact project and development status rather than relying only on
          an agent's description or a broad area name. For apartments, review building documentation, maintenance
          liabilities and applicable building or society rules.
        </p>
        <p>
          Apna Ghar's{" "}
          <Link className="font-semibold text-forest no-underline hover:underline" to="/guides/buying/property-buying-due-diligence-pakistan">
            property buying due-diligence guide
          </Link>
          {" "}covers the general document and transaction checks to make before committing to a purchase.
        </p>

        <h2>Before renting in Karachi</h2>
        <ol>
          <li>Set a total monthly housing budget including recurring charges.</li>
          <li>Shortlist areas using your actual commute and household needs.</li>
          <li>Compare several current listings with similar property type and size.</li>
          <li>Visit the actual property and inspect utilities, drainage, ventilation, parking and existing damage.</li>
          <li>Ask who owns or is authorised to rent the property.</li>
          <li>Confirm rent, security deposit, advance rent, utilities, maintenance and repair responsibilities.</li>
          <li>Read the written agreement before signing and keep payment records.</li>
          <li>Photograph existing damage and record meter readings at handover.</li>
        </ol>
        <p>
          For the full process, see{" "}
          <Link className="font-semibold text-forest no-underline hover:underline" to="/how-to-rent-a-house-in-pakistan">
            How to Rent a House in Pakistan
          </Link>
          {" "}and{" "}
          <Link className="font-semibold text-forest no-underline hover:underline" to="/safety">
            Apna Ghar's safety guidance
          </Link>
          .
        </p>

        <h2>Karachi rental search checklist</h2>
        <ul>
          <li>Write down your maximum total monthly housing cost.</li>
          <li>Decide whether you need a house, portion, apartment or room.</li>
          <li>Use square yards and covered area consistently when comparing sizes.</li>
          <li>Check the exact phase, block, project or street.</li>
          <li>Test the commute at the time you normally travel.</li>
          <li>Ask about water, electricity, gas, drainage and backup-power arrangements.</li>
          <li>For apartments, confirm maintenance, parking, lift and building rules.</li>
          <li>Do not pay a substantial amount before seeing the actual property and confirming the advertiser's authority.</li>
          <li>Put rent, deposit, utilities and repair responsibilities in writing.</li>
        </ul>

        <section className="mt-10 rounded-xl border border-line bg-cream p-5">
          <h2 className="mt-0! text-xl!">Browse Karachi properties</h2>
          <p>
            Ready to compare current availability?{" "}
            <Link
              className="font-semibold text-forest no-underline hover:underline"
              to="/rent/$province/$district"
              params={{ province: "sindh", district: "karachi" }}
            >
              View Karachi rental listings
            </Link>
            .
          </p>
        </section>
      </LegalPage>
    </>
  );
}

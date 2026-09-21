import { Link, createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/legal-page";
import { JsonLd } from "@/components/seo/json-ld";
import { APP_NAME, PUBLIC_SITE_ORIGIN } from "@/lib/constants";
import { breadcrumbJsonLd, canonicalUrl, guideSeo } from "@/lib/seo";

const PATH = "/guides/landlords/landlord-responsibilities-pakistan";
const TITLE = "Landlord Responsibilities for Rental Property in Pakistan | Apna Ghar";
const DESCRIPTION =
  "Practical landlord guidance on repairs, utilities, access, tenant records and rental-property responsibilities, with Punjab and Islamabad legal references.";

export const Route = createFileRoute("/guides/landlords/landlord-responsibilities-pakistan")({
  head: () => guideSeo({ title: TITLE, description: DESCRIPTION, path: PATH }),
  component: Page,
});

function Page() {
  const url = canonicalUrl(PATH);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", path: "/guides" },
        { name: "Guides", path: "/guides" },
        { name: "Landlords", path: "/guides" },
        { name: "Landlord Responsibilities", path: PATH },
      ])} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Landlord Responsibilities for Rental Property in Pakistan",
        description: DESCRIPTION,
        inLanguage: "en-PK",
        datePublished: "2026-09-22",
        dateModified: "2026-09-22",
        mainEntityOfPage: url,
        url,
        author: { "@type": "Organization", name: APP_NAME, url: PUBLIC_SITE_ORIGIN + "/" },
        publisher: { "@type": "Organization", name: APP_NAME, url: PUBLIC_SITE_ORIGIN + "/" },
      }} />
      <LegalPage eyebrow="LANDLORD GUIDE" title="Landlord Responsibilities for Rental Property in Pakistan" updated="22 September 2026">
        <div className="rounded-lg border border-line bg-cream p-4 text-ink">
          This guide gives general information. Exact duties depend on the applicable provincial or territorial law,
          the tenancy agreement and the property itself.
        </div>

        <h2>Keep the property usable</h2>
        <p>
          A landlord should distinguish ordinary tenant housekeeping from repairs that are part of keeping the
          premises usable. Put the division of responsibility in the agreement, but do not assume a contract can remove
          a mandatory statutory duty.
        </p>

        <h2>Punjab: statutory obligations</h2>
        <p>
          The Punjab Rented Premises Act, 2009 states that, subject to the tenancy agreement, a landlord must repair
          the premises as necessary to keep it in habitable condition or as required by law. It also addresses
          utilities and amenities and restricts entry without reasonable notice.
        </p>
        <p>
          The same Act gives the tenant a route to seek an order from the Rent Tribunal if a landlord fails to fulfil
          an obligation under the Act or tenancy agreement.
        </p>

        <h2>Islamabad: check the ICT rules</h2>
        <p>
          The Islamabad Rent Restriction Ordinance, 2001 contains provisions on interference with amenities and
          necessary repairs, as well as the relationship between landlord and tenant. For an Islamabad property, use
          the current official ordinance rather than applying a Punjab rule by assumption.
        </p>

        <h2>Access and privacy</h2>
        <p>
          A practical agreement should explain when the landlord or a contractor may need access for inspection or
          repair. In Punjab, the Rented Premises Act expressly addresses landlord entry and requires reasonable notice
          subject to its terms.
        </p>

        <h2>Keep records</h2>
        <ul>
          <li>Signed tenancy agreement and any registration record.</li>
          <li>Rent receipts and security-deposit records.</li>
          <li>Repair requests and when they were resolved.</li>
          <li>Utility and meter information where relevant.</li>
          <li>Handover photos, inventory and keys / remotes issued.</li>
        </ul>

        <h2>Before advertising</h2>
        <ul>
          <li>Confirm you have authority to rent the property.</li>
          <li>Write down the rent, deposit, utilities and basic property rules.</li>
          <li>Photograph the property accurately and disclose material issues you know about.</li>
          <li>Decide which repairs are urgent and how tenants should report them.</li>
          <li>Prepare a written tenancy agreement before taking possession-related payments.</li>
        </ul>

        <h2>References</h2>
        <ul>
          <li><a href="https://pakistancode.gov.pk/pdffiles/administratorf1b125f14a9e5a6bdd4ea885926304c4.pdf">Pakistan Code — Islamabad Rent Restriction Ordinance, 2001</a></li>
          <li><a href="https://www.punjabcode.punjab.gov.pk/">Punjab Code — Punjab laws portal</a></li>
        </ul>

        <p className="mt-8">
          <Link to="/post">List your property on Apna Ghar</Link> after preparing the property information and
          documents.
        </p>
      </LegalPage>
    </>
  );
}

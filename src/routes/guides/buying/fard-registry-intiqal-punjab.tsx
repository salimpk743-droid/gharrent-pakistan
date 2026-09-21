import { Link, createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/legal-page";
import { JsonLd } from "@/components/seo/json-ld";
import { APP_NAME, PUBLIC_SITE_ORIGIN } from "@/lib/constants";
import { breadcrumbJsonLd, canonicalUrl, guideSeo } from "@/lib/seo";

const PATH = "/guides/buying/fard-registry-intiqal-punjab";
const TITLE = "Fard, Registry and Intiqal in Punjab Explained | Apna Ghar";
const DESCRIPTION =
  "Understand Fard, Registry and Intiqal in Punjab, what each record is used for, how to verify documents and what buyers should check before purchasing property.";

export const Route = createFileRoute("/guides/buying/fard-registry-intiqal-punjab")({
  head: () => guideSeo({ title: TITLE, description: DESCRIPTION, path: PATH }),
  component: Page,
});

function Page() {
  const url = canonicalUrl(PATH);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Guides", path: "/guides" },
        { name: "Buying", path: "/guides" },
        { name: "Fard, Registry and Intiqal", path: PATH },
      ])} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Fard, Registry and Intiqal in Punjab Explained",
        description: DESCRIPTION,
        inLanguage: "en-PK",
        datePublished: "2026-09-22",
        dateModified: "2026-09-22",
        mainEntityOfPage: url,
        url,
        author: { "@type": "Organization", name: APP_NAME, url: PUBLIC_SITE_ORIGIN + "/" },
        publisher: { "@type": "Organization", name: APP_NAME, url: PUBLIC_SITE_ORIGIN + "/" },
      }} />
      <LegalPage eyebrow="BUYING • PUNJAB" title="Fard, Registry and Intiqal in Punjab Explained" updated="22 September 2026">
        <div className="rounded-lg border border-line bg-cream p-4 text-ink">
          This guide is about Punjab land records. It is general information, not legal advice. Procedures and
          records can change, and a housing society or development authority may have additional requirements.
        </div>

        <h2>Fard</h2>
        <p>
          PLRA describes a Fard as an official document containing land information such as area, location and
          ownership details. Buyers commonly ask for a current Fard when checking a property before purchase.
        </p>
        <p>
          PLRA says a Fard can be obtained through an Arazi Record Center, its online service and other authorised
          service points. Keep the issued document and use PLRA's verification facility where available.
        </p>

        <h2>Registry</h2>
        <p>
          A registry is part of the formal registration record for a property transaction. PLRA's current guidance
          describes the registration process as involving an e-stamp challan and applicable payments, submission of
          the deed and verification before the Sub-Registrar, followed by issuance of the registered document.
        </p>
        <p>
          The exact fees and process can change. Check the current PLRA service information rather than relying on an
          old fee table from a dealer or social-media post.
        </p>

        <h2>Intiqal / mutation</h2>
        <p>
          PLRA describes mutation (Intiqal) as the process of officially transferring land ownership in government
          records after events such as sale, inheritance or a court order. The mutation record is therefore different
          from the deed itself.
        </p>

        <h2>How the three fit together</h2>
        <ol>
          <li>Use ownership and land records to understand who is recorded against the property.</li>
          <li>Review the transaction and registered deed documents that establish or evidence the transfer.</li>
          <li>Confirm that the relevant mutation / ownership record has been updated after the transaction.</li>
        </ol>
        <p>
          The documents should tell a consistent story. If names, areas, plot numbers, shares or boundaries do not
          match, pause the transaction and get the discrepancy explained before paying more money.
        </p>

        <h2>How to verify before buying</h2>
        <ul>
          <li>Obtain the current record from the official PLRA channel where the property is covered.</li>
          <li>Use the official verification service for Fard or mutation documents when available.</li>
          <li>Compare the record with the seller's CNIC and the registered documents.</li>
          <li>Check whether there are co-owners, inheritance issues, court matters or restrictions.</li>
          <li>For society or authority property, also verify the allotment / transfer record with the relevant authority.</li>
        </ul>

        <h2>Official Punjab references</h2>
        <ul>
          <li><a href="https://www.punjab-zameen.gov.pk/fardInfo">PLRA — Fard information</a></li>
          <li><a href="https://www.punjab-zameen.gov.pk/registryInfo">PLRA — Registry information</a></li>
          <li><a href="https://www.punjab-zameen.gov.pk/mutationsInfo">PLRA — Mutation / Intiqal information</a></li>
          <li><a href="https://onlinefard.punjab-zameen.gov.pk/verifydocument">PLRA — Document verification</a></li>
        </ul>

        <p className="mt-8">
          <Link to="/sale">Browse properties for sale</Link> on Apna Ghar, but complete independent document checks
          before committing to a purchase.
        </p>
      </LegalPage>
    </>
  );
}

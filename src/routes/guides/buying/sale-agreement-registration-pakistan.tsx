import { Link, createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/legal-page";
import { JsonLd } from "@/components/seo/json-ld";
import { APP_NAME, PUBLIC_SITE_ORIGIN } from "@/lib/constants";
import { breadcrumbJsonLd, canonicalUrl, guideSeo } from "@/lib/seo";

const PATH = "/guides/buying/sale-agreement-registration-pakistan";
const TITLE = "Sale Agreement and Property Registration in Pakistan | Apna Ghar";
const DESCRIPTION =
  "A practical guide to sale agreements, token money, registration and transfer when buying property in Pakistan, with official legal references.";

export const Route = createFileRoute("/guides/buying/sale-agreement-registration-pakistan")({
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
        { name: "Sale Agreement & Registration", path: PATH },
      ])} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Sale Agreement and Property Registration in Pakistan",
        description: DESCRIPTION,
        inLanguage: "en-PK",
        datePublished: "2026-09-22",
        dateModified: "2026-09-22",
        mainEntityOfPage: url,
        url,
        author: { "@type": "Organization", name: APP_NAME, url: PUBLIC_SITE_ORIGIN + "/" },
        publisher: { "@type": "Organization", name: APP_NAME, url: PUBLIC_SITE_ORIGIN + "/" },
      }} />
      <LegalPage eyebrow="BUYING GUIDE" title="Sale Agreement and Property Registration in Pakistan" updated="22 September 2026">
        <div className="rounded-lg border border-line bg-cream p-4 text-ink">
          This is general property information, not a substitute for legal advice. The required documents, taxes,
          registration process and authority can vary by province, territory, development authority and housing scheme.
        </div>

        <h2>What a sale agreement does</h2>
        <p>
          A sale agreement records the terms on which the parties intend to complete a property sale. It should identify
          the parties and property and make the price, payment schedule and completion obligations clear.
        </p>
        <p>
          The Transfer of Property Act, 1882 states that a contract for the sale of immovable property does not, by
          itself, create an interest or charge in the property. That is an important distinction: a signed agreement is
          not automatically the same thing as completed title transfer.
        </p>

        <h2>What to put in writing</h2>
        <ul>
          <li>Full names and identification details of the parties.</li>
          <li>Property address, plot / unit number and relevant title or allotment references.</li>
          <li>Total sale price and each payment milestone.</li>
          <li>Token money / bayana amount and the exact consequences of cancellation.</li>
          <li>Date and conditions for possession.</li>
          <li>Which party is responsible for taxes, fees, transfer charges and registration expenses.</li>
          <li>Documents the seller must provide before completion.</li>
          <li>How defects in title, failed approvals or other discovered problems will be handled.</li>
          <li>What happens if either party fails to complete.</li>
        </ul>

        <h2>Token money and bayana</h2>
        <p>
          There is no safe universal sentence such as “bayana is always refundable” or “bayana is always forfeited.”
          The result can depend on the written agreement, the reason for non-completion and applicable law. Put the
          refund or forfeiture terms in writing before paying.
        </p>
        <p>
          Use a traceable payment method where possible and obtain a signed receipt that identifies the property,
          amount, date and parties.
        </p>

        <h2>Registration and transfer</h2>
        <p>
          The Registration Act, 1908 contains rules concerning registration of documents relating to immovable property.
          The Transfer of Property Act also sets rules for transfers of immovable property. The exact procedure used by
          a buyer can depend on the relevant land-record authority and jurisdiction.
        </p>
        <p>
          In Islamabad, for example, the ICT Administration publishes separate procedures for registration of a deed
          and transfer / sanction of mutation. In Punjab, PLRA publishes its current registry and mutation procedures.
        </p>

        <h2>Do not skip the final records</h2>
        <p>
          After completion, keep the registered deed and confirm that the relevant ownership / mutation record has been
          updated. For society or authority property, also obtain the transfer or allotment record required by that body.
        </p>

        <h2>Useful official references</h2>
        <ul>
          <li><a href="https://pakistancode.gov.pk/pdffiles/administrator77923ce792b475e339e1f46ba0442da3.pdf">Pakistan Code — Transfer of Property Act, 1882</a></li>
          <li><a href="https://pakistancode.gov.pk/pdffiles/administrator0f29bc9f1e3dfed37c0034eed1e29d53.pdf">Pakistan Code — Registration Act, 1908</a></li>
          <li><a href="https://ictadministration.gov.pk/registration-of-deed/">ICT Administration — Registration of Deed</a></li>
          <li><a href="https://ictadministration.gov.pk/transfer-of-land-sanction-of-mutation/">ICT Administration — Transfer of Land / Mutation</a></li>
          <li><a href="https://www.punjab-zameen.gov.pk/registryInfo">PLRA — Registry</a></li>
        </ul>

        <p className="mt-8">
          <Link to="/sale">Search properties for sale</Link> on Apna Ghar, then verify the documents independently.
        </p>
      </LegalPage>
    </>
  );
}

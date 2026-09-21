import { Link, createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/legal-page";
import { JsonLd } from "@/components/seo/json-ld";
import { APP_NAME, PUBLIC_SITE_ORIGIN } from "@/lib/constants";
import { breadcrumbJsonLd, canonicalUrl, guideSeo } from "@/lib/seo";

const PATH = "/guides/buying/property-buying-due-diligence-pakistan";
const TITLE = "Property Buying Due Diligence in Pakistan | Apna Ghar";
const DESCRIPTION =
  "A practical legal and document checklist for buying property in Pakistan, including ownership records, title documents, seller identity, encumbrances, registration and payment records.";

export const Route = createFileRoute("/guides/buying/property-buying-due-diligence-pakistan")({
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
        { name: "Property Buying Due Diligence", path: PATH },
      ])} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Property Buying Due Diligence in Pakistan",
        description: DESCRIPTION,
        inLanguage: "en-PK",
        datePublished: "2026-09-22",
        dateModified: "2026-09-22",
        mainEntityOfPage: url,
        url,
        author: { "@type": "Organization", name: APP_NAME, url: PUBLIC_SITE_ORIGIN + "/" },
        publisher: { "@type": "Organization", name: APP_NAME, url: PUBLIC_SITE_ORIGIN + "/" },
      }} />
      <LegalPage eyebrow="BUYING GUIDE" title="Property Buying Due Diligence in Pakistan" updated="22 September 2026">
        <div className="rounded-lg border border-line bg-cream p-4 text-ink">
          This is general information, not legal advice. Property law, land records, taxes, development-authority
          rules and registration procedures can differ by province, territory, housing scheme and property type.
          For a high-value transaction, have the documents reviewed by a qualified local lawyer or conveyancing
          professional before you pay substantial money.
        </div>

        <p>
          A property advertisement is a starting point, not proof of ownership. Before buying, verify the seller,
          the property record, the authority to sell, outstanding claims and the documents that will transfer the
          interest to you.
        </p>

        <h2>1. Confirm who is selling</h2>
        <ul>
          <li>Match the seller's name and CNIC details with the ownership documents.</li>
          <li>If an attorney, relative, dealer or company representative is acting for the owner, ask for the document that gives them authority to act.</li>
          <li>For inherited property, ask how the seller acquired title and whether the relevant succession and revenue records have been completed.</li>
          <li>Do not treat a marketplace listing, WhatsApp conversation or photocopy as proof of title.</li>
        </ul>

        <h2>2. Check the ownership record</h2>
        <p>
          The exact record depends on the jurisdiction. In Punjab, the Punjab Land Records Authority (PLRA) provides
          Fard services and online verification for Fard and mutation records. Use the official land-record service
          rather than relying only on a document supplied by the seller.
        </p>
        <p>
          A Fard can provide land details including ownership information. PLRA also provides a verification service
          for Fard and mutation records. These records should be checked against the property documents and the
          identity of the person selling.
        </p>

        <h2>3. Understand Fard, registry and Intiqal in Punjab</h2>
        <ul>
          <li><strong>Fard</strong> is an official land-record document used to show recorded land information and ownership details.</li>
          <li><strong>Registry</strong> records the registered property transaction or deed through the registration process.</li>
          <li><strong>Intiqal / mutation</strong> records a change in the revenue land record following a transaction or another recognised event.</li>
        </ul>
        <p>
          These documents serve different purposes. Do not assume that seeing one document alone proves that every
          part of a transaction is clear. Check the chain of title and whether the records agree.
        </p>

        <h2>4. Check for restrictions, charges and disputes</h2>
        <p>Ask specifically whether the property is subject to:</p>
        <ul>
          <li>a mortgage, charge or other encumbrance</li>
          <li>a court or revenue dispute</li>
          <li>an inheritance claim or co-owner who has not joined the transaction</li>
          <li>a development-authority or housing-society restriction</li>
          <li>an outstanding utility, tax, society or other property-related liability</li>
        </ul>
        <p>
          The seller should disclose material defects in the property or title and produce title documents in their
          possession when required by the applicable law or contract. Section 55 of the Transfer of Property Act,
          1882 sets out important default rights and liabilities of buyer and seller, subject to the law and the
          parties' contract.
        </p>

        <h2>5. Inspect the actual property</h2>
        <ul>
          <li>Match the address, plot or property number and physical boundaries with the documents.</li>
          <li>Check access, possession, construction and visible boundary issues.</li>
          <li>Ask whether any portion is occupied by a tenant or another person.</li>
          <li>For a house or building, check approvals or completion documents where the relevant authority requires them.</li>
        </ul>

        <h2>6. Put the commercial terms in writing</h2>
        <p>
          A sale agreement should clearly identify the parties and property and state the price, payment schedule,
          possession terms, completion obligations and what happens if a party fails to perform. Be especially careful
          with token money or bayana: the consequences of cancellation, refund, forfeiture or double payment depend on
          the actual agreement and applicable law.
        </p>

        <h2>7. Do not confuse a sale agreement with completed transfer</h2>
        <p>
          Under the Transfer of Property Act, 1882, a contract for sale of immovable property does not by itself
          create an interest or charge in the property. The Act also sets rules concerning how a sale of tangible
          immovable property is made. Registration requirements can also apply under the Registration Act, 1908 and
          local law.
        </p>
        <p>
          In practical terms, signing an agreement and paying money should not be treated as the same thing as
          completing the legally required transfer and registration steps.
        </p>

        <h2>8. Keep a complete transaction file</h2>
        <ul>
          <li>Copies of seller and buyer identification documents.</li>
          <li>Fard, registry, mutation and other title records that apply.</li>
          <li>Sale agreement and receipts for every payment.</li>
          <li>Bank transfer evidence rather than cash-only records where possible.</li>
          <li>NOCs, approvals or society documents where applicable.</li>
          <li>Final registered deed and updated ownership record after completion.</li>
        </ul>

        <h2>Before you pay: quick checklist</h2>
        <ul>
          <li>Seller identity matches the ownership record.</li>
          <li>Authority to sell is clear for every owner or representative involved.</li>
          <li>Land record and title documents have been independently checked.</li>
          <li>Outstanding claims, mortgages and disputes have been investigated.</li>
          <li>Property identity and physical possession match the documents.</li>
          <li>Sale agreement explains price, payment, possession and default terms.</li>
          <li>Registration, taxes and transfer steps are confirmed for the relevant jurisdiction.</li>
        </ul>

        <h2>Official references</h2>
        <ul>
          <li><a href="https://pakistancode.gov.pk/english/UY2FqaJw2-apaUY2Fqa-bpk%3D-con-563-sg-jjjjjjjjjjjjj">Pakistan Code — Transfer of Property Act, 1882</a></li>
          <li><a href="https://pakistancode.gov.pk/english/UY2FqaJw1-apaUY2Fqa-apeU-con-993-sg-jjjjjjjjjjjjj">Pakistan Code — Registration Act, 1908</a></li>
          <li><a href="https://www.punjab-zameen.gov.pk/fardInfo">Punjab Land Records Authority — Fard</a></li>
          <li><a href="https://onlinefard.punjab-zameen.gov.pk/verifydocument">PLRA — Verify Fard / Mutation</a></li>
        </ul>

        <p className="mt-8">
          Looking for properties? <Link to="/sale">Browse properties for sale on Apna Ghar</Link>.
        </p>
      </LegalPage>
    </>
  );
}

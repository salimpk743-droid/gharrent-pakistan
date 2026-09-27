import { Link, createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/legal-page";
import { JsonLd } from "@/components/seo/json-ld";
import { APP_NAME, PUBLIC_SITE_ORIGIN } from "@/lib/constants";
import { breadcrumbJsonLd, canonicalUrl, guideSeo } from "@/lib/seo";

const PATH = "/guides/buying/how-to-buy-property-in-pakistan";
const TITLE = "How to Buy Property in Pakistan: Practical Checklist | Apna Ghar";
const DESCRIPTION = "A practical property-buying checklist for Pakistan covering search, title and document checks, agreement, payment, registration and handover.";

export const Route = createFileRoute("/guides/buying/how-to-buy-property-in-pakistan")({
  head: () => guideSeo({ title: TITLE, description: DESCRIPTION, path: PATH }),
  component: Page,
});

function Page() {
  const url = canonicalUrl(PATH);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }, { name: "How to Buy Property", path: PATH }])} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: TITLE, description: DESCRIPTION, inLanguage: "en-PK", mainEntityOfPage: url, url, author: { "@type": "Organization", name: APP_NAME, url: PUBLIC_SITE_ORIGIN + "/" }, publisher: { "@type": "Organization", name: APP_NAME, url: PUBLIC_SITE_ORIGIN + "/" } }} />
      <LegalPage eyebrow="BUYING PROPERTY IN PAKISTAN" title="How to Buy Property in Pakistan: Practical Checklist">
        <div className="rounded-lg border border-line bg-cream p-4 text-ink">This is general information, not legal or financial advice. Property law, taxes, fees and registration procedures can differ by province, authority and transaction, so obtain professional advice for a specific purchase.</div>
        <h2>1. Define the purchase</h2>
        <p>Decide whether you are looking for a house, apartment, plot, commercial property or another type. Set a realistic budget that includes transaction costs, taxes or fees and any immediate work the property needs.</p>
        <p>Browse <Link className="font-semibold text-forest no-underline hover:underline" to="/sale">properties for sale in Pakistan</Link> and narrow the search by city, area, type, size and budget.</p>
        <h2>2. Inspect the actual property</h2>
        <p>Visit the property and compare the physical condition with the listing. Check access, boundaries, utilities, construction condition, parking and any visible defects. For a plot, verify the site and dimensions against the relevant documents.</p>
        <h2>3. Verify ownership and documents</h2>
        <p>Before committing significant money, establish who owns the property and whether the seller is authorised to sell it. Review the relevant title and land records, previous documents, identity information and any applicable approvals or permissions.</p>
        <p>For Punjab transactions, see <Link className="font-semibold text-forest no-underline hover:underline" to="/guides/buying/fard-registry-intiqal-punjab">Fard, Registry and Intiqal in Punjab</Link>. For a broader checklist, see <Link className="font-semibold text-forest no-underline hover:underline" to="/guides/buying/property-buying-due-diligence-pakistan">property buying due diligence</Link>.</p>
        <h2>4. Agree the transaction in writing</h2>
        <p>Make sure the agreed price, payment schedule, possession terms, included items, default provisions and other material terms are recorded in the appropriate written agreement. Do not rely on informal promises for material parts of a property transaction.</p>
        <h2>5. Complete the applicable transfer and registration steps</h2>
        <p>The exact process depends on the property, location and applicable authority. Confirm which transfer, registration, tax and record-updating steps apply before releasing the final payment.</p>
        <p>See <Link className="font-semibold text-forest no-underline hover:underline" to="/guides/buying/sale-agreement-registration-pakistan">sale agreement and property registration</Link> for related guidance.</p>
        <h2>6. Handover and records</h2>
        <p>At handover, document possession, keys, meters, fixtures and the condition of the property. Keep copies of agreements, receipts, transfer documents and relevant correspondence.</p>
        <h2>Buying checklist</h2>
        <ul>
          <li>Set a total purchase budget.</li>
          <li>Inspect the actual property or site.</li>
          <li>Verify ownership and seller authority.</li>
          <li>Review relevant land, title and approval records.</li>
          <li>Check for known encumbrances, disputes or outstanding dues where applicable.</li>
          <li>Record material terms in writing.</li>
          <li>Confirm applicable taxes, fees and registration requirements.</li>
          <li>Keep a complete transaction file.</li>
        </ul>
        <section className="mt-10 rounded-xl border border-line bg-cream p-5">
          <h2 className="mt-0! text-xl!">Browse current properties for sale</h2>
          <p>Use <Link className="font-semibold text-forest no-underline hover:underline" to="/sale">live sale listings</Link> for current inventory, then use the due-diligence guides before committing money.</p>
        </section>
      </LegalPage>
    </>
  );
}

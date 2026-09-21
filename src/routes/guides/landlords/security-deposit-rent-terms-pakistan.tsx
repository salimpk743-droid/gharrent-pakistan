import { Link, createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/legal-page";
import { JsonLd } from "@/components/seo/json-ld";
import { APP_NAME, PUBLIC_SITE_ORIGIN } from "@/lib/constants";
import { breadcrumbJsonLd, canonicalUrl, guideSeo } from "@/lib/seo";

const PATH = "/guides/landlords/security-deposit-rent-terms-pakistan";
const TITLE = "Security Deposit, Advance Rent and Rent Terms in Pakistan | Apna Ghar";
const DESCRIPTION =
  "What landlords and tenants should put in writing about security deposits, advance rent, rent increases, receipts and payment terms in Pakistan.";

export const Route = createFileRoute("/guides/landlords/security-deposit-rent-terms-pakistan")({
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
        { name: "Landlords", path: "/guides/landlords/rental-agreement-legal-checklist" },
        { name: "Security Deposit & Rent Terms", path: PATH },
      ])} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Security Deposit, Advance Rent and Rent Terms in Pakistan",
        description: DESCRIPTION,
        inLanguage: "en-PK",
        datePublished: "2026-09-22",
        dateModified: "2026-09-22",
        mainEntityOfPage: url,
        url,
        author: { "@type": "Organization", name: APP_NAME, url: PUBLIC_SITE_ORIGIN + "/" },
        publisher: { "@type": "Organization", name: APP_NAME, url: PUBLIC_SITE_ORIGIN + "/" },
      }} />
      <LegalPage eyebrow="LANDLORD • RENT TERMS" title="Security Deposit, Advance Rent and Rent Terms in Pakistan" updated="22 September 2026">
        <div className="rounded-lg border border-line bg-cream p-4 text-ink">
          Deposit and rent rules vary by jurisdiction and agreement. This guide deliberately avoids claiming one
          nationwide deposit limit or notice period. Check the law that applies to the property and put the agreed
          terms in writing.
        </div>

        <h2>Security deposit</h2>
        <p>
          State the exact amount of the deposit, the date it is paid and the conditions under which it will be returned
          or deductions may be made. A landlord should keep a record of the amount received and the property's condition
          at handover.
        </p>
        <p>
          Avoid vague language such as “deposit will be adjusted as necessary.” If deductions are possible, identify
          the categories that can lead to a deduction and keep supporting records.
        </p>

        <h2>Advance rent</h2>
        <p>
          If rent is paid in advance, record the amount, the months or period it covers and what happens if the tenancy
          ends before that period. In Punjab, the Rented Premises Act specifically lists advance rent, security and
          pagri among the particulars to be included in a tenancy agreement where applicable.
        </p>

        <h2>Rent increases</h2>
        <p>
          Do not copy a rent-increase percentage from another city or an old agreement. State the agreed mechanism in
          the tenancy agreement, subject to mandatory law. Some jurisdictions have statutory controls on rent increases.
        </p>

        <h2>Payment records</h2>
        <ul>
          <li>Use a consistent payment date and method.</li>
          <li>Give or keep a receipt showing amount, date and period covered.</li>
          <li>Keep bank-transfer references for electronic payments.</li>
          <li>Record any adjustment separately rather than changing the original receipt.</li>
        </ul>

        <h2>End of tenancy</h2>
        <p>
          The agreement should explain the notice and handover process to the extent permitted by the applicable law.
          At handover, record meter readings, keys, inventory and property condition. Then calculate any agreed
          deductions from the deposit and keep the supporting documents.
        </p>

        <h2>Punjab and Islamabad</h2>
        <p>
          Punjab and Islamabad have separate rental legislation. The Punjab Rented Premises Act, 2009 contains
          provisions about tenancy agreements, rent, advance rent, security, landlord obligations and eviction. The
          Islamabad Rent Restriction Ordinance, 2001 contains its own rules on tenancy, rent increases, repairs,
          amenities and eviction. A landlord should use the legislation applicable to the property rather than a
          generic internet template.
        </p>

        <h2>References</h2>
        <ul>
          <li><a href="https://pakistancode.gov.pk/pdffiles/administratorf1b125f14a9e5a6bdd4ea885926304c4.pdf">Pakistan Code — Islamabad Rent Restriction Ordinance, 2001</a></li>
          <li><a href="https://www.punjabcode.punjab.gov.pk/">Punjab Code — Punjab laws portal</a></li>
        </ul>

        <p className="mt-8">
          <Link to="/post">Advertise a rental property on Apna Ghar</Link>.
        </p>
      </LegalPage>
    </>
  );
}

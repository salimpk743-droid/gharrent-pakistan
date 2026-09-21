import { Link, createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/legal-page";
import { JsonLd } from "@/components/seo/json-ld";
import { APP_NAME, PUBLIC_SITE_ORIGIN } from "@/lib/constants";
import { breadcrumbJsonLd, canonicalUrl, guideSeo } from "@/lib/seo";

const PATH = "/guides/landlords/rental-agreement-legal-checklist";
const TITLE = "Rental Agreement Legal Checklist for Landlords in Pakistan | Apna Ghar";
const DESCRIPTION =
  "A practical rental agreement checklist for landlords in Pakistan, with jurisdiction-specific notes for Punjab and Islamabad.";

export const Route = createFileRoute("/guides/landlords/rental-agreement-legal-checklist")({
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
        { name: "Landlords", path: "/guides" },
        { name: "Rental Agreement Legal Checklist", path: PATH },
      ])} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Rental Agreement Legal Checklist for Landlords in Pakistan",
        description: DESCRIPTION,
        inLanguage: "en-PK",
        datePublished: "2026-09-22",
        dateModified: "2026-09-22",
        mainEntityOfPage: url,
        url,
        author: { "@type": "Organization", name: APP_NAME, url: PUBLIC_SITE_ORIGIN + "/" },
        publisher: { "@type": "Organization", name: APP_NAME, url: PUBLIC_SITE_ORIGIN + "/" },
      }} />
      <LegalPage eyebrow="LANDLORD GUIDE" title="Rental Agreement Legal Checklist for Landlords in Pakistan" updated="22 September 2026">
        <div className="rounded-lg border border-line bg-cream p-4 text-ink">
          This is general information, not legal advice. Rental law is not identical across Pakistan. The Punjab
          Rented Premises Act, 2009 applies in Punjab, while Islamabad has its own rent legislation. Confirm the
          rules that apply to your property before signing.
        </div>

        <p>
          A good tenancy agreement removes ambiguity. Record the property, parties, rent, term, payment method,
          deposit, utilities, repairs and the conditions for ending the tenancy.
        </p>

        <h2>Core terms to include</h2>
        <ul>
          <li>Landlord and tenant names and identification details.</li>
          <li>Full property address and a description of the rented premises.</li>
          <li>Start date and duration of the tenancy.</li>
          <li>Monthly rent, due date and payment method.</li>
          <li>Any rent increase agreed by the parties, subject to applicable law.</li>
          <li>Security deposit, advance rent or pagri, including the agreed treatment at the end of the tenancy.</li>
          <li>Purpose of the tenancy and who may occupy the premises.</li>
          <li>Utility, maintenance and repair responsibilities.</li>
          <li>Subletting or assignment rules.</li>
          <li>Notice and termination terms, subject to the applicable law.</li>
        </ul>

        <h2>Punjab</h2>
        <p>
          The Punjab Rented Premises Act, 2009 requires a landlord to let premises through a tenancy agreement and
          provides for presenting the agreement before the Rent Registrar. The Act also lists particulars for the
          tenancy agreement, including the parties, premises, tenure, rent, rent enhancement, payment details,
          purpose and advance rent / security / pagri where applicable.
        </p>
        <p>
          The Act also contains obligations concerning repairs, utilities and landlord access, as well as rules about
          subletting and disputes. The agreement should not attempt to contract around mandatory legal requirements.
        </p>

        <h2>Islamabad Capital Territory</h2>
        <p>
          Islamabad is governed by the Islamabad Rent Restriction Ordinance, 2001. The Pakistan Code identifies
          provisions covering agreements between landlord and tenant, registration of tenancy agreements, rent
          increases, repairs, amenities and eviction. Use the current official text when checking a particular
          requirement.
        </p>

        <h2>Payments and receipts</h2>
        <ul>
          <li>Give the tenant a clear written record of rent and security payments.</li>
          <li>Record the payment date, amount, property and period covered.</li>
          <li>Keep bank transfer evidence where rent is paid electronically.</li>
          <li>Do not leave the treatment of a security deposit to an unwritten promise.</li>
        </ul>

        <h2>Property condition at handover</h2>
        <p>
          Attach or exchange a simple inventory and condition record. Record meter readings and existing damage.
          This creates a factual baseline for both parties and can reduce disputes about damage at the end of the
          tenancy.
        </p>

        <h2>Official references</h2>
        <ul>
          <li><a href="https://pakistancode.gov.pk/pdffiles/administratorf1b125f14a9e5a6bdd4ea885926304c4.pdf">Pakistan Code — Islamabad Rent Restriction Ordinance, 2001</a></li>
          <li><a href="https://www.punjabcode.punjab.gov.pk/">Punjab Code — Punjab laws portal</a></li>
          <li><a href="https://www.punjab-zameen.gov.pk/">Punjab Land Records Authority</a></li>
        </ul>

        <p className="mt-8">
          Ready to advertise? <Link to="/post">Create a property listing on Apna Ghar</Link>.
        </p>
      </LegalPage>
    </>
  );
}

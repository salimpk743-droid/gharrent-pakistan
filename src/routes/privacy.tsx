import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/legal-page";

import { publicSeo } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    publicSeo({
      title: "Privacy Policy | Apna Ghar",
      description: "How Apna Ghar collects, uses and protects information on this Pakistan property marketplace.",
      path: "/privacy",
    }),
  component: Page,
});

function Page() {
  return (
    <LegalPage eyebrow="LEGAL & PRIVACY" title="Privacy Policy" updated="18 September 2026">
      <div className="rounded-lg border border-line bg-cream p-4 text-ink">
        <strong>This is a draft policy, not legal advice.</strong> It explains how Apna Ghar intends to handle
        information as a Pakistan-wide property marketplace for rent, buy and sale. A Pakistani lawyer should review
        it before you rely on it as a formal privacy notice.
      </div>
      <h2>1. Who we are</h2>
      <p>
        Apna Ghar is a marketplace where people can search homes and other properties to rent or buy, and
        advertisers can post listings for rent or sale. We are not a landlord, estate agent, property dealer or
        party to a rental or sale contract unless a written agreement says otherwise.
      </p>
      <h2>2. Information we collect</h2>
      <p>We collect only what we need to run the service:</p>
      <ul>
        <li>Account information from Google sign-in: name, email address and profile photo.</li>
        <li>Optional phone number if you add it to your profile or a listing.</li>
        <li>Listing content you submit, including photos, location, rent or asking price, and description.</li>
        <li>Saved properties, reports and messages you send to Apna Ghar.</li>
        <li>Basic usage information such as pages viewed, listing views and contact-button clicks.</li>
      </ul>
      <p>We do not ask for CNIC numbers, payment-card details or copies of title documents for ordinary use of the site.</p>
      <h2>3. How we use information</h2>
      <ul>
        <li>To create and maintain your account.</li>
        <li>To publish and moderate property listings.</li>
        <li>To let you save homes and manage your own listings.</li>
        <li>To review reports and keep the marketplace safer.</li>
        <li>To understand aggregate traffic and improve the product.</li>
      </ul>
      <h2>4. What is public</h2>
      <p>
        Information you put in a published listing can be seen by anyone on the internet, including search engines.
        Do not include your email address, extra phone numbers or private family details in the description. Your
        Google email is never shown on a public listing.
      </p>
      <h2>5. Cookies and similar technologies</h2>
      <p>
        We use essential cookies and similar storage to keep you signed in and to protect the service. We do not
        currently use advertising cookies. If that changes, we will update this page and provide a clear choice
        where required.
      </p>
      <h2>6. Sharing</h2>
      <p>
        We share information with service providers that host the website, database and sign-in. We may disclose
        information if required by applicable law or to protect users from fraud or harm.
      </p>
      <h2>7. Retention</h2>
      <p>
        Account and listing records are kept while they are needed to operate the marketplace, handle disputes,
        prevent abuse and meet legal obligations. Deleted listings are archived rather than immediately erased so
        that abuse can still be reviewed.
      </p>
      <h2>8. Your choices</h2>
      <p>
        You can edit your profile, pause or archive your listings, and unsave homes. You can ask us to close an
        account using the contact page. We will then stop public display of your listings and will delete or
        anonymise personal data that we no longer need.
      </p>
      <h2>9. Children</h2>
      <p>Apna Ghar is intended for adults who can lawfully use a property marketplace. We do not knowingly collect information from children.</p>
      <h2>10. Changes</h2>
      <p>We may update this policy as the service develops. The date at the top of the page will change when we do.</p>
      <h2>11. Contact</h2>
      <p>Privacy questions can be sent through the Contact page on Apna Ghar.</p>
    </LegalPage>
  );
}

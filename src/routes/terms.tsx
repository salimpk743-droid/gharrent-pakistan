import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/legal-page";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Apna Ghar" },
      { name: "description", content: "Terms of use for the Apna Ghar rental marketplace." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <LegalPage eyebrow="LEGAL" title="Terms of Use">
      <div className="rounded-lg border border-line bg-cream p-4 text-ink">
        <strong>Please read carefully.</strong> This is a draft for a marketplace, not legal advice and not a
        guarantee that every listing is accurate.
      </div>
      <h2>1. Using Apna Ghar</h2>
      <p>
        You agree to use the website lawfully and honestly. You must not use it for fraud, harassment, spam,
        impersonation, misleading advertising, scraping that harms the service, or anything that violates
        applicable law in Pakistan.
      </p>
      <h2>2. Accounts</h2>
      <p>
        The primary way to create an account is Continue with Google. You are responsible for activity on your
        account. You may not try to take over another person’s listings or change your own role to administrator.
      </p>
      <h2>3. Property listings</h2>
      <p>
        People who submit listings are responsible for the accuracy, legality and completeness of what they
        publish. A listing on Apna Ghar is not verification, endorsement or confirmation of ownership unless we
        clearly mark that a specific check has been done.
      </p>
      <h2>4. Rental transactions</h2>
      <p>
        Apna Ghar does not become a party to a rental agreement merely because users find each other here. You are
        responsible for verifying identity, authority to rent, property condition, rent, deposits, utilities and
        all contractual terms before paying or signing.
      </p>
      <h2>5. Safety</h2>
      <ul>
        <li>Inspect a property before sending money.</li>
        <li>Verify the person offering the property.</li>
        <li>Be cautious of pressure, unusually low prices and unusual payment methods.</li>
        <li>Keep copies of agreements, receipts and important messages.</li>
      </ul>
      <h2>6. Content and removal</h2>
      <p>
        We may remove, restrict or decline listings that appear inaccurate, abusive, fraudulent, unlawful or
        inconsistent with these terms. We may suspend accounts that harm other users.
      </p>
      <h2>7. Availability</h2>
      <p>
        We aim to keep the website useful but do not promise uninterrupted access or that every listing is current
        or complete. Prices and availability can change without notice.
      </p>
      <h2>8. Intellectual property</h2>
      <p>
        Apna Ghar branding and original website content are protected by applicable law. By posting a listing you
        grant Apna Ghar the rights reasonably needed to display that content on the marketplace.
      </p>
      <h2>9. Limitation</h2>
      <p>
        To the extent permitted by applicable law, Apna Ghar is provided on an as-available basis. Users are
        responsible for decisions they make based on listings or conversations found through the platform.
      </p>
      <h2>10. Changes</h2>
      <p>We may update these terms as the service develops. Continued use after an update means you have had a chance to read the revised terms.</p>
    </LegalPage>
  );
}

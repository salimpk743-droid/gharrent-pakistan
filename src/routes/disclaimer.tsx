import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/legal-page";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Rental Disclaimer — Apna Ghar" },
      { name: "description", content: "Apna Ghar is a marketplace, not a landlord or party to a rental contract." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <LegalPage eyebrow="IMPORTANT INFORMATION" title="Rental Disclaimer">
      <div className="rounded-lg border border-line bg-cream p-4 text-ink">
        Apna Ghar is a marketplace, not a property owner, estate agent or party to a rental contract.
      </div>
      <h2>Listings</h2>
      <p>
        Property listings are submitted by users or shown as clearly labelled samples. Information may change,
        become unavailable or contain errors. A listing appearing on Apna Ghar does not by itself mean that we have
        verified ownership, identity, price, availability, condition, legality or suitability.
      </p>
      <h2>Before you pay or sign</h2>
      <ul>
        <li>Visit and inspect the property.</li>
        <li>Verify the owner’s identity and legal authority to rent it.</li>
        <li>Confirm rent, deposit, utilities, maintenance and other terms in writing.</li>
        <li>Do not send money solely because a listing looks genuine.</li>
        <li>Keep receipts, agreements and important communications.</li>
      </ul>
      <h2>Reports</h2>
      <p>
        If you believe a listing is misleading, fraudulent, unsafe or unlawful, report it. We may review or remove
        content, but we cannot guarantee that every harmful listing will be detected immediately.
      </p>
      <h2>No guarantee</h2>
      <p>
        To the extent permitted by law, Apna Ghar does not guarantee that the website or any listing will always be
        accurate, available, complete or suitable for a particular purpose. Users make rental decisions at their
        own discretion.
      </p>
    </LegalPage>
  );
}

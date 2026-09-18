import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/legal-page";

import { publicSeo } from "@/lib/seo";

export const Route = createFileRoute("/safety")({
  head: () =>
    publicSeo({
      title: "Safer Buying and Renting | Apna Ghar",
      description: "Practical checks before you pay rent, a deposit or a sale advance on a Pakistan property.",
      path: "/safety",
    }),
  component: Page,
});

function Page() {
  return (
    <LegalPage eyebrow="BUY AND RENT WITH CARE" title="Safer buying and renting" updated="18 September 2026">
      <p>
        Most people on a marketplace are ordinary buyers, tenants, owners or advertisers. A smaller number of
        listings are dishonest. These checks will not catch every problem, but they reduce risk.
      </p>
      <h2>Before you visit</h2>
      <ul>
        <li>Compare the asking rent or sale price with similar properties in the same area. A price that is far too low is a warning sign.</li>
        <li>Be cautious if someone refuses a viewing or asks for a deposit or advance before you have seen the property.</li>
        <li>Search the phone number and title text if something feels off.</li>
        <li>Report duplicate, fake, already-rented or already-sold listings so other people are not misled.</li>
      </ul>
      <h2>At the property</h2>
      <ul>
        <li>Walk through every room. Check water, electricity, gas, drainage and the roof if you can.</li>
        <li>Ask who legally owns the property and who is authorised to rent or sell it. Ask to see documents.</li>
        <li>Meet the person in a place you are comfortable with. Tell someone where you are going.</li>
      </ul>
      <h2>Money</h2>
      <ul>
        <li>Do not transfer large amounts to an unknown personal account solely because a listing looks professional.</li>
        <li>Get a written record of price, deposit, advance, who pays utilities, and when you can move in or complete the transfer.</li>
        <li>Keep receipts. A marketplace listing is not a receipt or a contract.</li>
      </ul>
      <h2>What Apna Ghar does and does not do</h2>
      <p>
        We give advertisers a place to publish listings and people a place to search homes for rent or sale. We
        review reports and can remove or pause listings. We do not inspect every home, we do not guarantee title,
        and a “Google account on file” badge only means the advertiser signed in with Google.
      </p>
    </LegalPage>
  );
}

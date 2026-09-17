import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/legal-page";

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: "Safer renting — Apna Ghar" },
      { name: "description", content: "Practical checks before you pay rent or a deposit in Pakistan." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <LegalPage eyebrow="RENT WITH CARE" title="Safer renting and fraud prevention">
      <p>
        Most landlords and tenants on a marketplace are ordinary people looking for a home or a tenant. A smaller
        number of listings are dishonest. These checks will not catch every problem, but they reduce risk.
      </p>
      <h2>Before you visit</h2>
      <ul>
        <li>Compare the rent with similar homes in the same area. A price that is far too low is a warning sign.</li>
        <li>Be cautious if someone refuses a viewing or asks for a deposit before you have seen the property.</li>
        <li>Search the phone number and title text if something feels off.</li>
        <li>Report duplicate, fake or already-rented listings so other people are not misled.</li>
      </ul>
      <h2>At the property</h2>
      <ul>
        <li>Walk through every room. Check water, electricity, gas, drainage and the roof if you can.</li>
        <li>Ask who legally owns the property and who is authorised to rent it. Ask to see documents.</li>
        <li>Meet the person in a place you are comfortable with. Tell someone where you are going.</li>
      </ul>
      <h2>Money</h2>
      <ul>
        <li>Do not transfer large amounts to an unknown personal account solely because a listing looks professional.</li>
        <li>Get a written record of rent, deposit, advance, who pays utilities, and when you can move in.</li>
        <li>Keep receipts. A marketplace listing is not a receipt or a contract.</li>
      </ul>
      <h2>What Apna Ghar does and does not do</h2>
      <p>
        We give advertisers a place to publish listings and renters a place to search. We review reports and can
        remove or pause listings. We do not inspect every home, we do not guarantee title, and a “Google account on
        file” badge only means the advertiser signed in with Google.
      </p>
    </LegalPage>
  );
}

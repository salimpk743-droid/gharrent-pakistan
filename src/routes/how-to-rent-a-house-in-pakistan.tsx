import { Link, createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LegalPage } from "@/components/layout/legal-page";
import { JsonLd } from "@/components/seo/json-ld";
import { APP_NAME, PUBLIC_SITE_ORIGIN } from "@/lib/constants";
import {
  GUIDE_HOW_TO_RENT_DESCRIPTION,
  GUIDE_HOW_TO_RENT_PATH,
  GUIDE_HOW_TO_RENT_TITLE,
  breadcrumbJsonLd,
  canonicalUrl,
  publicSeo,
} from "@/lib/seo";

export const Route = createFileRoute("/how-to-rent-a-house-in-pakistan")({
  head: () =>
    publicSeo({
      title: GUIDE_HOW_TO_RENT_TITLE,
      description: GUIDE_HOW_TO_RENT_DESCRIPTION,
      path: GUIDE_HOW_TO_RENT_PATH,
    }),
  component: Page,
});

function PageLink({
  to,
  params,
  children,
}: {
  to: "/rent" | "/safety" | "/rent/$province/$district";
  params?: { province: string; district: string };
  children: ReactNode;
}) {
  if (to === "/rent/$province/$district" && params) {
    return (
      <Link to="/rent/$province/$district" params={params}>
        {children}
      </Link>
    );
  }
  if (to === "/safety") {
    return <Link to="/safety">{children}</Link>;
  }
  return <Link to="/rent">{children}</Link>;
}

function Page() {
  const url = canonicalUrl(GUIDE_HOW_TO_RENT_PATH);
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "How to rent a house in Pakistan", path: GUIDE_HOW_TO_RENT_PATH },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "How to Rent a House in Pakistan",
          description: GUIDE_HOW_TO_RENT_DESCRIPTION,
          inLanguage: "en-PK",
          datePublished: "2026-09-18",
          dateModified: "2026-09-18",
          mainEntityOfPage: url,
          url,
          author: { "@type": "Organization", name: APP_NAME, url: `${PUBLIC_SITE_ORIGIN}/` },
          publisher: { "@type": "Organization", name: APP_NAME, url: `${PUBLIC_SITE_ORIGIN}/` },
        }}
      />
      <LegalPage eyebrow="RENTER GUIDE" title="How to Rent a House in Pakistan" updated="18 September 2026">
        <div className="rounded-lg border border-line bg-cream p-4 text-ink">
          This is practical guidance for ordinary renters, not legal advice. Rent law and local practice in Pakistan
          differ by province and city. Confirm the terms of your own agreement and any local requirements before you
          pay or sign.
        </div>
        <p>
          Renting a house in Pakistan is usually a sequence of practical steps: decide what you need, search, visit
          the property, agree rent and a deposit, and put those terms in writing. People still rent on a handshake in
          some places. A written record is safer for both tenant and landlord.
        </p>
        <p>
          This guide covers the process from first search to moving in. Use it as a checklist, then read the actual
          agreement in front of you.
        </p>

        <h2>1. Decide what you need</h2>
        <p>
          Start with the city and the kind of neighbourhood you can live in day to day — commute, schools if you have
          children, markets, and whether you need a quieter street or a busier one. Then choose the property type:
        </p>
        <ul>
          <li>
            <strong>House</strong> — a self-contained home, often with a gate or small lawn. Size is commonly
            described in marla or kanal in Punjab and Islamabad.
          </li>
          <li>
            <strong>Flat / apartment</strong> — a unit in a building. In everyday search language in Pakistan, “flat”
            is the word most people use.
          </li>
          <li>
            <strong>Portion</strong> — part of a house, often an upper or lower floor with its own entrance. Portions
            are common for smaller households.
          </li>
        </ul>
        <p>
          Also decide bedrooms, whether you need it furnished or unfurnished, and any constraints the advertiser has
          already stated — many listings say family or bachelor only. Matching those filters early saves wasted
          visits.
        </p>

        <h2>2. Set your rental budget</h2>
        <p>Monthly rent is only part of the cost. Before you start viewing, add up:</p>
        <ul>
          <li>monthly rent</li>
          <li>security deposit (refundable in most agreements, subject to the written terms)</li>
          <li>any advance rent the landlord is asking for</li>
          <li>electricity, gas and water — especially if meters are separate</li>
          <li>society or maintenance charges, generator or UPS sharing, and internet if they apply</li>
          <li>moving costs</li>
        </ul>
        <p>
          There is no single “typical” rent or deposit that applies across Pakistan. Amounts vary by city, area, size
          and how the parties negotiate. Do not rely on a verbal figure. Whatever you agree should appear in the rent
          agreement and on a receipt.
        </p>

        <h2>3. Search for a property</h2>
        <p>
          Search by city, area, property type, bedrooms and budget. On Apna Ghar you can{" "}
          <PageLink to="/rent">browse homes for rent across Pakistan</PageLink>, including current listings in{" "}
          <PageLink to="/rent/$province/$district" params={{ province: "punjab", district: "lahore" }}>
            Lahore
          </PageLink>
          ,{" "}
          <PageLink
            to="/rent/$province/$district"
            params={{ province: "khyber-pakhtunkhwa", district: "peshawar" }}
          >
            Peshawar
          </PageLink>
          ,{" "}
          <PageLink to="/rent/$province/$district" params={{ province: "punjab", district: "faisalabad" }}>
            Faisalabad
          </PageLink>{" "}
          and{" "}
          <PageLink to="/rent/$province/$district" params={{ province: "punjab", district: "multan" }}>
            Multan
          </PageLink>
          .
        </p>
        <p>
          Treat photos and asking rent as a starting point. Confirm that the listing is still available before you
          travel, and be cautious of a price that is far below similar homes in the same area.
        </p>

        <h2>4. Check the location</h2>
        <p>
          Visit at a time you would actually live there, not only at noon. Walk the approach road. Notice parking,
          lighting, drainage after rain if you can, and how you would get to work, school or a market without a car.
        </p>
        <p>Useful questions while you are there:</p>
        <ul>
          <li>How long is the commute at rush hour?</li>
          <li>Are schools, shops and a medical clinic close enough for your household?</li>
          <li>Is public transport or a ride-hailing pickup practical?</li>
          <li>Do neighbours or a society have rules about visitors, parking or who may live there?</li>
          <li>What is the water, electricity and gas situation on a normal day?</li>
        </ul>
        <p>
          Suitability is personal. An area that works for one household may not work for another. Do not take “best
          area” claims at face value — check it yourself.
        </p>

        <h2>5. Inspect the property before agreeing</h2>
        <p>
          Walk through every room, including the roof, stairs, kitchen, bathrooms and any store or garage. Open taps,
          switches and windows. If the home is furnished, test the appliances that are meant to stay.
        </p>
        <p>Check at least:</p>
        <ul>
          <li>walls, ceilings and signs of damp or leaks</li>
          <li>plumbing, drainage and water pressure</li>
          <li>electricity, wiring and the consumer unit / meter</li>
          <li>water tank, motor and bore (if there is one)</li>
          <li>gas connection or cylinder arrangement, where used</li>
          <li>doors, windows, locks and grills</li>
          <li>kitchen fixtures and, if furnished, fridge, stove, AC or geyser</li>
          <li>parking and the condition of the drive or porch</li>
          <li>existing cracks, stains, broken tiles or missing fittings</li>
        </ul>
        <p>
          Photograph or film anything already damaged. It is much harder to argue about later if there is no record
          from the day you took the keys.
        </p>

        <h2>6. Verify the landlord or authorised representative</h2>
        <p>
          Confirm who is actually allowed to rent the property. The person showing it may be the owner, a relative, a
          dealer, or a current tenant. Ask whose name is on the title or allotment, and ask to see identification.
        </p>
        <p>
          If you are dealing with someone other than the owner, ask how they are authorised to collect rent or a
          deposit. A listing on a website is not proof of ownership. Meet at the property if you can, tell someone
          where you are going, and do not transfer a large amount to an unknown personal account solely because the
          advert looks professional.{" "}
          <PageLink to="/safety">Apna Ghar’s safety checks</PageLink> cover the same points in short form.
        </p>

        <h2>7. Understand rent, deposit and other costs</h2>
        <p>Before you pay, both sides should be clear on:</p>
        <ul>
          <li>monthly rent, due date and how it will be paid</li>
          <li>security deposit: the amount, when it is paid, and the conditions for return</li>
          <li>any advance rent</li>
          <li>who pays electricity, gas, water, internet and society charges</li>
          <li>who handles repairs versus day-to-day upkeep</li>
          <li>any other charge you are expected to pay</li>
        </ul>
        <p>
          Landlords commonly ask for a security deposit. In practice the amount is negotiated and varies by city,
          property and bargaining position. This guide does not state a nationwide legal limit, because provincial
          rules and ordinary practice are not the same everywhere. Get a signed receipt for every payment, and keep
          bank transfer records if you pay that way.
        </p>

        <h2>8. Read the rent agreement carefully</h2>
        <p>
          A written rent agreement (often called a tenancy agreement or kirayanama) should record the deal you
          actually made. Verbal tenancies still happen; they are harder to prove if something goes wrong.
        </p>
        <p>
          Requirements are not identical across Pakistan. In Punjab, the Punjab Rented Premises Act 2009 says a
          landlord should not let a premises except by a tenancy agreement, and should present that agreement before
          the Rent Registrar. In Islamabad, the Islamabad Rent Restriction Ordinance 2001, as amended in 2021,
          requires a written tenancy agreement presented to the Controller within thirty days of signing. Other
          provinces have their own rented-premises laws. Do not assume a Punjab or Islamabad rule applies where you
          are renting. Ask locally, or take advice, if you need a formal requirement confirmed.
        </p>
        <p>As a practical matter, the agreement should clearly state:</p>
        <ul>
          <li>names and CNIC details of landlord and tenant</li>
          <li>the property (address and a short description)</li>
          <li>monthly rent, due date and method of payment</li>
          <li>security deposit, advance rent or any other lump sum, if there is one</li>
          <li>duration of the tenancy</li>
          <li>who pays utilities and who is responsible for which repairs</li>
          <li>how the tenancy can be ended, including any notice the parties have agreed</li>
        </ul>
        <p>
          In Punjab, the 2009 Act also lists, as far as possible, the rate of any rent increase, the landlord’s bank
          account if rent is paid through a bank, the purpose of the letting, and any pagri. Those details are useful
          to spell out even where a different law applies. Stamp paper or e-stamp is commonly used; the fee depends
          on province and the document, so check the current local rate rather than copying an old figure.
        </p>
        <p>
          Read every clause before you sign. If a term is unclear — especially lock-in, deductions from the deposit,
          or who pays for a major repair — ask for it to be written in plain language. Keep your own original or a
          certified copy.
        </p>

        <h2>9. Record the property’s condition</h2>
        <p>On handover, make a simple record that both sides can keep:</p>
        <ul>
          <li>photos or a short video of each room, with the date visible where practical</li>
          <li>electricity, gas and water meter readings</li>
          <li>a list of included items if the house is furnished or semi-furnished</li>
          <li>a written note of existing damage, missing fittings or stains</li>
        </ul>
        <p>
          If the landlord will sign that note, better. If not, still keep your own dated copy. This is the fairest
          way to separate ordinary wear from damage when the deposit is discussed later.
        </p>

        <h2>10. Before moving in</h2>
        <ul>
          <li>You have keys, remotes and any society access you were promised.</li>
          <li>Meters have been read and, if bills will be in your name, the changeover is understood.</li>
          <li>You have a signed agreement and receipts for rent and deposit already paid.</li>
          <li>You know who to call for water, electricity, gas and building or society issues.</li>
          <li>Any remaining work the landlord agreed to do is written down with a date.</li>
        </ul>

        <h2>Rental checklist</h2>
        <ul>
          <li>Decide city, area, type (house, flat or portion), bedrooms and furnished or unfurnished.</li>
          <li>Set a budget that includes rent, deposit, utilities, charges and moving.</li>
          <li>Search, then confirm the listing is still available before you travel.</li>
          <li>Visit the area and the property; inspect water, power, gas, leaks and existing damage.</li>
          <li>Confirm who is authorised to rent it; do not pay a large sum on a listing alone.</li>
          <li>Agree rent, payment date, deposit, utilities and repairs in writing.</li>
          <li>Read the rent agreement; keep a copy. Confirm any local registration or stamp step that applies.</li>
          <li>Photograph the condition, record meter readings and list included items.</li>
          <li>Collect keys, receipts and emergency contacts before you move in.</li>
        </ul>
        <p>
          When you are ready to look,{" "}
          <PageLink to="/rent">search current rental listings</PageLink>. If something about a listing feels wrong,{" "}
          <PageLink to="/safety">read the safety checks</PageLink> before you pay.
        </p>
      </LegalPage>
    </>
  );
}

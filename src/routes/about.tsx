import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/legal-page";
import { publicSeo } from "@/lib/seo";
import {
  CONTACT_EMAIL,
  WHATSAPP_DISPLAY,
  WHATSAPP_POST_FOR_ME_MESSAGE,
  mailtoUrl,
  whatsappChatUrl,
} from "@/lib/site-contact";

export const Route = createFileRoute("/about")({
  head: () =>
    publicSeo({
      title: "About Apna Ghar | Free Property Ads in Pakistan",
      description:
        "Apna Ghar is a free property marketplace for homes to rent or buy in Pakistan. Learn how it works, what it is not, and how to contact us by email or WhatsApp.",
      path: "/about",
    }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <LegalPage eyebrow="ABOUT" title="About Apna Ghar" updated="3 October 2026">
      <p>
        Apna Ghar is a property marketplace for Pakistan. Owners, landlords and agents post houses, flats, portions,
        rooms, plots and commercial spaces for rent or sale, and people looking for a home contact them directly by
        phone or WhatsApp.
      </p>

      <h2>What Apna Ghar is not</h2>
      <ul>
        <li>
          It is <b>not</b> the government housing-loan scheme. The Wazir-e-Azam Apna Ghar programme is at{" "}
          <a href="https://apnaghar.gov.pk" rel="noreferrer" target="_blank">
            apnaghar.gov.pk
          </a>
          .
        </li>
        <li>It is not a landlord, estate agent or party to any rental or sale agreement.</li>
        <li>It does not collect rent, deposits or advance payments.</li>
      </ul>

      <h2>How it works</h2>
      <ul>
        <li>
          <b>Posting is free.</b> You can <Link to="/post">post a property</Link> yourself, and your ad goes live as
          soon as you publish it.
        </li>
        <li>
          <b>Prefer WhatsApp?</b> Send your property details and photos to{" "}
          <a href={whatsappChatUrl(WHATSAPP_POST_FOR_ME_MESSAGE)} target="_blank" rel="noreferrer">
            {WHATSAPP_DISPLAY}
          </a>{" "}
          and we will post the ad for you, free.
        </li>
        <li>Ads stay live for 60 days by default and can be renewed, paused, edited or marked as rented or sold by the advertiser.</li>
        <li>
          Anyone can report a listing that looks fake, duplicated or already rented. Reported listings are reviewed and
          can be suspended or removed.
        </li>
      </ul>

      <h2>Before you pay anyone</h2>
      <p>
        Always view the property and check who owns it before paying. Read our{" "}
        <Link to="/safety">safer buying and renting checklist</Link> and the{" "}
        <Link to="/guides">rental and property guides</Link>.
      </p>

      <h2>Contact</h2>
      <ul>
        <li>
          Email: <a href={mailtoUrl("Apna Ghar")}>{CONTACT_EMAIL}</a>
        </li>
        <li>
          WhatsApp:{" "}
          <a href={whatsappChatUrl()} target="_blank" rel="noreferrer">
            {WHATSAPP_DISPLAY}
          </a>
        </li>
        <li>
          Or use the <Link to="/contact">contact form</Link>.
        </li>
      </ul>
    </LegalPage>
  );
}

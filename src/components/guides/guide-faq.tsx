import { JsonLd } from "@/components/seo/json-ld";

export type GuideFaqItem = { q: string; a: string };

/** Visible FAQ list plus matching FAQPage structured data (same text in both). */
export function GuideFaq({ faqs, heading = "Questions people ask" }: { faqs: GuideFaqItem[]; heading?: string }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: { "@type": "Answer", text: faq.a },
          })),
        }}
      />
      <h2>{heading}</h2>
      {faqs.map((faq) => (
        <section key={faq.q}>
          <h3>{faq.q}</h3>
          <p>{faq.a}</p>
        </section>
      ))}
    </>
  );
}

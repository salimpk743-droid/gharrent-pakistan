import { createFileRoute, notFound } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/legal-page";
import { PostPropertyCta } from "@/components/guides/post-property-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { APP_NAME, PUBLIC_SITE_ORIGIN } from "@/lib/constants";
import { questionGuideBySlug, type Inline, type QuestionGuide } from "@/lib/question-guides";
import { breadcrumbJsonLd, canonicalUrl, guideSeo } from "@/lib/seo";

export const Route = createFileRoute("/guides/$slug")({
  beforeLoad: ({ params }) => {
    if (!questionGuideBySlug(params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const guide = questionGuideBySlug(params.slug);
    if (!guide) return { meta: [{ title: `Guide | ${APP_NAME}` }] };
    return guideSeo({ title: guide.title, description: guide.description, path: `/guides/${guide.slug}` });
  },
  component: Page,
});

function Rich({ parts }: { parts: Inline[] }) {
  return parts.map((part, index) =>
    typeof part === "string" ? (
      <span key={index}>{part}</span>
    ) : (
      <a key={index} href={part.href} {...(part.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {part.label}
      </a>
    ),
  );
}

function GuideBody({ guide }: { guide: QuestionGuide }) {
  const path = `/guides/${guide.slug}`;
  const url = canonicalUrl(path);
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: guide.h1, path },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: guide.h1,
          description: guide.description,
          inLanguage: "en-PK",
          datePublished: guide.updatedIso,
          dateModified: guide.updatedIso,
          mainEntityOfPage: url,
          url,
          author: { "@type": "Organization", name: APP_NAME, url: PUBLIC_SITE_ORIGIN + "/" },
          publisher: { "@type": "Organization", name: APP_NAME, url: PUBLIC_SITE_ORIGIN + "/" },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: guide.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.a.map((part) => (typeof part === "string" ? part : part.label)).join(""),
            },
          })),
        }}
      />
      <LegalPage eyebrow={guide.eyebrow} title={guide.h1} updated={guide.updatedLabel}>
        <div className="rounded-lg border border-line bg-cream p-4 text-ink">
          {guide.notice ??
            "Reported asking ranges from the publishers named below. They are not a quote, a valuation, or a promise that a home is available at that price. Rents and sale prices change by street, size and condition."}
        </div>
        {guide.direct.map((paragraph, index) => (
          <p key={`direct-${index}`}>
            <Rich parts={paragraph} />
          </p>
        ))}
        {guide.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((paragraph, index) => (
              <p key={`${section.heading}-p-${index}`}>
                <Rich parts={paragraph} />
              </p>
            ))}
            {section.bullets ? (
              <ul>
                {section.bullets.map((item, index) => (
                  <li key={`${section.heading}-b-${index}`}>
                    <Rich parts={item} />
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
        <PostPropertyCta />
        <h2>Questions people ask</h2>
        {guide.faqs.map((faq) => (
          <section key={faq.q}>
            <h3>{faq.q}</h3>
            <p>
              <Rich parts={faq.a} />
            </p>
          </section>
        ))}
        <h2>Sources</h2>
        <ul>
          {guide.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
        <h2>Related guides</h2>
        <ul>
          {guide.related.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </LegalPage>
    </>
  );
}

function Page() {
  const { slug } = Route.useParams();
  const guide = questionGuideBySlug(slug);
  if (!guide) throw notFound();
  return <GuideBody guide={guide} />;
}

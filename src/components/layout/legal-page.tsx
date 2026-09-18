export function LegalPage({
  eyebrow,
  title,
  updated = "16 September 2026",
  children,
}: {
  eyebrow: string;
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-[min(850px,calc(100%-32px))] py-16">
      <p className="text-[10px] font-extrabold tracking-[0.16em] text-forest">{eyebrow}</p>
      <h1 className="font-display mt-2 text-4xl tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted">Last updated: {updated}</p>
      <div className="legal-prose mt-8 text-sm leading-relaxed text-[#52645d] [&_h2]:font-display [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:text-ink [&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-ink [&_li]:my-1.5 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:ps-5 [&_a]:font-semibold [&_a]:text-forest [&_a]:no-underline hover:[&_a]:underline [&_.urdu-prose]:font-urdu [&_.urdu-prose_h2]:font-urdu">
        {children}
      </div>
    </main>
  );
}

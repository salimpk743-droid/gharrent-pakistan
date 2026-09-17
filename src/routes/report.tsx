import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report a problem — Apna Ghar" },
      { name: "description", content: "Report a suspicious listing or a problem with Apna Ghar." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <main className="mx-auto w-[min(720px,calc(100%-32px))] py-16">
      <p className="text-[10px] font-extrabold tracking-[0.16em] text-forest">TRUST & SAFETY</p>
      <h1 className="font-display mt-2 text-4xl">Report a problem</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        If a listing looks fake, already rented, in the wrong place or otherwise harmful, open that listing and use
        Report this listing. That sends the report into the moderation queue with the property attached.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        For a problem with the website itself, your account, or something you cannot attach to one listing, use the
        contact form.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/rent"
          className="inline-flex min-h-11 items-center rounded-md bg-forest px-4 text-sm font-bold text-white no-underline"
        >
          Find a listing to report
        </Link>
        <Link
          to="/contact"
          className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-sm font-bold text-ink no-underline"
        >
          Contact Apna Ghar
        </Link>
      </div>
    </main>
  );
}

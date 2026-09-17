import { createFileRoute, Link } from "@tanstack/react-router";
import { listLocationTree } from "@/lib/server/locations";

export const Route = createFileRoute("/locations")({
  loader: () => listLocationTree(),
  head: () => ({
    meta: [
      { title: "Pakistan property locations — Apna Ghar" },
      {
        name: "description",
        content:
          "Browse Apna Ghar’s Pakistan location directory by province and city, then open homes for rent or sale in that area.",
      },
    ],
  }),
  component: LocationsPage,
});

function LocationsPage() {
  const tree = Route.useLoaderData();
  return (
    <main className="mx-auto w-[min(1000px,calc(100%-32px))] py-16">
      <p className="text-[10px] font-extrabold tracking-[0.16em] text-forest">PAKISTAN LOCATION DIRECTORY</p>
      <h1 className="font-display mt-2 text-4xl tracking-tight">Browse locations across Pakistan</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Apna Ghar is organised as Country → Province / Region → City → Area → Property. Choose a province to
        open property search for that region.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {tree.map((p) => (
          <article key={p.id} className="rounded-xl border border-line bg-sand p-5">
            <h2 className="font-display text-2xl">
              <Link to="/rent/$province" params={{ province: p.slug }} className="text-ink no-underline hover:text-forest">
                {p.name}
              </Link>
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {p.districts
                .slice(0, 12)
                .map((d) => d.name)
                .join(", ")}
              {p.districts.length > 12 ? " and more" : ""}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { listLocationTree } from "@/lib/server/locations";

export const Route = createFileRoute("/locations")({
  loader: () => listLocationTree(),
  head: () => ({
    meta: [
      { title: "Pakistan rental locations — GharRent" },
      {
        name: "description",
        content:
          "Browse GharRent’s Pakistan location directory by province, district and tehsil, then open rental homes in that area.",
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
      <h1 className="font-display mt-2 text-4xl tracking-tight">Browse rental locations across Pakistan</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        GharRent is organised as Country → Province / Region → District → Tehsil → Area → Property. Choose a
        province to open rental search for that region.
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

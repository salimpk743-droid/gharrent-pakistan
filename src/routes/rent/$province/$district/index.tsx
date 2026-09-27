import { createFileRoute, notFound } from "@tanstack/react-router";
import { ResultsPage } from "@/components/search/results-page";
import { searchProperties } from "@/lib/server/properties";
import { listSeoAreas } from "@/lib/server/locations";
import { typeToSlug } from "@/lib/constants";
import { parseRentSearch } from "@/lib/rent-search";
import { assertCanonicalMarketplacePath, searchRouteSeo } from "@/lib/seo";

export const Route = createFileRoute("/rent/$province/$district/")({
  validateSearch: parseRentSearch,
  loaderDeps: ({ search: s }) => s,
  beforeLoad: ({ params }) => {
    assertCanonicalMarketplacePath({
      purpose: "RENT",
      province: params.province,
      district: params.district,
    });
  },
  loader: async ({ params, deps }) => {
    const data = await searchProperties({
      data: { ...deps, provinceSlug: params.province, districtSlug: params.district, purpose: "RENT" },
    });
    if (!data.province || !data.district) throw notFound();
    const areas = await listSeoAreas({ provinceSlug: params.province, districtSlug: params.district, purpose: "RENT" });
    return { ...data, areas };
  },
  head: ({ loaderData, params }) =>
    searchRouteSeo({
      purpose: "RENT",
      params: { province: params.province, district: params.district },
      data: loaderData,
    }),
  component: Page,
});

function Page() {
  const data = Route.useLoaderData();
  const { province } = Route.useParams();
  return (
    <div>
    <ResultsPage
      items={data.items}
      total={data.total}
      page={data.page}
      pageSize={data.pageSize}
      locationLabel={data.locationLabel}
      provinceSlug={province}
      districtSlug={data.district?.slug}
      typeSlug={data.type ? typeToSlug(data.type) : undefined}
      purpose="RENT"
      areas={data.areas}
    />
    <section className="mx-auto mt-10 max-w-5xl rounded-xl border border-line bg-white p-6">
      <h2 className="font-display text-2xl text-ink">Property types for rent in {data.locationLabel}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Browse live published rental inventory by property type in {data.locationLabel}.
      </p>
      <div className="mt-8 space-y-5">
        <div>
          <h3 className="font-semibold text-ink">How do I compare rental properties here?</h3>
          <p className="mt-1 text-sm leading-6 text-muted">
            Compare monthly rent, property size, bedrooms where available, location, parking and listing details before contacting an advertiser.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-ink">What should I check before renting?</h3>
          <p className="mt-1 text-sm leading-6 text-muted">
            Review the rent, security deposit, advance rent, utilities, maintenance responsibilities and tenancy terms before making a payment.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-ink">Rental guides</h3>
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <a href="/guides/renting/rental-budget-and-costs-pakistan" className="font-semibold text-forest underline">Rental budget guide</a>
            <a href="/guides/renting/house-vs-flat-vs-portion-pakistan" className="font-semibold text-forest underline">House vs flat vs portion</a>
            <a href="/how-to-rent-a-house-in-pakistan" className="font-semibold text-forest underline">How to rent a house</a>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
}

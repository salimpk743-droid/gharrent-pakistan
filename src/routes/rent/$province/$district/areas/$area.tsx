import { createFileRoute, notFound } from "@tanstack/react-router";
import { ResultsPage } from "@/components/search/results-page";
import { searchProperties } from "@/lib/server/properties";
import { getSeoArea, listSeoAreas } from "@/lib/server/locations";
import { parseRentSearch } from "@/lib/rent-search";
import { areaPath, areaRouteSeo, assertCanonicalMarketplacePath } from "@/lib/seo";

export const Route = createFileRoute("/rent/$province/$district/areas/$area")({
  validateSearch: parseRentSearch,
  loaderDeps: ({ search: s }) => s,
  beforeLoad: ({ params }) => {
    const href = areaPath({
      purpose: "RENT",
      province: params.province,
      district: params.district,
      area: params.area,
    });
    if (href !== `/rent/${params.province}/${params.district}/areas/${params.area}`) {
      throw notFound();
    }
  },
  loader: async ({ params, deps }) => {
    const area = await getSeoArea({
      provinceSlug: params.province,
      districtSlug: params.district,
      areaSlug: params.area,
    });
    if (!area) throw notFound();
    const data = await searchProperties({
      data: {
        ...deps,
        provinceSlug: params.province,
        districtSlug: params.district,
        areaSlug: params.area,
        purpose: "RENT",
      },
    });
    return { data, area };
  },
  head: ({ loaderData, params }) =>
    areaRouteSeo({
      purpose: "RENT",
      provinceSlug: params.province,
      districtSlug: params.district,
      areaSlug: params.area,
      areaName: loaderData?.area.name ?? params.area,
      total: loaderData?.data.total ?? 0,
    }),
  component: Page,
});

function Page() {
  const { data, area } = Route.useLoaderData();
  const { province, district } = Route.useParams();
  return (
    <div>
    <ResultsPage
      items={data.items}
      total={data.total}
      page={data.page}
      pageSize={data.pageSize}
      locationLabel={data.locationLabel}
      provinceSlug={province}
      districtSlug={district}
      areaSlug={area.slug}
      areaName={area.name}
      purpose="RENT"
      title={`Property for Rent in ${area.name}`}
      description={`Browse current properties for rent in ${area.name}. Compare monthly rent, size and location on Apna Ghar.`}
    />

    <section className="mx-auto mt-10 max-w-5xl rounded-xl border border-line bg-white p-6">
      <h2 className="font-display text-2xl text-ink">About properties for rent in {area.name}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Compare current published listings by price, size, bedrooms where available and location details before contacting an advertiser.
      </p>
      <div className="mt-6 space-y-5">
        <div>
          <h3 className="font-semibold text-ink">How should I compare properties here?</h3>
          <p className="mt-1 text-sm leading-6 text-muted">
            Compare monthly rent, property size, bedrooms where available, location, parking and listing details before making a rental decision.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-ink">What should I check before renting?</h3>
          <p className="mt-1 text-sm leading-6 text-muted">
            Review monthly rent, security deposit, advance rent, utilities, maintenance responsibilities and tenancy terms before making a payment.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-ink">Property guidance</h3>
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <><a href="/guides/renting/rental-budget-and-costs-pakistan" className="font-semibold text-forest underline">Rental budget guide</a><a href="/guides/renting/house-vs-flat-vs-portion-pakistan" className="font-semibold text-forest underline">House vs flat vs portion</a><a href="/how-to-rent-a-house-in-pakistan" className="font-semibold text-forest underline">How to rent a house</a></>
          </div>
        </div>
        <div><a href={`/rent/${province}/${district}`} className="font-semibold text-forest underline">View all properties for rent in {district}</a></div>
      </div>
    </section>
    </div>
  );
}
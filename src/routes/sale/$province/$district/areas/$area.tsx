import { createFileRoute, notFound } from "@tanstack/react-router";
import { ResultsPage } from "@/components/search/results-page";
import { searchProperties } from "@/lib/server/properties";
import { getSeoArea } from "@/lib/server/locations";
import { areaRouteSeo } from "@/lib/seo";

export const Route = createFileRoute("/sale/$province/$district/areas/$area")({
  validateSearch: ({}) => ({}),
  loader: async ({ params }) => {
    const area = await getSeoArea({
      provinceSlug: params.province,
      districtSlug: params.district,
      areaSlug: params.area,
    });
    if (!area) throw notFound();
    const data = await searchProperties({
      data: {
        provinceSlug: params.province,
        districtSlug: params.district,
        areaSlug: params.area,
        purpose: "SALE",
      },
    });
    return { data, area };
  },
  head: ({ loaderData, params }) =>
    areaRouteSeo({
      purpose: "SALE",
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
      purpose="SALE"
      title={`Property for Sale in ${area.name}`}
      description={`Browse current properties for sale in ${area.name}. Compare asking price, size and location on Apna Ghar.`}
    />

    <section className="mx-auto mt-10 max-w-5xl rounded-xl border border-line bg-white p-6">
      <h2 className="font-display text-2xl text-ink">About properties for sale in {area.name}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Compare current published listings by price, size, bedrooms where available and location details before contacting an advertiser.
      </p>
      <div className="mt-6 space-y-5">
        <div>
          <h3 className="font-semibold text-ink">How should I compare properties here?</h3>
          <p className="mt-1 text-sm leading-6 text-muted">
            Compare asking price, property size, location, title and document information, and the advertised property details before making a purchase decision.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-ink">What should I check before buying?</h3>
          <p className="mt-1 text-sm leading-6 text-muted">
            Review ownership and relevant documents, payment terms, agreement details, registration requirements and handover arrangements.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-ink">Property guidance</h3>
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <a href="/guides/buying/how-to-buy-property-in-pakistan" className="font-semibold text-forest underline">Property-buying checklist</a>
          </div>
        </div>
        <div><a href={`/sale/${province}/${district}`} className="font-semibold text-forest underline">View all properties for sale in {district}</a></div>
      </div>
    </section>
    </div>
  );
}
import { createFileRoute, notFound } from "@tanstack/react-router";
import { ResultsPage } from "@/components/search/results-page";
import { searchProperties } from "@/lib/server/properties";
import { listSeoAreas } from "@/lib/server/locations";
import { typeToSlug } from "@/lib/constants";
import { parseMarketplaceSearch } from "@/lib/rent-search";
import { assertCanonicalMarketplacePath, searchRouteSeo } from "@/lib/seo";

export const Route = createFileRoute("/sale/$province/$district/")({
  validateSearch: parseMarketplaceSearch,
  loaderDeps: ({ search: s }) => s,
  beforeLoad: ({ params }) => {
    assertCanonicalMarketplacePath({
      purpose: "SALE",
      province: params.province,
      district: params.district,
    });
  },
  loader: async ({ params, deps }) => {
    const data = await searchProperties({
      data: { ...deps, provinceSlug: params.province, districtSlug: params.district, purpose: "SALE" },
    });
    if (!data.province || !data.district) throw notFound();
    const areas = await listSeoAreas({ provinceSlug: params.province, districtSlug: params.district, purpose: "SALE" });
    return { ...data, areas };
  },
  head: ({ loaderData, params }) =>
    searchRouteSeo({
      purpose: "SALE",
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
      purpose="SALE"
      areas={data.areas}
    />

    <section className="mx-auto mt-10 max-w-5xl rounded-xl border border-line bg-white p-6">
      <h2 className="font-display text-2xl text-ink">About properties for sale in {data.locationLabel}</h2>
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
        
      </div>
    </section>
    </div>
  );
}
import { createFileRoute, notFound } from "@tanstack/react-router";
import { ResultsPage } from "@/components/search/results-page";
import { searchProperties } from "@/lib/server/properties";
import { typeFromSlug } from "@/lib/constants";
import { listSeoAreas, listSeoIntents } from "@/lib/server/locations";
import { parseRentSearch } from "@/lib/rent-search";
import { assertCanonicalMarketplacePath, searchRouteSeo } from "@/lib/seo";

export const Route = createFileRoute("/rent/$province/$district/$type")({
  validateSearch: parseRentSearch,
  loaderDeps: ({ search: s }) => s,
  beforeLoad: ({ params }) => {
    assertCanonicalMarketplacePath({
      purpose: "RENT",
      province: params.province,
      district: params.district,
      type: params.type,
    });
  },
  loader: async ({ params, deps }) => {
    const data = await searchProperties({
      data: {
        ...deps,
        provinceSlug: params.province,
        districtSlug: params.district,
        typeSlug: params.type,
        purpose: "RENT",
      },
    });
    if (!data.province || !data.district) throw notFound();
    const type = typeFromSlug(params.type);
    const areas = await listSeoAreas({ provinceSlug: params.province, districtSlug: params.district, purpose: "RENT", type });
    const intents = type ? await listSeoIntents({ provinceSlug: params.province, districtSlug: params.district, purpose: "RENT", type }) : [];
    return { ...data, areas, intents };
  },
  head: ({ loaderData, params }) =>
    searchRouteSeo({
      purpose: "RENT",
      params: { province: params.province, district: params.district, type: params.type },
      data: { ...loaderData, type: typeFromSlug(params.type) ?? loaderData?.type ?? null },
    }),
  component: Page,
});

function Page() {
  const data = Route.useLoaderData();
  const { province, district, type } = Route.useParams();
  return (
    <ResultsPage
      items={data.items}
      total={data.total}
      page={data.page}
      pageSize={data.pageSize}
      locationLabel={data.locationLabel}
      provinceSlug={province}
      districtSlug={district}
      typeSlug={type}
      purpose="RENT"
      areas={data.areas}
      intents={data.intents}
    />
  );
}

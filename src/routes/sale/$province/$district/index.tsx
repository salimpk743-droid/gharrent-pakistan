import { createFileRoute, notFound } from "@tanstack/react-router";
import { ResultsPage } from "@/components/search/results-page";
import { searchProperties } from "@/lib/server/properties";
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
    return data;
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
    />
  );
}

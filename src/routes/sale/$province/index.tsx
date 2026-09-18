import { createFileRoute } from "@tanstack/react-router";
import { ResultsPage } from "@/components/search/results-page";
import { searchProperties } from "@/lib/server/properties";
import { typeToSlug } from "@/lib/constants";
import { parseMarketplaceSearch } from "@/lib/rent-search";
import { searchRouteSeo } from "@/lib/seo";

export const Route = createFileRoute("/sale/$province/")({
  validateSearch: parseMarketplaceSearch,
  loaderDeps: ({ search: s }) => s,
  loader: ({ params, deps }) =>
    searchProperties({ data: { ...deps, provinceSlug: params.province, purpose: "SALE" } }),
  head: ({ loaderData, params }) =>
    searchRouteSeo({ purpose: "SALE", params: { province: params.province }, data: loaderData }),
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
      typeSlug={data.type ? typeToSlug(data.type) : undefined}
      purpose="SALE"
    />
  );
}

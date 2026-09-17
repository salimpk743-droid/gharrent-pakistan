import { createFileRoute } from "@tanstack/react-router";
import { ResultsPage } from "@/components/search/results-page";
import { searchProperties } from "@/lib/server/properties";
import { APP_NAME, typeToSlug } from "@/lib/constants";
import { parseMarketplaceSearch } from "@/lib/rent-search";

export const Route = createFileRoute("/sale/$province/")({
  validateSearch: parseMarketplaceSearch,
  loaderDeps: ({ search: s }) => s,
  loader: ({ params, deps }) =>
    searchProperties({ data: { ...deps, provinceSlug: params.province, purpose: "SALE" } }),
  head: ({ loaderData, params }) => ({
    meta: [
      { title: `Homes for sale in ${loaderData?.locationLabel || params.province} — ${APP_NAME}` },
      {
        name: "description",
        content: `Find properties for sale in ${loaderData?.locationLabel || params.province} on Apna Ghar.`,
      },
    ],
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
      typeSlug={data.type ? typeToSlug(data.type) : undefined}
      purpose="SALE"
    />
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { ResultsPage } from "@/components/search/results-page";
import { searchProperties } from "@/lib/server/properties";
import { parseMarketplaceSearch } from "@/lib/rent-search";
import { searchRouteSeo } from "@/lib/seo";

export const Route = createFileRoute("/sale/")({
  validateSearch: parseMarketplaceSearch,
  loaderDeps: ({ search: s }) => s,
  loader: ({ deps }) => searchProperties({ data: { ...deps, purpose: "SALE" } }),
  head: ({ loaderData }) => searchRouteSeo({ purpose: "SALE", data: loaderData }),
  component: Page,
});

function Page() {
  const data = Route.useLoaderData();
  return (
    <ResultsPage
      items={data.items}
      total={data.total}
      page={data.page}
      pageSize={data.pageSize}
      locationLabel="Pakistan"
      purpose="SALE"
    />
  );
}

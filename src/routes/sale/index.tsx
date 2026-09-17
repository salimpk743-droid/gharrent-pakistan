import { createFileRoute } from "@tanstack/react-router";
import { ResultsPage } from "@/components/search/results-page";
import { searchProperties } from "@/lib/server/properties";
import { APP_NAME } from "@/lib/constants";
import { parseMarketplaceSearch } from "@/lib/rent-search";

export const Route = createFileRoute("/sale/")({
  validateSearch: parseMarketplaceSearch,
  loaderDeps: ({ search: s }) => s,
  loader: ({ deps }) => searchProperties({ data: { ...deps, purpose: "SALE" } }),
  head: () => ({
    meta: [
      { title: `Homes for sale in Pakistan — ${APP_NAME}` },
      { name: "description", content: "Browse houses, plots and commercial properties for sale across Pakistan." },
    ],
  }),
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

import { createFileRoute } from "@tanstack/react-router";
import { ResultsPage } from "@/components/search/results-page";
import { searchProperties } from "@/lib/server/properties";
import { parseRentSearch } from "@/lib/rent-search";
import { searchRouteSeo } from "@/lib/seo";

export const Route = createFileRoute("/rent/")({
  validateSearch: parseRentSearch,
  loaderDeps: ({ search: s }) => s,
  loader: ({ deps }) => searchProperties({ data: { ...deps, purpose: "RENT" } }),
  head: ({ loaderData }) => searchRouteSeo({ purpose: "RENT", data: loaderData }),
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
      purpose="RENT"
    />
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { ResultsPage } from "@/components/search/results-page";
import { searchProperties } from "@/lib/server/properties";

import { parseRentSearch } from "@/lib/rent-search";

export const Route = createFileRoute("/rent/")({
  validateSearch: parseRentSearch,
  loaderDeps: ({ search: s }) => s,
  loader: ({ deps }) => searchProperties({ data: deps }),
  head: () => ({
    meta: [
      { title: "Homes for rent in Pakistan — GharRent" },
      { name: "description", content: "Browse rental homes across Pakistan. Filter by type, budget and location." },
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
    />
  );
}

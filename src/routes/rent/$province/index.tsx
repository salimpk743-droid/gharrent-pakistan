import { createFileRoute } from "@tanstack/react-router";
import { ResultsPage } from "@/components/search/results-page";
import { searchProperties } from "@/lib/server/properties";
import { typeToSlug } from "@/lib/constants";

import { parseRentSearch } from "@/lib/rent-search";

export const Route = createFileRoute("/rent/$province/")({
  validateSearch: parseRentSearch,
  loaderDeps: ({ search: s }) => s,
  loader: ({ params, deps }) =>
    searchProperties({ data: { ...deps, provinceSlug: params.province } }),
  head: ({ loaderData, params }) => ({
    meta: [
      { title: `Homes for rent in ${loaderData?.locationLabel || params.province} — GharRent` },
      {
        name: "description",
        content: `Find rental homes in ${loaderData?.locationLabel || params.province}. Compare rent, size and location on GharRent Pakistan.`,
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
    />
  );
}

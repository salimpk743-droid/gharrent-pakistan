import { createFileRoute } from "@tanstack/react-router";
import { ResultsPage } from "@/components/search/results-page";
import { searchProperties } from "@/lib/server/properties";
import { PROPERTY_TYPE_META, typeFromSlug } from "@/lib/constants";

import { parseRentSearch } from "@/lib/rent-search";

export const Route = createFileRoute("/rent/$province/$district/$type")({
  validateSearch: parseRentSearch,
  loaderDeps: ({ search: s }) => s,
  loader: ({ params, deps }) =>
    searchProperties({
      data: {
        ...deps,
        provinceSlug: params.province,
        districtSlug: params.district,
        typeSlug: params.type,
      },
    }),
  head: ({ loaderData, params }) => {
    const t = typeFromSlug(params.type);
    const label = t ? PROPERTY_TYPE_META[t].plural : "Homes";
    const place = loaderData?.locationLabel || params.district;
    return {
      meta: [
        { title: `${label} for rent in ${place} — GharRent` },
        { name: "description", content: `Find ${label.toLowerCase()} for rent in ${place} on GharRent Pakistan.` },
      ],
    };
  },
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
    />
  );
}

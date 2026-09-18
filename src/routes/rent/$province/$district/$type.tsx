import { createFileRoute } from "@tanstack/react-router";
import { ResultsPage } from "@/components/search/results-page";
import { searchProperties } from "@/lib/server/properties";
import { typeFromSlug } from "@/lib/constants";
import { parseRentSearch } from "@/lib/rent-search";
import { searchRouteSeo } from "@/lib/seo";

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
        purpose: "RENT",
      },
    }),
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
    />
  );
}

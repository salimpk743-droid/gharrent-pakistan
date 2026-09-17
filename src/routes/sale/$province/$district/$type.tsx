import { createFileRoute } from "@tanstack/react-router";
import { ResultsPage } from "@/components/search/results-page";
import { searchProperties } from "@/lib/server/properties";
import { APP_NAME, PROPERTY_TYPE_META, typeFromSlug } from "@/lib/constants";
import { parseMarketplaceSearch } from "@/lib/rent-search";

export const Route = createFileRoute("/sale/$province/$district/$type")({
  validateSearch: parseMarketplaceSearch,
  loaderDeps: ({ search: s }) => s,
  loader: ({ params, deps }) =>
    searchProperties({
      data: {
        ...deps,
        provinceSlug: params.province,
        districtSlug: params.district,
        typeSlug: params.type,
        purpose: "SALE",
      },
    }),
  head: ({ loaderData, params }) => {
    const t = typeFromSlug(params.type);
    const label = t ? PROPERTY_TYPE_META[t].plural : "Homes";
    const place = loaderData?.locationLabel || params.district;
    return {
      meta: [
        { title: `${label} for sale in ${place} — ${APP_NAME}` },
        { name: "description", content: `Find ${label.toLowerCase()} for sale in ${place} on Apna Ghar.` },
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
      purpose="SALE"
    />
  );
}

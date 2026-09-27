import { createFileRoute, notFound } from "@tanstack/react-router";
import { ResultsPage } from "@/components/search/results-page";
import { searchProperties } from "@/lib/server/properties";
import { getSeoArea } from "@/lib/server/locations";
import { typeFromSlug, PROPERTY_TYPE_META } from "@/lib/constants";
import { parseRentSearch } from "@/lib/rent-search";
import { areaPath, areaRouteSeo } from "@/lib/seo";

export const Route = createFileRoute("/rent/$province/$district/areas/$area/$type")({
  validateSearch: parseRentSearch,
  loaderDeps: ({ search: s }) => s,
  loader: async ({ params, deps }) => {
    const type = typeFromSlug(params.type);
    if (!type) throw notFound();
    const area = await getSeoArea({
      provinceSlug: params.province,
      districtSlug: params.district,
      areaSlug: params.area,
    });
    if (!area) throw notFound();
    const data = await searchProperties({
      data: {
        ...deps,
        provinceSlug: params.province,
        districtSlug: params.district,
        areaSlug: params.area,
        typeSlug: params.type,
        purpose: "RENT",
      },
    });
    return { data, area, type };
  },
  head: ({ loaderData, params }) =>
    areaRouteSeo({
      purpose: "RENT",
      provinceSlug: params.province,
      districtSlug: params.district,
      areaSlug: params.area,
      areaName: loaderData?.area.name ?? params.area,
      type: params.type,
      typeName: loaderData ? PROPERTY_TYPE_META[loaderData.type].plural : undefined,
      total: loaderData?.data.total ?? 0,
    }),
  component: Page,
});

function Page() {
  const { data, area, type } = Route.useLoaderData();
  const { province, district } = Route.useParams();
  const typeName = PROPERTY_TYPE_META[type].plural;
  return (
    <ResultsPage
      items={data.items}
      total={data.total}
      page={data.page}
      pageSize={data.pageSize}
      locationLabel={data.locationLabel}
      provinceSlug={province}
      districtSlug={district}
      areaSlug={area.slug}
      areaName={area.name}
      typeSlug={PROPERTY_TYPE_META[type].slug}
      purpose="RENT"
      title={`${typeName} for Rent in ${area.name}`}
      description={`Find ${typeName.toLowerCase()} for rent in ${area.name}. Compare current listings, monthly rent, size and location on Apna Ghar.`}
    />
  );
}

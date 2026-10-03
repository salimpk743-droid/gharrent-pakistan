import { createFileRoute, notFound } from "@tanstack/react-router";
import { ResultsPage } from "@/components/search/results-page";
import { searchProperties } from "@/lib/server/properties";
import { getSeoArea } from "@/lib/server/locations";
import { parseRentSearch } from "@/lib/rent-search";
import { areaPath, areaRouteSeo } from "@/lib/seo";

export const Route = createFileRoute("/rent/$province/$district/areas/$area")({
  validateSearch: parseRentSearch,
  loaderDeps: ({ search: s }) => s,
  beforeLoad: ({ params }) => {
    const href = areaPath({
      purpose: "RENT",
      province: params.province,
      district: params.district,
      area: params.area,
    });
    if (href !== `/rent/${params.province}/${params.district}/areas/${params.area}`) {
      throw notFound();
    }
  },
  loader: async ({ params, deps }) => {
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
        purpose: "RENT",
      },
    });
    return { data, area };
  },
  head: ({ loaderData, params }) =>
    areaRouteSeo({
      purpose: "RENT",
      provinceSlug: params.province,
      districtSlug: params.district,
      areaSlug: params.area,
      areaName: loaderData?.area.name ?? params.area,
      total: loaderData?.data.total ?? 0,
    }),
  component: Page,
});

function Page() {
  const { data, area } = Route.useLoaderData();
  const { province, district } = Route.useParams();
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
      purpose="RENT"
      title={`Property for Rent in ${area.name}`}
      description={`Browse current properties for rent in ${area.name}. Compare monthly rent, size and location on Apna Ghar.`}
    />
  );
}

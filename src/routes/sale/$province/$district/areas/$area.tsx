import { createFileRoute, notFound } from "@tanstack/react-router";
import { ResultsPage } from "@/components/search/results-page";
import { searchProperties } from "@/lib/server/properties";
import { getSeoArea, listSeoTypeSummaries } from "@/lib/server/locations";
import { areaRouteSeo } from "@/lib/seo";

export const Route = createFileRoute("/sale/$province/$district/areas/$area")({
  validateSearch: ({}) => ({}),
  loader: async ({ params }) => {
    const area = await getSeoArea({
      provinceSlug: params.province,
      districtSlug: params.district,
      areaSlug: params.area,
    });
    if (!area) throw notFound();
    const data = await searchProperties({
      data: {
        provinceSlug: params.province,
        districtSlug: params.district,
        areaSlug: params.area,
        purpose: "SALE",
      },
    });
    const typeSummaries = await listSeoTypeSummaries({ provinceSlug: params.province, districtSlug: params.district, purpose: "SALE", areaSlug: params.area });
    return { data, area, typeSummaries };
  },
  head: ({ loaderData, params }) =>
    areaRouteSeo({
      purpose: "SALE",
      provinceSlug: params.province,
      districtSlug: params.district,
      areaSlug: params.area,
      areaName: loaderData?.area.name ?? params.area,
      total: loaderData?.data.total ?? 0,
    }),
  component: Page,
});

function Page() {
  const { data, area, typeSummaries } = Route.useLoaderData();
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
      purpose="SALE"
      typeSummaries={typeSummaries}
      title={`Property for Sale in ${area.name}`}
      description={`Browse current properties for sale in ${area.name}. Compare asking price, size and location on Apna Ghar.`}
    />
  );
}

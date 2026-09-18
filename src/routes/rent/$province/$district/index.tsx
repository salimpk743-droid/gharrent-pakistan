import { createFileRoute } from "@tanstack/react-router";
import { ResultsPage } from "@/components/search/results-page";
import { searchProperties } from "@/lib/server/properties";
import { typeFromSlug, typeToSlug } from "@/lib/constants";
import { parseRentSearch } from "@/lib/rent-search";
import { searchRouteSeo } from "@/lib/seo";

export const Route = createFileRoute("/rent/$province/$district/")({
  validateSearch: parseRentSearch,
  loaderDeps: ({ search: s }) => s,
  loader: async ({ params, deps }) => {
    const asType = typeFromSlug(params.district);
    if (asType) {
      return searchProperties({
        data: { ...deps, provinceSlug: params.province, typeSlug: params.district, purpose: "RENT" },
      }).then(async (res) => {
        if (res.district) return res;
        return searchProperties({
          data: { ...deps, provinceSlug: params.province, typeSlug: params.district, purpose: "RENT" },
        });
      });
    }
    return searchProperties({
      data: { ...deps, provinceSlug: params.province, districtSlug: params.district, purpose: "RENT" },
    });
  },
  head: ({ loaderData, params }) =>
    searchRouteSeo({
      purpose: "RENT",
      params: { province: params.province, district: params.district },
      data: loaderData,
    }),
  component: Page,
});

function Page() {
  const data = Route.useLoaderData();
  const { province, district } = Route.useParams();
  const typeFromParam = typeFromSlug(district) && !data.district ? district : undefined;
  const typeSlug = typeFromParam || (data.type ? typeToSlug(data.type) : undefined);
  return (
    <ResultsPage
      items={data.items}
      total={data.total}
      page={data.page}
      pageSize={data.pageSize}
      locationLabel={data.locationLabel}
      provinceSlug={province}
      districtSlug={data.district?.slug}
      typeSlug={typeSlug}
      purpose="RENT"
    />
  );
}

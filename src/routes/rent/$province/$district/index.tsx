import { createFileRoute } from "@tanstack/react-router";
import { ResultsPage } from "@/components/search/results-page";
import { searchProperties } from "@/lib/server/properties";
import { typeFromSlug, typeToSlug } from "@/lib/constants";

import { parseRentSearch } from "@/lib/rent-search";

export const Route = createFileRoute("/rent/$province/$district/")({
  validateSearch: parseRentSearch,
  loaderDeps: ({ search: s }) => s,
  loader: async ({ params, deps }) => {
    const asType = typeFromSlug(params.district);
    if (asType) {
      return searchProperties({
        data: { ...deps, provinceSlug: params.province, typeSlug: params.district },
      }).then(async (res) => {
        if (res.district) return res;
        return searchProperties({
          data: { ...deps, provinceSlug: params.province, typeSlug: params.district },
        });
      });
    }
    return searchProperties({
      data: { ...deps, provinceSlug: params.province, districtSlug: params.district },
    });
  },
  head: ({ loaderData, params }) => ({
    meta: [
      {
        title: `Rentals in ${loaderData?.locationLabel || params.district} — GharRent`,
      },
      {
        name: "description",
        content: `Browse rental homes in ${loaderData?.locationLabel || params.district} on GharRent Pakistan.`,
      },
    ],
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
    />
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { ResultsPage } from "@/components/search/results-page";
import { searchProperties } from "@/lib/server/properties";
import { APP_NAME, typeFromSlug, typeToSlug } from "@/lib/constants";
import { parseMarketplaceSearch } from "@/lib/rent-search";

export const Route = createFileRoute("/sale/$province/$district/")({
  validateSearch: parseMarketplaceSearch,
  loaderDeps: ({ search: s }) => s,
  loader: async ({ params, deps }) => {
    const asType = typeFromSlug(params.district);
    if (asType) {
      return searchProperties({
        data: { ...deps, provinceSlug: params.province, typeSlug: params.district, purpose: "SALE" },
      }).then(async (res) => {
        if (res.district) return res;
        return searchProperties({
          data: { ...deps, provinceSlug: params.province, typeSlug: params.district, purpose: "SALE" },
        });
      });
    }
    return searchProperties({
      data: { ...deps, provinceSlug: params.province, districtSlug: params.district, purpose: "SALE" },
    });
  },
  head: ({ loaderData, params }) => ({
    meta: [
      {
        title: `Properties for sale in ${loaderData?.locationLabel || params.district} — ${APP_NAME}`,
      },
      {
        name: "description",
        content: `Browse homes and plots for sale in ${loaderData?.locationLabel || params.district} on Apna Ghar.`,
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
      purpose="SALE"
    />
  );
}

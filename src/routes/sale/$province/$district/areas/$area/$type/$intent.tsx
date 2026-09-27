import { createFileRoute, notFound } from "@tanstack/react-router";
import { ResultsPage } from "@/components/search/results-page";
import { searchProperties } from "@/lib/server/properties";
import { getSeoArea, listSeoIntents } from "@/lib/server/locations";
import { typeFromSlug, PROPERTY_TYPE_META } from "@/lib/constants";
import { parseRentSearch } from "@/lib/rent-search";
import { publicSeo } from "@/lib/seo";
import { parseSeoIntent, seoIntentDescription, seoIntentFilters, seoAreaIntentPath, seoIntentTitle, SEO_AREA_INTENT_MIN_INDEXABLE } from "@/lib/seo-intent";

export const Route = createFileRoute("/sale/$province/$district/areas/$area/$type/$intent")({
  validateSearch: parseRentSearch,
  loaderDeps: ({ search: s }) => s,
  loader: async ({ params, deps }) => {
    const type = typeFromSlug(params.type);
    const intent = parseSeoIntent(params.intent, "SALE");
    if (!type || !intent) throw notFound();
    const area = await getSeoArea({ provinceSlug: params.province, districtSlug: params.district, areaSlug: params.area });
    if (!area) throw notFound();
    const data = await searchProperties({
      data: {
        ...deps,
        provinceSlug: params.province,
        districtSlug: params.district,
        areaSlug: params.area,
        typeSlug: params.type,
        purpose: "SALE",
        ...seoIntentFilters(intent),
      },
    });
    if (data.total < SEO_AREA_INTENT_MIN_INDEXABLE) throw notFound();
    const intents = await listSeoIntents({
      provinceSlug: params.province,
      districtSlug: params.district,
      purpose: "SALE",
      type: params.type,
      areaSlug: params.area,
    });
    return { data, area, type, intent, intents };
  },
  head: ({ loaderData, params }) => {
    const intent = loaderData?.intent;
    const type = loaderData?.type ?? typeFromSlug(params.type);
    if (!intent || !type) return {};
    const place = loaderData?.area.name ?? params.area;
    return publicSeo({
      title: seoIntentTitle({ purpose: "SALE", place, type, intent }),
      description: seoIntentDescription({ purpose: "SALE", place, type, intent }),
      path: seoAreaIntentPath({ purpose: "SALE", province: params.province, district: params.district, area: params.area, type: params.type, intent: params.intent }),
      index: (loaderData?.data.total ?? 0) >= SEO_AREA_INTENT_MIN_INDEXABLE,
    });
  },
  component: Page,
});

function Page() {
  const data = Route.useLoaderData();
  const { province, district, area, type } = Route.useParams();
  return (
    <ResultsPage
      items={data.data.items}
      total={data.data.total}
      page={data.data.page}
      pageSize={data.data.pageSize}
      locationLabel={data.data.locationLabel}
      provinceSlug={province}
      districtSlug={district}
      areaSlug={area}
      areaName={data.area.name}
      typeSlug={PROPERTY_TYPE_META[type].slug}
      purpose="SALE"
      title={seoIntentTitle({ purpose: "SALE", place: data.area.name, type: data.type, intent: data.intent })}
      description={seoIntentDescription({ purpose: "SALE", place: data.area.name, type: data.type, intent: data.intent })}
      intents={data.intents}
    />
  );
}

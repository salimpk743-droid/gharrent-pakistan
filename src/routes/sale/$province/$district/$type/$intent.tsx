import { createFileRoute, notFound } from "@tanstack/react-router";
import { ResultsPage } from "@/components/search/results-page";
import { searchProperties } from "@/lib/server/properties";
import { typeFromSlug } from "@/lib/constants";
import { parseMarketplaceSearch } from "@/lib/rent-search";
import { assertCanonicalMarketplacePath, publicSeo } from "@/lib/seo";
import { parseSeoIntent, seoIntentDescription, seoIntentFilters, seoIntentPath, seoIntentTitle, SEO_INTENT_MIN_INDEXABLE } from "@/lib/seo-intent";

export const Route = createFileRoute("/sale/$province/$district/$type/$intent")({
  validateSearch: parseRentSearch,
  loaderDeps: ({ search: s }) => s,
  beforeLoad: ({ params }) => {
    assertCanonicalMarketplacePath({
      purpose: "SALE",
      province: params.province,
      district: params.district,
      type: params.type,
    });
    if (!parseSeoIntent(params.intent, "SALE") || !typeFromSlug(params.type)) throw notFound();
  },
  loader: async ({ params, deps }) => {
    const intent = parseSeoIntent(params.intent, "SALE");
    const type = typeFromSlug(params.type);
    if (!intent || !type) throw notFound();
    const data = await searchProperties({
      data: {
        ...deps,
        ...seoIntentFilters(intent),
        provinceSlug: params.province,
        districtSlug: params.district,
        typeSlug: params.type,
        purpose: "SALE",
      },
    });
    if (!data.province || !data.district) throw notFound();
    return { ...data, intent, type };
  },
  head: ({ loaderData, params }) => {
    const intent = loaderData?.intent;
    const type = loaderData?.type ?? typeFromSlug(params.type);
    if (!intent || !type) return {};
    const place = loaderData?.district?.name ?? params.district.replaceAll("-", " ");
    return publicSeo({
      title: seoIntentTitle({ purpose: "SALE", place, type, intent }),
      description: seoIntentDescription({ purpose: "SALE", place, type, intent }),
      path: seoIntentPath({ purpose: "SALE", province: params.province, district: params.district, type: params.type, intent: params.intent }),
      index: (loaderData?.total ?? 0) >= SEO_INTENT_MIN_INDEXABLE,
    });
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

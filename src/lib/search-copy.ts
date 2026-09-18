import { APP_NAME, canonicalTypeSlug, type ListingPurpose } from "./constants.ts";

export type SearchPageCopy = {
  title: string;
  h1: string;
  description: string;
  intro: string;
};

function copyKey(opts: {
  purpose: ListingPurpose;
  province?: string;
  district?: string;
  type?: string;
}): string {
  const type = opts.type ? canonicalTypeSlug(opts.type) || opts.type : "";
  return `${opts.purpose}|${opts.province || ""}|${opts.district || ""}|${type}`;
}

/**
 * First-batch keyword copy for a few live city/type pages.
 * Other marketplace pages keep the generic title/H1 builders.
 */
const SEARCH_PAGE_COPY: Record<string, SearchPageCopy> = {
  "RENT|punjab|lahore|": {
    title: `Property for Rent in Lahore | ${APP_NAME}`,
    h1: "Property for Rent in Lahore",
    description:
      "Browse houses, flats and rooms for rent in Lahore. Compare monthly rent, size and location on Apna Ghar, then contact the advertiser.",
    intro:
      "Browse property for rent in Lahore, including houses, flats and rooms. Current listings are in Johar Town, Gulberg and DHA Phase 5. Compare monthly rent, size and location, then contact the advertiser to arrange a visit.",
  },
  "RENT|punjab|lahore|houses": {
    title: `Houses for Rent in Lahore | ${APP_NAME}`,
    h1: "Houses for Rent in Lahore",
    description:
      "Find houses for rent in Lahore, including a 5 marla home in Johar Town. Compare rent and size on Apna Ghar, then contact the advertiser.",
    intro:
      "Search houses for rent in Lahore. There is currently a 5 marla family house listed in Johar Town. Compare rent and size, then contact the advertiser to visit.",
  },
  "RENT|punjab|lahore|apartments": {
    title: `Flats for Rent in Lahore | ${APP_NAME}`,
    h1: "Flats for Rent in Lahore",
    description:
      "Find flats for rent in Lahore, including apartments in Gulberg. Compare monthly rent and location on Apna Ghar, then contact the advertiser.",
    intro:
      "Search flats for rent in Lahore, including apartments in established neighbourhoods. There is currently a flat listed in Gulberg. Compare monthly rent and location, then contact the advertiser.",
  },
  "RENT|islamabad-capital-territory|islamabad|houses": {
    title: `Houses for Rent in Islamabad | ${APP_NAME}`,
    h1: "Houses for Rent in Islamabad",
    description:
      "Find houses for rent in Islamabad, including a 1 kanal home in F-7. Compare rent and size on Apna Ghar, then contact the advertiser.",
    intro:
      "Search houses for rent in Islamabad, including family homes in the city's sectors. There is currently a 1 kanal house listed in F-7. Compare rent and size, then contact the advertiser to arrange a viewing.",
  },
};

export function searchPageCopy(opts: {
  purpose: ListingPurpose;
  province?: string;
  district?: string;
  type?: string;
}): SearchPageCopy | undefined {
  return SEARCH_PAGE_COPY[copyKey(opts)];
}

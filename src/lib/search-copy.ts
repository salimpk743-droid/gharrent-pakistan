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
 * Keyword copy for live city/type pages with real inventory.
 * Other marketplace pages keep the generic title/H1 builders.
 */
const SEARCH_PAGE_COPY: Record<string, SearchPageCopy> = {
  "RENT|punjab|lahore|": {
    title: `Property for Rent in Lahore | ${APP_NAME}`,
    h1: "Property for Rent in Lahore",
    description:
      "Browse houses, flats and rooms for rent in Lahore. Compare monthly rent, size and location on Apna Ghar, then contact the advertiser.",
    intro:
      "Use this Lahore rental search to browse available houses, flats and rooms by location, size and monthly rent. When listings are available, compare the details and contact the advertiser to arrange a visit.",
  },
  "RENT|punjab|lahore|houses": {
    title: `Houses for Rent in Lahore | ${APP_NAME}`,
    h1: "Houses for Rent in Lahore",
    description:
      "Find houses for rent in Lahore. Compare monthly rent, size and location on Apna Ghar.",
    intro:
      "Search houses for rent in Lahore. Compare available houses in Lahore by monthly rent, size and location, then contact the advertiser directly when a suitable property is available.",
  },
  "RENT|punjab|lahore|apartments": {
    title: `Flats for Rent in Lahore | ${APP_NAME}`,
    h1: "Flats for Rent in Lahore",
    description:
      "Find flats for rent in Lahore. Compare monthly rent, size and location on Apna Ghar.",
    intro:
      "Search flats for rent in Lahore, including apartments in established neighbourhoods. Compare available flats in Lahore by monthly rent, size and location, then contact the advertiser directly when a suitable property is available.",
  },
  "RENT|islamabad-capital-territory|islamabad|houses": {
    title: `Houses for Rent in Islamabad | ${APP_NAME}`,
    h1: "Houses for Rent in Islamabad",
    description:
      "Find houses for rent in Islamabad, including a 1 kanal home in F-7. Compare rent and size on Apna Ghar, then contact the advertiser.",
    intro:
      "Search houses for rent in Islamabad, including family homes in the city's sectors. There is currently a 1 kanal house listed in F-7. Compare rent and size, then contact the advertiser to arrange a viewing.",
  },
  "RENT|khyber-pakhtunkhwa|peshawar|": {
    title: `Property for Rent in Peshawar | ${APP_NAME}`,
    h1: "Property for Rent in Peshawar",
    description:
      "Browse property for rent in Peshawar, including a 10 marla family house in University Town. Compare monthly rent, size and location on Apna Ghar, then contact the advertiser.",
    intro:
      "Browse property for rent in Peshawar. There is currently a 10 marla family house listed in University Town. Compare monthly rent, size and location, then contact the advertiser to arrange a visit.",
  },
  "RENT|khyber-pakhtunkhwa|peshawar|houses": {
    title: `Houses for Rent in Peshawar | ${APP_NAME}`,
    h1: "Houses for Rent in Peshawar",
    description:
      "Find houses for rent in Peshawar, including a 10 marla home in University Town. Compare rent and size on Apna Ghar, then contact the advertiser.",
    intro:
      "Search houses for rent in Peshawar. There is currently a 10 marla family house listed in University Town. Compare rent and size, then contact the advertiser to visit.",
  },
  "RENT|punjab|faisalabad|": {
    title: `Property for Rent in Faisalabad | ${APP_NAME}`,
    h1: "Property for Rent in Faisalabad",
    description:
      "Browse property for rent in Faisalabad, including a first-floor portion in Madina Town. Compare monthly rent, size and location on Apna Ghar, then contact the advertiser.",
    intro:
      "Browse property for rent in Faisalabad. There is currently a 5 marla first-floor portion listed in Madina Town. Compare monthly rent, size and location, then contact the advertiser to arrange a visit.",
  },
  "RENT|punjab|faisalabad|portions": {
    title: `Portions for Rent in Faisalabad | ${APP_NAME}`,
    h1: "Portions for Rent in Faisalabad",
    description:
      "Find portions for rent in Faisalabad, including a first-floor portion in Madina Town. Compare rent and size on Apna Ghar, then contact the advertiser.",
    intro:
      "Search portions for rent in Faisalabad. There is currently a 5 marla first-floor portion listed in Madina Town. Compare rent and size, then contact the advertiser to visit.",
  },
  "RENT|punjab|multan|": {
    title: `Property for Rent in Multan | ${APP_NAME}`,
    h1: "Property for Rent in Multan",
    description:
      "Browse property for rent in Multan, including a 7 marla family house in Gulgasht Colony. Compare monthly rent, size and location on Apna Ghar, then contact the advertiser.",
    intro:
      "Browse property for rent in Multan. There is currently a 7 marla family house listed in Gulgasht Colony. Compare monthly rent, size and location, then contact the advertiser to arrange a visit.",
  },
  "RENT|punjab|multan|houses": {
    title: `Houses for Rent in Multan | ${APP_NAME}`,
    h1: "Houses for Rent in Multan",
    description:
      "Find houses for rent in Multan, including a 7 marla home in Gulgasht Colony. Compare rent and size on Apna Ghar, then contact the advertiser.",
    intro:
      "Search houses for rent in Multan. There is currently a 7 marla family house listed in Gulgasht Colony. Compare rent and size, then contact the advertiser to visit.",
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

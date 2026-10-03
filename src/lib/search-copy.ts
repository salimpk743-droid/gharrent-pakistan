import { APP_NAME, canonicalTypeSlug, type ListingPurpose } from "./constants.ts";

export type SearchPageCopy = {
  title: string;
  h1: string;
  description: string;
  intro: string;
  landingContent?: { heading: string; paragraphs: string[] };
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
 * Keyword copy for city/type pages. Copy must stay true whether or not the
 * page has inventory: never name a specific listing that may not exist.
 * Other marketplace pages keep the generic title/H1 builders.
 */
const SEARCH_PAGE_COPY: Record<string, SearchPageCopy> = {
  "RENT|punjab|lahore|": {
    title: `Property for Rent in Lahore | ${APP_NAME}`,
    h1: "Property for Rent in Lahore",
    description:
      "Browse houses, flats and rooms for rent in Lahore. Compare monthly rent, size and location on Apna Ghar, then contact the advertiser.",
    intro:
      "Use this Lahore rental search to browse houses, flats and rooms by location, size and monthly rent. When listings are published, compare the details and contact the advertiser to arrange a visit.",
    landingContent: {
      heading: "Renting property in Lahore",
      paragraphs: [
        "Lahore has a broad residential rental market, with houses, flats, portions and rooms available across different neighbourhoods and budgets. This page is the canonical Apna Ghar starting point for people searching for property to rent in Lahore.",
        "Use the search controls to narrow Lahore rentals by property type, monthly rent, bedrooms, bathrooms, size and other available filters. Published listings can change as advertisers add, update or remove properties, so the results shown here reflect the current public inventory.",
        "If you are specifically looking for a house, use the houses-for-rent page to keep the search focused. For practical guidance on inspections, rent terms and what to put in writing, read the Apna Ghar guide to renting a house in Pakistan.",
      ],
    },
  },
  "RENT|punjab|lahore|houses": {
    title: `Houses for Rent in Lahore | ${APP_NAME}`,
    h1: "Houses for Rent in Lahore",
    description:
      "Find houses for rent in Lahore. Compare monthly rent, size and location on Apna Ghar.",
    intro:
      "Search houses for rent in Lahore by monthly rent, size and location. Published inventory changes as advertisers add and remove properties.",
    landingContent: {
      heading: "Houses for rent in Lahore",
      paragraphs: [
        "This is the dedicated Apna Ghar landing page for houses for rent in Lahore. Use it to compare published house listings by monthly rent, property size and location when inventory is available.",
        "Lahore rental searches can cover different residential neighbourhoods, house sizes and budgets. Use the filters above to narrow the results instead of relying on a single area or price range.",
        "Property inventory changes over time. When no published house matches the current search, you can broaden the location or budget, return to all Lahore rentals, or check again after new advertisers publish properties.",
      ],
    },
  },
  "RENT|punjab|lahore|apartments": {
    title: `Flats for Rent in Lahore | ${APP_NAME}`,
    h1: "Flats for Rent in Lahore",
    description:
      "Find flats for rent in Lahore. Compare monthly rent, size and location on Apna Ghar.",
    intro:
      "Search flats for rent in Lahore and compare published apartments by monthly rent, size and location.",
    landingContent: {
      heading: "Flats for rent in Lahore",
      paragraphs: [
        "This Apna Ghar page is the dedicated search landing page for flats and apartments for rent in Lahore. Use the available filters to compare published listings by rent, size, bedrooms, bathrooms and location.",
        "Rental inventory changes as advertisers publish and remove properties. If a particular search is empty, broaden the budget, property type or location filters and return to the main Lahore rental page for more options.",
      ],
    },
  },
  "RENT|islamabad-capital-territory|islamabad|houses": {
    title: `Houses for Rent in Islamabad | ${APP_NAME}`,
    h1: "Houses for Rent in Islamabad",
    description:
      "Find houses for rent in Islamabad. Compare monthly rent, size and sector on Apna Ghar, then contact the advertiser.",
    intro:
      "Search houses for rent in Islamabad by sector, size and monthly rent. Published inventory changes as advertisers add and remove properties, so check back or broaden your search if nothing matches yet.",
  },
  "RENT|khyber-pakhtunkhwa|peshawar|": {
    title: `Property for Rent in Peshawar | ${APP_NAME}`,
    h1: "Property for Rent in Peshawar",
    description:
      "Browse property for rent in Peshawar. Compare monthly rent, size and location on Apna Ghar, then contact the advertiser.",
    intro:
      "Browse houses and other property for rent in Peshawar. Compare monthly rent, size and location, then contact the advertiser to arrange a visit.",
  },
  "RENT|khyber-pakhtunkhwa|peshawar|houses": {
    title: `Houses for Rent in Peshawar | ${APP_NAME}`,
    h1: "Houses for Rent in Peshawar",
    description:
      "Find houses for rent in Peshawar. Compare rent and size on Apna Ghar, then contact the advertiser.",
    intro:
      "Search houses for rent in Peshawar by size, location and monthly rent, then contact the advertiser to visit.",
  },
  "RENT|punjab|faisalabad|": {
    title: `Property for Rent in Faisalabad | ${APP_NAME}`,
    h1: "Property for Rent in Faisalabad",
    description:
      "Browse property for rent in Faisalabad. Compare monthly rent, size and location on Apna Ghar, then contact the advertiser.",
    intro:
      "Browse portions and other property for rent in Faisalabad. Compare monthly rent, size and location, then contact the advertiser to arrange a visit.",
  },
  "RENT|punjab|faisalabad|portions": {
    title: `Portions for Rent in Faisalabad | ${APP_NAME}`,
    h1: "Portions for Rent in Faisalabad",
    description:
      "Find portions for rent in Faisalabad. Compare rent and size on Apna Ghar, then contact the advertiser.",
    intro:
      "Search upper and lower portions for rent in Faisalabad by size, location and monthly rent, then contact the advertiser to visit.",
  },
  "RENT|punjab|multan|": {
    title: `Property for Rent in Multan | ${APP_NAME}`,
    h1: "Property for Rent in Multan",
    description:
      "Browse property for rent in Multan. Compare monthly rent, size and location on Apna Ghar, then contact the advertiser.",
    intro:
      "Browse houses and other property for rent in Multan. Compare monthly rent, size and location, then contact the advertiser to arrange a visit.",
  },
  "RENT|punjab|multan|houses": {
    title: `Houses for Rent in Multan | ${APP_NAME}`,
    h1: "Houses for Rent in Multan",
    description:
      "Find houses for rent in Multan. Compare rent and size on Apna Ghar, then contact the advertiser.",
    intro:
      "Search houses for rent in Multan by size, location and monthly rent, then contact the advertiser to visit.",
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

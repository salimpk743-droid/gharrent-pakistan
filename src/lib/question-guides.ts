export type Inline = string | { href: string; label: string; external?: boolean };

export type GuideSection = {
  heading: string;
  paragraphs?: Inline[][];
  bullets?: Inline[][];
};

export type QuestionGuide = {
  slug: string;
  title: string;
  h1: string;
  description: string;
  eyebrow: string;
  updatedLabel: string;
  updatedIso: string;
  direct: Inline[][];
  sections: GuideSection[];
  faqs: { q: string; a: Inline[] }[];
  sources: { label: string; url: string }[];
  related: { href: string; label: string }[];
};

const UPDATED_LABEL = "1 October 2026";
const UPDATED_ISO = "2026-10-01";

const PROFIT = {
  label: "Profit by Pakistan Today, 14 July 2026 — Lahore house rents by March 2026",
  url: "https://profit.pakistantoday.com.pk/2026/07/14/lahores-rising-rent-forces-middle-class-families-out-of-central-neighbourhoods",
};
const CONNECT = {
  label: "Pakistan Connect, 2 August 2026 — reported asking rents for houses in Lahore",
  url: "https://thepakistanconnect.com/house-for-rent-in-lahore/",
};
const MIX = {
  label: "mix.com.pk, 9 April 2026 — one publisher’s property-price ranges, not an official index",
  url: "https://mix.com.pk/blog/property-prices-pakistan-2026-complete-guide",
};
const TIME2RENT = {
  label: "time2rent.net, 2026 — house and portion rents in Islamabad",
  url: "https://time2rent.net/house-for-rent-in-islamabad-2026-best-areas-prices-and-how-to-find-the-right-one/",
};
const FILES = {
  label: "Lahore Real Estate, 29 September 2026 — DHA Lahore file rates, not built-house prices",
  url: "https://lahorerealestate.com/latest-dha-file-rates-market-overview-september-29-2026/",
};
const SCHEME = { href: "https://apnaghar.gov.pk/", label: "apnaghar.gov.pk", external: true as const };

const CITY_LABELS: Record<string, string> = {
  lahore: "Lahore",
  karachi: "Karachi",
  islamabad: "Islamabad",
  rawalpindi: "Rawalpindi",
};

export function affordableGuidePath(districtSlug: string | undefined, purpose: "RENT" | "SALE"): string {
  const city = districtSlug && CITY_LABELS[districtSlug] ? districtSlug : "pakistan";
  const verb = purpose === "SALE" ? "buy" : "rent";
  return `/guides/where-can-i-${verb}-an-affordable-home-in-${city}`;
}

export function affordableGuideLabel(districtSlug: string | undefined, purpose: "RENT" | "SALE"): string {
  const city = districtSlug && CITY_LABELS[districtSlug] ? CITY_LABELS[districtSlug] : "Pakistan";
  const verb = purpose === "SALE" ? "buy" : "rent";
  return `where to ${verb} an affordable home in ${city}`;
}

function paySection(city: string, buying = false): GuideSection {
  return {
    heading: buying ? `Before you pay for a property in ${city}` : `Before you pay rent in ${city}`,
    paragraphs: [
      ["These pages do not quote a price for you. A reported range is not the rent or sale price of the house you are about to see."],
      buying
        ? [
            "Visit the property, then check who can sell it. For the document checks, use ",
            { href: "/guides/buying/property-buying-due-diligence-pakistan", label: "property buying due diligence" },
            " and ",
            { href: "/guides/buying/how-to-buy-property-in-pakistan", label: "how to buy property in Pakistan" },
            ". In Punjab, also read ",
            { href: "/guides/buying/fard-registry-intiqal-punjab", label: "fard, registry and intiqal" },
            ".",
          ]
        : [
            "Visit the house, flat or portion. Ask who is allowed to rent it. Put the rent, the deposit, the bills and who pays for repairs in writing. Read ",
            { href: "/guides/landlords/security-deposit-rent-terms-pakistan", label: "security deposit and rent terms" },
            " before you treat a demand as normal. This guide does not state a legal deposit limit.",
          ],
      [
        "Do not transfer a large amount before you have seen the property and the person dealing with it. Use ",
        { href: "/safety", label: "the safety checks" },
        buying ? "." : ", and the step-by-step ",
        ...(buying
          ? []
          : [{ href: "/how-to-rent-a-house-in-pakistan", label: "how to rent a house in Pakistan" }, "."]),
      ],
    ],
  };
}

function notTheScheme(): Inline[] {
  return [
    "Apna Ghar on this website is a private marketplace for homes to rent or buy. It is not the government housing-loan scheme at ",
    SCHEME,
    ".",
  ];
}

const lahoreRent: QuestionGuide = {
  slug: "where-can-i-rent-an-affordable-home-in-lahore",
  title: "Where Can I Rent an Affordable Home in Lahore? | Apna Ghar",
  h1: "Where can I rent an affordable home in Lahore?",
  description:
    "House for rent in Lahore in 2026: reported asking ranges for 2 marla, 3 marla and 5 marla homes in Johar Town, DHA, Bahria Town, Wapda Town and smaller central areas. Not a price quote.",
  eyebrow: "QUESTION GUIDE",
  updatedLabel: UPDATED_LABEL,
  updatedIso: UPDATED_ISO,
  direct: [
    notTheScheme(),
    [
      "Start with a smaller house, not the neighbourhood average. Profit by Pakistan Today reported on 14 July 2026 that by March 2026 average house rents were about Rs 281,000 in DHA, more than Rs 600,000 in Gulberg, about Rs 224,000 in Johar Town and about Rs 165,000 in Bahria Town. The same report put 2-marla houses in Faisal Town, Iqbal Town, Samanabad and Muslim Town at Rs 25,000–35,000 a month, and 3-marla houses at Rs 60,000–75,000. Those smaller homes are the published lower band. The DHA and Gulberg averages are not a 5 marla rent.",
    ],
  ],
  sections: [
    {
      heading: "House for rent in Lahore: what “affordable” means in 2026",
      paragraphs: [
        [
          "There is no official affordable-rent line for Lahore. A 2-marla or 3-marla house, or a portion of a house, is what people on a lower budget usually search. A full house in DHA or Gulberg is a different market. Compare size, street and what the rent includes before you treat two ads as the same home.",
        ],
        [
          "For the difference between a house, a flat and a portion, see ",
          { href: "/guides/renting/house-vs-flat-vs-portion-pakistan", label: "house vs flat vs portion" },
          ".",
        ],
      ],
    },
    {
      heading: "5 marla house for rent in Lahore",
      paragraphs: [
        [
          "Pakistan Connect, on 2 August 2026, reported these asking rents. They are that publisher’s figures, not a quote from Apna Ghar, and the same article also lists much higher rents for large kanal houses:",
        ],
      ],
      bullets: [
        ["Johar Town, 5 marla: about Rs 110,000–130,000 a month."],
        ["DHA Phase 9 Town, 5 marla: around Rs 110,000 a month."],
        ["Some DHA 5 marla houses, including Phase 7: from about Rs 150,000 a month."],
        ["Bahria Town, 8 marla: around Rs 200,000. Bahria overseas block, 10 marla: about Rs 140,000–150,000."],
        ["Wapda Town, 10 marla: about Rs 160,000–180,000."],
        ["Paragon City, 6 marla: around Rs 85,000. Khayaban-e-Amin, a 5 marla double-storey house: around Rs 65,000."],
      ],
    },
    {
      heading: "Where lower-cost homes are being searched",
      paragraphs: [
        [
          "The July news report said 2-marla rents of Rs 25,000–35,000 and 3-marla rents of Rs 60,000–75,000 were in Faisal Town, Iqbal Town, Samanabad and Muslim Town. It also said households were moving outward to LDA Avenue, Raiwind Road, Jubilee Town and Bahria Orchard. This guide does not invent rents for those outer areas. Check the commute, water and the street, then compare a live listing.",
        ],
        [
          "Profit also said some DHA 5 marla houses were above Rs 100,000 and some 1-kanal DHA houses were Rs 300,000–400,000. That is why a DHA average near Rs 281,000 cannot be read as the rent of a small house.",
        ],
      ],
    },
    {
      heading: "Areas people type into a Lahore rent search",
      bullets: [
        ["Lower published bands: Faisal Town, Iqbal Town, Samanabad, Muslim Town."],
        ["Mid-size houses in the August report: Johar Town, DHA Phase 9 Town, Paragon City, Khayaban-e-Amin, Wapda Town, Bahria Town."],
        ["Higher reported averages: DHA phases with larger houses, and Gulberg."],
        ["Named as outward options, without a rent figure here: LDA Avenue, Raiwind Road, Jubilee Town, Bahria Orchard."],
      ],
    },
    paySection("Lahore"),
    {
      heading: "See what is actually listed",
      paragraphs: [
        [
          "Open ",
          { href: "/rent/punjab/lahore", label: "houses and flats for rent in Lahore" },
          ". Area pages such as ",
          { href: "/rent/punjab/lahore/areas/dha", label: "DHA Lahore" },
          ", ",
          { href: "/rent/punjab/lahore/areas/johar-town", label: "Johar Town" },
          " and ",
          { href: "/rent/punjab/lahore/areas/faisal-town", label: "Faisal Town" },
          " only show a home after a landlord publishes it. An empty page is not a hidden price list.",
        ],
      ],
    },
  ],
  faqs: [
    {
      q: "Where can I find a cheap house for rent in Lahore?",
      a: [
        "The lowest house band in the 14 July 2026 Profit report was a 2-marla house at Rs 25,000–35,000 in Faisal Town, Iqbal Town, Samanabad and Muslim Town. A 3-marla house in those areas was reported at Rs 60,000–75,000. That is not a DHA or Gulberg house.",
      ],
    },
    {
      q: "What is the rent of a 5 marla house in Lahore in 2026?",
      a: [
        "Pakistan Connect on 2 August 2026 reported about Rs 110,000–130,000 in Johar Town, around Rs 110,000 in DHA Phase 9 Town, and from about Rs 150,000 for some DHA 5 marla houses. A single 5 marla figure for the whole city would be wrong.",
      ],
    },
    {
      q: "Is Gulberg’s average rent the rent of a normal house?",
      a: [
        "No. Profit reported Gulberg’s average house rent at more than Rs 600,000 by March 2026. The same report’s 2-marla and 3-marla figures are far lower. Ask for the plot size before you compare an ad with an average.",
      ],
    },
    {
      q: "Which Lahore areas are people moving to when the centre gets too expensive?",
      a: [
        "Profit named LDA Avenue, Raiwind Road, Jubilee Town and Bahria Orchard. Use them as search areas, not as a promised cheap rent. No rent for those four places is repeated on this page because the report did not give one.",
      ],
    },
  ],
  sources: [PROFIT, CONNECT],
  related: [
    { href: "/guides/where-can-i-buy-an-affordable-home-in-lahore", label: "Where can I buy an affordable home in Lahore?" },
    { href: "/guides/cities/lahore", label: "Lahore property and rental guide" },
    { href: "/guides/where-can-i-rent-an-affordable-home-in-pakistan", label: "Affordable rent across Pakistan" },
    { href: "/rent/punjab/lahore", label: "Current Lahore rentals" },
  ],
};

const karachiRent: QuestionGuide = {
  slug: "where-can-i-rent-an-affordable-home-in-karachi",
  title: "Where Can I Rent an Affordable Home in Karachi? | Apna Ghar",
  h1: "Where can I rent an affordable home in Karachi?",
  description:
    "Flat for rent in Karachi and lower-cost houses in 2026: reported asking ranges outside the city centre, in the city centre, and for DHA and Clifton houses. One publisher’s ranges, not a quote.",
  eyebrow: "QUESTION GUIDE",
  updatedLabel: UPDATED_LABEL,
  updatedIso: UPDATED_ISO,
  direct: [
    notTheScheme(),
    [
      "For a lower monthly rent in Karachi, look at a small flat outside the city centre or a portion, not a house in DHA or Clifton. mix.com.pk, in a 9 April 2026 blog, put a 1-bedroom apartment outside the city centre at Rs 25,000–50,000 a month, a 1-bedroom in the city centre at Rs 40,000–70,000, and a 3-bedroom in the city centre at Rs 80,000–150,000. The same blog put a house in DHA or Clifton at Rs 150,000–500,000. Those are one publisher’s ranges. They are not official statistics and not an Apna Ghar quote.",
    ],
  ],
  sections: [
    {
      heading: "Flat for rent in Karachi",
      paragraphs: [
        [
          "The April blog did not pin the Rs 25,000–50,000 band to one neighbourhood. It said “outside the city centre”. Do not assume Gulistan-e-Johar, North Nazimabad or Scheme 33 all cost the same. Use the band only as a starting point, then compare the building, the floor, parking, water and the generator bill.",
        ],
      ],
      bullets: [
        ["1-bedroom, outside the city centre: Rs 25,000–50,000 a month."],
        ["1-bedroom, city centre: Rs 40,000–70,000 a month."],
        ["3-bedroom, city centre: Rs 80,000–150,000 a month."],
        ["House in DHA or Clifton: Rs 150,000–500,000 a month. That is the expensive end of this blog, not an affordable house."],
      ],
    },
    {
      heading: "Areas to search for a house or portion for rent",
      paragraphs: [
        [
          "These are commonly searched residential areas on Apna Ghar. This page does not assign the blog’s rent bands to a named block, because the blog did not:",
        ],
      ],
      bullets: [
        ["Gulistan-e-Johar, Gulshan-e-Iqbal, North Nazimabad, Nazimabad and Federal B Area."],
        ["North Karachi, Gulshan-e-Maymar, Surjani Town, Scheme 33 and Malir."],
        ["Korangi, Landhi and Orangi Town, where the right street matters more than the area name."],
        ["Clifton and DHA when the budget is the higher house band above, not the 1-bedroom band."],
      ],
    },
    {
      heading: "House for rent in Karachi versus a portion",
      paragraphs: [
        [
          "A full house in DHA or Clifton was reported far above a 1-bedroom flat. A portion can sit between the two, but this page will not invent a portion rent. Read ",
          { href: "/guides/renting/house-vs-flat-vs-portion-pakistan", label: "house vs flat vs portion" },
          " and then compare listings of the same size.",
        ],
      ],
    },
    paySection("Karachi"),
    {
      heading: "See what is actually listed",
      paragraphs: [
        [
          "Open ",
          { href: "/rent/sindh/karachi", label: "property for rent in Karachi" },
          ", including ",
          { href: "/rent/sindh/karachi/areas/dha", label: "DHA Karachi" },
          ", ",
          { href: "/rent/sindh/karachi/areas/gulistan-e-johar", label: "Gulistan-e-Johar" },
          " and ",
          { href: "/rent/sindh/karachi/areas/north-nazimabad", label: "North Nazimabad" },
          ". Empty results mean no landlord has published a home there yet.",
        ],
      ],
    },
  ],
  faqs: [
    {
      q: "Where can I rent a cheap flat in Karachi?",
      a: [
        "The lowest band in the 9 April 2026 mix.com.pk blog was a 1-bedroom outside the city centre at Rs 25,000–50,000 a month. The blog did not name the blocks inside that band. Compare live ads rather than treating Rs 25,000 as a city-wide rent.",
      ],
    },
    {
      q: "How much is a house for rent in DHA Karachi?",
      a: [
        "The same blog put a house in DHA or Clifton at Rs 150,000–500,000 a month. Phase, size and condition move a house inside that wide range. It is not the affordable end of the Karachi market.",
      ],
    },
    {
      q: "Are these Karachi rents official?",
      a: [
        "No. They come from one publisher’s 9 April 2026 article. Asking rents change by building and by month. Apna Ghar is not promising that a home is available at these figures.",
      ],
    },
  ],
  sources: [MIX],
  related: [
    { href: "/guides/where-can-i-buy-an-affordable-home-in-karachi", label: "Where can I buy an affordable home in Karachi?" },
    { href: "/guides/cities/karachi", label: "Karachi property and rental guide" },
    { href: "/rent/sindh/karachi", label: "Current Karachi rentals" },
  ],
};

const islamabadRent: QuestionGuide = {
  slug: "where-can-i-rent-an-affordable-home-in-islamabad",
  title: "Where Can I Rent an Affordable Home in Islamabad? | Apna Ghar",
  h1: "Where can I rent an affordable home in Islamabad?",
  description:
    "House for rent in Islamabad in 2026: reported rents for Bahria Town 5 marla houses, G-11 and G-13 portions, PWD, and the higher F-6 and F-7 bands. Sources named. Not a quote.",
  eyebrow: "QUESTION GUIDE",
  updatedLabel: UPDATED_LABEL,
  updatedIso: UPDATED_ISO,
  direct: [
    notTheScheme(),
    [
      "In Islamabad, a lower budget usually means a portion or a 5 marla house in Bahria Town, not a house in F-6 or F-7. A 2026 guide on time2rent.net put Bahria Phase 8 5 marla houses at Rs 50,000–70,000 a month and Bahria Phase 4 and Phase 7 5 marla houses at Rs 65,000–90,000. It put an upper portion in G-11 or G-13 at Rs 35,000–60,000, and a full house there at Rs 80,000–160,000. F-6 and F-7 houses were Rs 200,000–500,000 or more.",
    ],
  ],
  sections: [
    {
      heading: "House for rent in Islamabad: reported 2026 bands",
      paragraphs: [
        [
          "time2rent.net described these as 2026 market rents and said they vary with the exact location, construction and furnishing. The page said furnishing can add about 25–40%. They are not Apna Ghar quotes.",
        ],
      ],
      bullets: [
        ["Bahria Town Phase 8, 5 marla: Rs 50,000–70,000. Phase 4 and Phase 7, 5 marla: Rs 65,000–90,000."],
        ["Bahria Phase 8, 10 marla: Rs 100,000–155,000. Phase 4 and 7, 10 marla: Rs 130,000–200,000."],
        ["DHA Islamabad, 5 marla: Rs 80,000–120,000. 10 marla: Rs 150,000–250,000."],
        ["G-11 and G-13 upper portion: Rs 35,000–60,000. Full house: Rs 80,000–160,000."],
        ["F-8 and F-10 upper portion: Rs 55,000–100,000. House: Rs 130,000–280,000."],
        ["F-6 and F-7 upper portion: Rs 80,000–150,000. House: Rs 200,000–500,000 or more."],
      ],
    },
    {
      heading: "Flat for rent in G-11, G-13, Bahria and PWD",
      paragraphs: [
        [
          "mix.com.pk, on 9 April 2026, listed flats in G-11 and G-13 at Rs 40,000–90,000 a month, and Bahria Town and PWD at Rs 25,000–60,000 a month. That blog did not call the Bahria and PWD band a full house. The time2rent 5 marla house bands above are higher. When two publishers disagree, use both as context and judge the actual listing. The same April blog put F-6 and F-7 houses at Rs 200,000–600,000, which overlaps the time2rent house band.",
        ],
      ],
    },
    {
      heading: "Where to look if F-6 and F-7 are out of reach",
      bullets: [
        ["A portion in G-11 or G-13 is the lowest full set of figures in the time2rent table."],
        ["A 5 marla house in Bahria Phase 8 is the lowest full-house band in that table."],
        ["PWD is in the April blog’s Rs 25,000–60,000 line. Confirm whether the ad is a flat, a portion or a house."],
        ["DHA Islamabad 5 marla was reported at Rs 80,000–120,000, above the Bahria Phase 8 5 marla band."],
        ["F-6, F-7, F-8 and F-10 are the higher bands. They are the wrong search if the budget is a portion."],
      ],
    },
    paySection("Islamabad"),
    {
      heading: "See what is actually listed",
      paragraphs: [
        [
          "Open ",
          { href: "/rent/islamabad-capital-territory/islamabad", label: "houses for rent in Islamabad" },
          ", including ",
          { href: "/rent/islamabad-capital-territory/islamabad/areas/g-11", label: "G-11" },
          ", ",
          { href: "/rent/islamabad-capital-territory/islamabad/areas/bahria-town", label: "Bahria Town" },
          " and ",
          { href: "/rent/islamabad-capital-territory/islamabad/areas/dha", label: "DHA Islamabad" },
          ". Bahria Town and DHA also appear in Rawalpindi searches. Confirm which district the house is in.",
        ],
      ],
    },
  ],
  faqs: [
    {
      q: "Where can I rent a house in Islamabad on a smaller budget?",
      a: [
        "The lowest full-house band on the 2026 time2rent.net page was Bahria Phase 8, 5 marla, at Rs 50,000–70,000. An upper portion in G-11 or G-13 was lower, at Rs 35,000–60,000. F-6 and F-7 houses were several times that.",
      ],
    },
    {
      q: "How much is a portion for rent in Islamabad?",
      a: [
        "time2rent.net listed upper portions at Rs 35,000–60,000 in G-11 and G-13, Rs 55,000–100,000 in F-8 and F-10, and Rs 80,000–150,000 in F-6 and F-7. The sector changes the rent more than the word “portion”.",
      ],
    },
    {
      q: "Is Bahria Town in Islamabad or Rawalpindi?",
      a: [
        "Bahria Town is used in both cities’ searches. Check the society phase and the district on the papers. Do not copy an Islamabad rent onto every Rawalpindi neighbourhood.",
      ],
    },
  ],
  sources: [TIME2RENT, MIX],
  related: [
    { href: "/guides/where-can-i-rent-an-affordable-home-in-rawalpindi", label: "Affordable rent in Rawalpindi" },
    { href: "/guides/where-can-i-buy-an-affordable-home-in-islamabad", label: "Where can I buy an affordable home in Islamabad?" },
    { href: "/rent/islamabad-capital-territory/islamabad", label: "Current Islamabad rentals" },
  ],
};

const rawalpindiRent: QuestionGuide = {
  slug: "where-can-i-rent-an-affordable-home-in-rawalpindi",
  title: "Where Can I Rent an Affordable Home in Rawalpindi? | Apna Ghar",
  h1: "Where can I rent an affordable home in Rawalpindi?",
  description:
    "House for rent in Rawalpindi: Satellite Town, Bahria Town, Chaklala, Saddar and DHA. Where a 2026 Islamabad rent table applies, and where this site will not invent a rupee figure.",
  eyebrow: "QUESTION GUIDE",
  updatedLabel: UPDATED_LABEL,
  updatedIso: UPDATED_ISO,
  direct: [
    notTheScheme(),
    [
      "Search Satellite Town, Chaklala, Saddar, Westridge, Bahria Town and DHA, then compare live ads of the same size. This site does not have a sourced rupee table for Rawalpindi as a whole, so it will not invent one. Bahria Town is the exception people mix up with Islamabad: the 2026 time2rent.net guide put Bahria Phase 8 5 marla houses at Rs 50,000–70,000 and Phase 4 and Phase 7 at Rs 65,000–90,000. Those figures are for the phases in that guide, not for Satellite Town or Saddar.",
    ],
  ],
  sections: [
    {
      heading: "House for rent in Rawalpindi: where to look",
      bullets: [
        ["Satellite Town and Chaklala for established residential streets."],
        ["Saddar and the cantonment side when the commute into central Rawalpindi matters."],
        ["Westridge, Peshawar Road and Adiala Road as further search names. No rent is invented for them here."],
        ["Bahria Town only if you compare the phase with the Islamabad guide’s phase-by-phase bands."],
        ["DHA, which is also searched from Islamabad. Confirm the phase and the district."],
      ],
    },
    {
      heading: "What not to copy from Islamabad",
      paragraphs: [
        [
          "G-11, F-10, F-7 and F-6 are Islamabad sectors. Their rents do not describe Saddar or Satellite Town. Read ",
          { href: "/guides/where-can-i-rent-an-affordable-home-in-islamabad", label: "where to rent an affordable home in Islamabad" },
          " only when the house really is in those sectors, in Bahria, in PWD or in DHA Islamabad.",
        ],
        [
          "A portion is often the lower-cost home in the twin cities, but there is no Rawalpindi-wide portion rent on this page. Compare two portions on the same road instead.",
        ],
      ],
    },
    paySection("Rawalpindi"),
    {
      heading: "See what is actually listed",
      paragraphs: [
        [
          "Open ",
          { href: "/rent/punjab/rawalpindi", label: "property for rent in Rawalpindi" },
          ", including ",
          { href: "/rent/punjab/rawalpindi/areas/satellite-town", label: "Satellite Town" },
          ", ",
          { href: "/rent/punjab/rawalpindi/areas/bahria-town", label: "Bahria Town" },
          ", ",
          { href: "/rent/punjab/rawalpindi/areas/chaklala", label: "Chaklala" },
          " and ",
          { href: "/rent/punjab/rawalpindi/areas/dha", label: "DHA" },
          ".",
        ],
      ],
    },
  ],
  faqs: [
    {
      q: "Where can I rent an affordable house in Rawalpindi?",
      a: [
        "Start with Satellite Town, Chaklala, Saddar and, if the phase fits your commute, Bahria Town. Only the Bahria phase bands from the 2026 Islamabad rental guide are repeated here. Other Rawalpindi areas do not get an invented rent.",
      ],
    },
    {
      q: "How much is rent in Satellite Town Rawalpindi?",
      a: [
        "A reliable 2026 rupee range for Satellite Town was not found in the sources used for this page. Compare current listings and the house size. Do not use a DHA Lahore or F-6 Islamabad number as a substitute.",
      ],
    },
    {
      q: "Is Bahria Town Rawalpindi cheaper than Islamabad sectors?",
      a: [
        "The time2rent.net 5 marla Bahria bands, Rs 50,000–90,000 depending on phase, are below the F-6 and F-7 house band of Rs 200,000 and up. That comparison is about those published bands, not every house in Rawalpindi.",
      ],
    },
  ],
  sources: [TIME2RENT],
  related: [
    { href: "/guides/cities/rawalpindi", label: "Rawalpindi property and rental guide" },
    { href: "/guides/where-can-i-rent-an-affordable-home-in-islamabad", label: "Islamabad rent guide" },
    { href: "/guides/where-can-i-buy-an-affordable-home-in-rawalpindi", label: "Buying in Rawalpindi" },
    { href: "/rent/punjab/rawalpindi", label: "Current Rawalpindi rentals" },
  ],
};

const pakistanRent: QuestionGuide = {
  slug: "where-can-i-rent-an-affordable-home-in-pakistan",
  title: "Where Can I Rent an Affordable Home in Pakistan? | Apna Ghar",
  h1: "Where can I rent an affordable home in Pakistan?",
  description:
    "Where to rent a lower-cost house, flat or portion in Lahore, Karachi, Islamabad and Rawalpindi, with 2026 asking ranges from named sources. No single Pakistan-wide rent.",
  eyebrow: "QUESTION GUIDE",
  updatedLabel: UPDATED_LABEL,
  updatedIso: UPDATED_ISO,
  direct: [
    notTheScheme(),
    [
      "There is no single affordable rent for Pakistan. A 2-marla house reported at Rs 25,000–35,000 in parts of Lahore is not a DHA house, and a 1-bedroom outside central Karachi is not a Clifton house. Pick the city, then the size. The city pages below use named 2026 sources and say when a number does not exist.",
    ],
  ],
  sections: [
    {
      heading: "Start with the city you actually need",
      bullets: [
        [
          "Lahore: 2-marla houses in Faisal Town, Iqbal Town, Samanabad and Muslim Town were reported at Rs 25,000–35,000. Read ",
          { href: "/guides/where-can-i-rent-an-affordable-home-in-lahore", label: "affordable rent in Lahore" },
          ".",
        ],
        [
          "Karachi: a 1-bedroom outside the city centre was reported at Rs 25,000–50,000. Read ",
          { href: "/guides/where-can-i-rent-an-affordable-home-in-karachi", label: "affordable rent in Karachi" },
          ".",
        ],
        [
          "Islamabad: a G-11 or G-13 portion, or a Bahria 5 marla house, is the lower published band. Read ",
          { href: "/guides/where-can-i-rent-an-affordable-home-in-islamabad", label: "affordable rent in Islamabad" },
          ".",
        ],
        [
          "Rawalpindi: search Satellite Town, Chaklala, Saddar and Bahria, and do not invent a city-wide rent. Read ",
          { href: "/guides/where-can-i-rent-an-affordable-home-in-rawalpindi", label: "affordable rent in Rawalpindi" },
          ".",
        ],
      ],
    },
    {
      heading: "What this page will not do",
      paragraphs: [
        [
          "It will not rank a “best” or “cheapest” neighbourhood, and it will not convert a foreign-currency median into rupees. Peshawar, Faisalabad and Multan have rent pages on this site, but this guide does not publish a rent table for them because these sources did not provide one. Compare ",
          { href: "/rent", label: "homes for rent in Pakistan" },
          " after a landlord has published a listing.",
        ],
      ],
    },
    paySection("Pakistan"),
  ],
  faqs: [
    {
      q: "Which city in Pakistan has the cheapest house rent?",
      a: [
        "These sources do not support a city ranking. The lowest bands they do publish are small houses in some Lahore neighbourhoods, 1-bedroom flats outside central Karachi, and portions in parts of Islamabad. A large house in any of those cities costs much more.",
      ],
    },
    {
      q: "Is Apna Ghar the government housing scheme?",
      a: [
        "No. This website is a private marketplace. The government housing-loan scheme is a different site, ",
        SCHEME,
        ".",
      ],
    },
    {
      q: "Why do some rent pages show no homes?",
      a: [
        "Sample ads are not published as real inventory. A city page stays up so the address is stable, but it should not be treated as a list of available houses until a landlord posts one.",
      ],
    },
  ],
  sources: [PROFIT, CONNECT, MIX, TIME2RENT],
  related: [
    { href: "/guides/where-can-i-buy-an-affordable-home-in-pakistan", label: "Where can I buy an affordable home in Pakistan?" },
    { href: "/how-to-rent-a-house-in-pakistan", label: "How to rent a house in Pakistan" },
    { href: "/rent", label: "Browse homes for rent" },
  ],
};

const lahoreBuy: QuestionGuide = {
  slug: "where-can-i-buy-an-affordable-home-in-lahore",
  title: "Where Can I Buy an Affordable Home in Lahore? | Apna Ghar",
  h1: "Where can I buy an affordable home in Lahore?",
  description:
    "House for sale in Lahore in 2026: reported prices for a 5 marla DHA house, and why a DHA Phase 9 Town file is not a built home. Areas to search when DHA is out of reach.",
  eyebrow: "QUESTION GUIDE",
  updatedLabel: UPDATED_LABEL,
  updatedIso: UPDATED_ISO,
  direct: [
    notTheScheme(),
    [
      "A built house and a DHA file are not the same purchase. mix.com.pk on 9 April 2026 put a 5 marla house in DHA Phases 7, 8 and 9 at Rs 1.65 crore to Rs 3 crore. Lahore Real Estate on 29 September 2026 listed a 5 marla allocation file in DHA Phase 9 Town at about Rs 56 lakh, and a 5 marla affidavit file at about Rs 60 lakh. You cannot move into a file. Those file rates also change, and other DHA file series on that page are different products.",
    ],
  ],
  sections: [
    {
      heading: "House for sale in Lahore: the published built-house band",
      paragraphs: [
        [
          "The April blog’s DHA built-house ranges, which are one publisher’s figures and not an official valuation, also included a 10 marla DHA house at Rs 3.5 crore to Rs 7 crore and a 1 kanal house in DHA Phase 5 or 6 at Rs 7 crore to Rs 14 crore. “Affordable” inside DHA still means a large sum. It is not the 2-marla rental market.",
        ],
      ],
    },
    {
      heading: "Where to look if a DHA house is out of reach",
      paragraphs: [
        [
          "Profit by Pakistan Today, writing on 14 July 2026 about rents, said households were moving toward LDA Avenue, Raiwind Road, Jubilee Town and Bahria Orchard. Those are sensible sale-search names for the same reason: they are outside the dearest central and DHA headlines. This page does not invent sale prices for them. Johar Town, Wapda Town, Faisal Town and Iqbal Town are the other names buyers type. Compare a live listing, the covered area and the title, not the area slogan.",
        ],
        [
          "A 5 marla plot figure is not a 5 marla house. The April blog’s Phase 9 Prism and Phase 10 plot ranges are plots. Add construction, or buy a finished house, before you treat a plot price as a home price.",
        ],
      ],
    },
    paySection("Lahore", true),
    {
      heading: "See what is actually listed",
      paragraphs: [
        [
          "Open ",
          { href: "/sale/punjab/lahore", label: "houses for sale in Lahore" },
          " and ",
          { href: "/sale/punjab/lahore/areas/dha", label: "DHA Lahore" },
          ". For the rental side of the same areas, see ",
          { href: "/guides/where-can-i-rent-an-affordable-home-in-lahore", label: "where to rent an affordable home in Lahore" },
          ".",
        ],
      ],
    },
  ],
  faqs: [
    {
      q: "How much is a 5 marla house for sale in DHA Lahore?",
      a: [
        "mix.com.pk on 9 April 2026 reported Rs 1.65 crore to Rs 3 crore for a 5 marla house in DHA Phases 7, 8 and 9. That is a built house in that blog, not a file, and not a promise of today’s rate.",
      ],
    },
    {
      q: "Is a DHA Phase 9 Town file an affordable house?",
      a: [
        "No. On 29 September 2026 a 5 marla allocation file was listed around Rs 56 lakh and a 5 marla affidavit file around Rs 60 lakh. A file is a claim on a plot allocation, not a house you can rent out or live in tomorrow.",
      ],
    },
    {
      q: "Where are cheaper houses than DHA in Lahore?",
      a: [
        "Use LDA Avenue, Raiwind Road, Jubilee Town, Bahria Orchard, Johar Town, Wapda Town, Faisal Town and Iqbal Town as search areas. Do not expect this page to name a sale price the sources did not print.",
      ],
    },
  ],
  sources: [MIX, FILES, PROFIT],
  related: [
    { href: "/guides/cities/lahore", label: "Lahore property guide" },
    { href: "/guides/buying/how-to-buy-property-in-pakistan", label: "How to buy property in Pakistan" },
    { href: "/sale/punjab/lahore", label: "Current Lahore sales" },
  ],
};

const karachiBuy: QuestionGuide = {
  slug: "where-can-i-buy-an-affordable-home-in-karachi",
  title: "Where Can I Buy an Affordable Home in Karachi? | Apna Ghar",
  h1: "Where can I buy an affordable home in Karachi?",
  description:
    "House for sale in Karachi in 2026: a reported 5 marla range in middle-class areas, what DHA and Clifton cost, and why a Bahria Town plot is not a finished house.",
  eyebrow: "QUESTION GUIDE",
  updatedLabel: UPDATED_LABEL,
  updatedIso: UPDATED_ISO,
  direct: [
    notTheScheme(),
    [
      "mix.com.pk on 9 April 2026 put a 5 marla house in middle-class Karachi areas at Rs 80 lakh to Rs 1.5 crore, and a 10 marla house near DHA or Clifton at Rs 2 crore to Rs 5 crore. A 1 kanal bungalow in DHA Phase 5 or 6 was Rs 8 crore to Rs 25 crore in that blog. The lower search is the 5 marla middle-class band, not DHA Phase 6. These are one publisher’s ranges, not an official price index.",
    ],
  ],
  sections: [
    {
      heading: "House for sale in Karachi",
      bullets: [
        ["5 marla house, middle-class areas: Rs 80 lakh to Rs 1.5 crore. The blog did not name every area inside that phrase."],
        ["10 marla house, DHA or Clifton-adjacent: Rs 2 crore to Rs 5 crore."],
        ["1 kanal bungalow, DHA Phase 5 or 6: Rs 8 crore to Rs 25 crore."],
        ["Grade B apartment in Clifton or PECHS: Rs 1.5 crore to Rs 4 crore in the same blog."],
      ],
    },
    {
      heading: "A plot in Bahria Town Karachi is not a house",
      paragraphs: [
        [
          "The same article listed a 125 square yard plot in Bahria Town Karachi at Rs 35 lakh to Rs 55 lakh, and said Bahria plot prices move with demand. A plot still needs construction, possession and a clear title before it is a home. Do not compare a plot price with a 5 marla house price.",
        ],
      ],
    },
    {
      heading: "Areas to search below Clifton and DHA",
      paragraphs: [
        [
          "Buyers looking under the DHA house band usually search Gulistan-e-Johar, Gulshan-e-Iqbal, North Nazimabad, North Karachi, Scheme 33, Surjani Town, Malir and Gulshan-e-Maymar. This page does not stick the Rs 80 lakh–1.5 crore band onto one of those names, because the source said “middle-class areas” and not a block list. Scheme 33 in particular needs a check of the exact project and whether the house is built.",
        ],
      ],
    },
    paySection("Karachi", true),
    {
      heading: "See what is actually listed",
      paragraphs: [
        [
          "Open ",
          { href: "/sale/sindh/karachi", label: "property for sale in Karachi" },
          ". For rents in the same city, see ",
          { href: "/guides/where-can-i-rent-an-affordable-home-in-karachi", label: "where to rent an affordable home in Karachi" },
          ".",
        ],
      ],
    },
  ],
  faqs: [
    {
      q: "How much is a 5 marla house in Karachi in 2026?",
      a: [
        "The 9 April 2026 mix.com.pk blog said Rs 80 lakh to Rs 1.5 crore in middle-class areas. DHA and Clifton-adjacent 10 marla houses were Rs 2 crore to Rs 5 crore. Use the size in the ad before you compare.",
      ],
    },
    {
      q: "Is Bahria Town Karachi an affordable house?",
      a: [
        "The figure quoted here is for a 125 square yard plot, Rs 35 lakh to Rs 55 lakh, not for a finished house. Ask what is built, what is transferred, and what the society charges.",
      ],
    },
    {
      q: "Where should I search for a house below DHA Karachi prices?",
      a: [
        "Gulistan-e-Johar, Gulshan-e-Iqbal, North Nazimabad, North Karachi, Scheme 33, Surjani Town, Malir and Gulshan-e-Maymar are the usual searches. Confirm the title. Do not treat the area name as a price.",
      ],
    },
  ],
  sources: [MIX],
  related: [
    { href: "/guides/cities/karachi", label: "Karachi property guide" },
    { href: "/guides/buying/property-buying-due-diligence-pakistan", label: "Buying due diligence" },
    { href: "/sale/sindh/karachi", label: "Current Karachi sales" },
  ],
};

const islamabadBuy: QuestionGuide = {
  slug: "where-can-i-buy-an-affordable-home-in-islamabad",
  title: "Where Can I Buy an Affordable Home in Islamabad? | Apna Ghar",
  h1: "Where can I buy an affordable home in Islamabad?",
  description:
    "House for sale in Islamabad in 2026: reported ranges for G-11 and G-13 versus F-6 and F-7. What this page will not invent for Bahria Town or PWD.",
  eyebrow: "QUESTION GUIDE",
  updatedLabel: UPDATED_LABEL,
  updatedIso: UPDATED_ISO,
  direct: [
    notTheScheme(),
    [
      "Inside the ranges mix.com.pk published on 9 April 2026, a house in G-11 or G-13 was Rs 2.5 crore to Rs 8 crore, and a house in F-6 or F-7 was Rs 8 crore to Rs 40 crore. The lower published house search is G-11 and G-13, not F-6 or F-7. Even the bottom of that G-sector band is not a small-city budget. The blog is one publisher’s range, not a CDA rate.",
    ],
  ],
  sections: [
    {
      heading: "House for sale in Islamabad",
      bullets: [
        ["G-11 and G-13 houses: Rs 2.5 crore to Rs 8 crore."],
        ["F-6 and F-7 houses: Rs 8 crore to Rs 40 crore."],
        ["The same blog priced some apartments per square foot in DHA and Blue Area. A per-square-foot line is not a house price. Ask for the covered area before you multiply it."],
      ],
    },
    {
      heading: "Bahria Town, PWD and DHA",
      paragraphs: [
        [
          "Rent guides put Bahria Town and PWD below F-6 and F-7 on a monthly budget. This page does not have a sourced 2026 sale price for a finished Bahria or PWD house, so it will not invent one. DHA Islamabad is a separate search from DHA Lahore. Use ",
          { href: "/guides/where-can-i-rent-an-affordable-home-in-islamabad", label: "the Islamabad rent guide" },
          " for monthly figures, and a live sale ad plus the title papers for a purchase.",
        ],
      ],
    },
    paySection("Islamabad", true),
    {
      heading: "See what is actually listed",
      paragraphs: [
        [
          "Open ",
          { href: "/sale/islamabad-capital-territory/islamabad", label: "property for sale in Islamabad" },
          ", including ",
          { href: "/sale/islamabad-capital-territory/islamabad/areas/g-11", label: "G-11" },
          " and ",
          { href: "/sale/islamabad-capital-territory/islamabad/areas/g-13", label: "G-13" },
          ".",
        ],
      ],
    },
  ],
  faqs: [
    {
      q: "Where can I buy a house in Islamabad for less than F-6 or F-7?",
      a: [
        "The April 2026 blog’s lower house band was G-11 and G-13 at Rs 2.5 crore to Rs 8 crore, against Rs 8 crore to Rs 40 crore in F-6 and F-7. “Less” here is still crores, and the top of G-11 can overlap a cheaper F-sector house. Read the specific house.",
      ],
    },
    {
      q: "How much is a house in Bahria Town Islamabad?",
      a: [
        "A sourced sale range for a finished Bahria Town house was not used on this page. The rent guide does quote 5 marla Bahria rents. Sale price needs the plot size, the phase and a current asking price.",
      ],
    },
    {
      q: "Are sector prices official CDA rates?",
      a: [
        "No. The crore ranges are from mix.com.pk on 9 April 2026. CDA sector rules and the market asking price are different questions. Check both the documents and the house.",
      ],
    },
  ],
  sources: [MIX],
  related: [
    { href: "/guides/where-can-i-buy-an-affordable-home-in-rawalpindi", label: "Buying in Rawalpindi" },
    { href: "/guides/where-can-i-rent-an-affordable-home-in-islamabad", label: "Islamabad rent guide" },
    { href: "/sale/islamabad-capital-territory/islamabad", label: "Current Islamabad sales" },
  ],
};

const rawalpindiBuy: QuestionGuide = {
  slug: "where-can-i-buy-an-affordable-home-in-rawalpindi",
  title: "Where Can I Buy an Affordable Home in Rawalpindi? | Apna Ghar",
  h1: "Where can I buy an affordable home in Rawalpindi?",
  description:
    "Where to search for a house for sale in Rawalpindi — Satellite Town, Bahria Town, Chaklala, Saddar and DHA — without an invented price. How the Islamabad ranges do and do not apply.",
  eyebrow: "QUESTION GUIDE",
  updatedLabel: UPDATED_LABEL,
  updatedIso: UPDATED_ISO,
  direct: [
    notTheScheme(),
    [
      "Search Satellite Town, Chaklala, Saddar, Westridge, Adiala Road, Bahria Town and DHA, then compare the plot size and the title. This page does not publish a Rawalpindi sale-price table, because the sources used here do not give one. Copying G-11 or F-6 prices onto Saddar would be wrong. Bahria Town and DHA sit on the Islamabad–Rawalpindi edge: use the Islamabad page only for the society or sector the papers actually name.",
    ],
  ],
  sections: [
    {
      heading: "House for sale in Rawalpindi: search names",
      bullets: [
        ["Satellite Town and Chaklala for established houses."],
        ["Saddar and cantonment areas when location inside the city is the point."],
        ["Bahria Town by phase. A phase price from another city is not automatic."],
        ["DHA by phase, checked against whether the file or house is the Rawalpindi–Islamabad DHA."],
        ["Adiala Road and Peshawar Road as corridors, not as a single price."],
      ],
    },
    {
      heading: "What you can borrow from the Islamabad figures",
      paragraphs: [
        [
          "If the house is in G-11, G-13, F-6 or F-7, it is an Islamabad sector house. See ",
          { href: "/guides/where-can-i-buy-an-affordable-home-in-islamabad", label: "where to buy an affordable home in Islamabad" },
          ". If it is a DHA Lahore Phase 9 file, that is a different city entirely. See ",
          { href: "/guides/where-can-i-buy-an-affordable-home-in-lahore", label: "the Lahore buying guide" },
          " before you compare a file with a built Rawalpindi house.",
        ],
      ],
    },
    paySection("Rawalpindi", true),
    {
      heading: "See what is actually listed",
      paragraphs: [
        [
          "Open ",
          { href: "/sale/punjab/rawalpindi", label: "property for sale in Rawalpindi" },
          ". Rent searches for the same city are on ",
          { href: "/guides/where-can-i-rent-an-affordable-home-in-rawalpindi", label: "where to rent an affordable home in Rawalpindi" },
          ".",
        ],
      ],
    },
  ],
  faqs: [
    {
      q: "Where can I buy an affordable house in Rawalpindi?",
      a: [
        "Look in Satellite Town, Chaklala, Saddar and, after you know the phase, Bahria Town and DHA. Affordable is relative to the house in front of you. This guide will not print a rupee range the sources do not support.",
      ],
    },
    {
      q: "Is DHA Rawalpindi the same price as DHA Lahore?",
      a: [
        "No. They are different projects. A September 2026 file rate for DHA Lahore Phase 9 Town does not describe a house in Rawalpindi.",
      ],
    },
    {
      q: "What should I check before paying a token?",
      a: [
        "See the house, see who can sell it, and read the sale papers. Use the due-diligence and Punjab fard guides linked above. A token is still a payment.",
      ],
    },
  ],
  sources: [MIX],
  related: [
    { href: "/guides/cities/rawalpindi", label: "Rawalpindi property guide" },
    { href: "/guides/buying/fard-registry-intiqal-punjab", label: "Fard, registry and intiqal in Punjab" },
    { href: "/sale/punjab/rawalpindi", label: "Current Rawalpindi sales" },
  ],
};

const pakistanBuy: QuestionGuide = {
  slug: "where-can-i-buy-an-affordable-home-in-pakistan",
  title: "Where Can I Buy an Affordable Home in Pakistan? | Apna Ghar",
  h1: "Where can I buy an affordable home in Pakistan?",
  description:
    "Where lower-cost houses are being searched in Lahore, Karachi, Islamabad and Rawalpindi, with 2026 reported sale ranges. A DHA file is not a built house. No invented prices.",
  eyebrow: "QUESTION GUIDE",
  updatedLabel: UPDATED_LABEL,
  updatedIso: UPDATED_ISO,
  direct: [
    notTheScheme(),
    [
      "“Affordable” is a city and a house size, not a Pakistan-wide price. The lowest built-house bands in the 9 April 2026 mix.com.pk article were a 5 marla house in middle-class Karachi at Rs 80 lakh to Rs 1.5 crore, and — still much higher — a 5 marla DHA Lahore house at Rs 1.65 crore to Rs 3 crore. Islamabad’s lower published house band was G-11 and G-13 at Rs 2.5 crore to Rs 8 crore. A cheaper-looking DHA file is not a house.",
    ],
  ],
  sections: [
    {
      heading: "Pick the city before you pick a budget",
      bullets: [
        [
          "Lahore: separate a built DHA house from a Phase 9 Town file. Read ",
          { href: "/guides/where-can-i-buy-an-affordable-home-in-lahore", label: "buying in Lahore" },
          ".",
        ],
        [
          "Karachi: start with the middle-class 5 marla band, not a Clifton bungalow. Read ",
          { href: "/guides/where-can-i-buy-an-affordable-home-in-karachi", label: "buying in Karachi" },
          ".",
        ],
        [
          "Islamabad: G-11 and G-13 are the lower published sector band, and they are still priced in crores. Read ",
          { href: "/guides/where-can-i-buy-an-affordable-home-in-islamabad", label: "buying in Islamabad" },
          ".",
        ],
        [
          "Rawalpindi: search real neighbourhoods and do not borrow another city’s price. Read ",
          { href: "/guides/where-can-i-buy-an-affordable-home-in-rawalpindi", label: "buying in Rawalpindi" },
          ".",
        ],
      ],
    },
    {
      heading: "Files, plots and houses",
      paragraphs: [
        [
          "An allocation file, an open plot and a constructed house answer different questions. The 29 September 2026 DHA Lahore Phase 9 Town 5 marla allocation file was about Rs 56 lakh. The April blog’s 5 marla built house in DHA Phases 7, 8 and 9 was Rs 1.65 crore to Rs 3 crore. Quoting only the file makes a home look cheaper than it is.",
        ],
      ],
    },
    paySection("Pakistan", true),
  ],
  faqs: [
    {
      q: "Where is the cheapest house for sale in Pakistan?",
      a: [
        "These sources do not name a cheapest city. They do show that a 5 marla house in the Karachi range above is below a 5 marla DHA Lahore house, and that F-6 and F-7 Islamabad houses are a different market again. Size and city both matter.",
      ],
    },
    {
      q: "Can I use the government Apna Ghar scheme on this website?",
      a: [
        "No. Applications for the government scheme, if you are eligible, go through ",
        SCHEME,
        ". This site only lists homes that advertisers post.",
      ],
    },
    {
      q: "Why are there no prices for every city?",
      a: [
        "A missing price is better than a made-up one. When a publisher did not print a range, the city page says so and points you at live listings.",
      ],
    },
  ],
  sources: [MIX, FILES, PROFIT],
  related: [
    { href: "/guides/where-can-i-rent-an-affordable-home-in-pakistan", label: "Where can I rent an affordable home in Pakistan?" },
    { href: "/guides/buying/how-to-buy-property-in-pakistan", label: "How to buy property in Pakistan" },
    { href: "/sale", label: "Browse homes for sale" },
  ],
};

export const QUESTION_GUIDES: QuestionGuide[] = [
  pakistanRent,
  lahoreRent,
  karachiRent,
  islamabadRent,
  rawalpindiRent,
  pakistanBuy,
  lahoreBuy,
  karachiBuy,
  islamabadBuy,
  rawalpindiBuy,
];

const BY_SLUG = new Map(QUESTION_GUIDES.map((guide) => [guide.slug, guide]));

export function questionGuideBySlug(slug: string): QuestionGuide | undefined {
  return BY_SLUG.get(slug);
}

export const QUESTION_GUIDE_PATHS = QUESTION_GUIDES.map((guide) => `/guides/${guide.slug}`);

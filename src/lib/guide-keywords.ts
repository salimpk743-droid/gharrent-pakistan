/**
 * One primary search intent per page, so guides do not compete with each other.
 * Add a row here whenever a guide is added or retargeted; guides.test.ts enforces uniqueness.
 */
export const GUIDE_KEYWORD_MAP: { path: string; primary: string; secondary: string[] }[] = [
  { path: "/guides/cities/lahore", primary: "house for rent in lahore", secondary: ["how to find a house for rent in lahore", "lahore rental areas"] },
  { path: "/guides/cities/karachi", primary: "how to find a flat for rent in karachi", secondary: ["flat for rent in karachi", "tenant registration karachi"] },
  { path: "/guides/cities/rawalpindi", primary: "house for rent in rawalpindi", secondary: ["how to find a house for rent in rawalpindi"] },
  { path: "/guides/where-can-i-rent-an-affordable-home-in-lahore", primary: "cheap house for rent in lahore", secondary: ["2 marla house for rent lahore", "5 marla house rent lahore 2026"] },
  { path: "/guides/where-can-i-rent-an-affordable-home-in-karachi", primary: "cheap flat for rent in karachi", secondary: ["low budget flat karachi"] },
  { path: "/guides/where-can-i-rent-an-affordable-home-in-islamabad", primary: "cheap house for rent in islamabad", secondary: ["portion for rent g-11 g-13", "house for rent in islamabad"] },
  { path: "/guides/where-can-i-rent-an-affordable-home-in-rawalpindi", primary: "cheap house for rent in rawalpindi", secondary: [] },
  { path: "/guides/where-can-i-rent-an-affordable-home-in-pakistan", primary: "affordable homes for rent in pakistan", secondary: ["low cost house for rent pakistan"] },
  { path: "/guides/where-can-i-buy-an-affordable-home-in-lahore", primary: "cheap house for sale in lahore", secondary: ["5 marla house price lahore"] },
  { path: "/guides/where-can-i-buy-an-affordable-home-in-karachi", primary: "cheap house for sale in karachi", secondary: [] },
  { path: "/guides/where-can-i-buy-an-affordable-home-in-islamabad", primary: "cheap house for sale in islamabad", secondary: [] },
  { path: "/guides/where-can-i-buy-an-affordable-home-in-rawalpindi", primary: "cheap house for sale in rawalpindi", secondary: [] },
  { path: "/guides/where-can-i-buy-an-affordable-home-in-pakistan", primary: "affordable houses for sale in pakistan", secondary: [] },
  { path: "/how-to-rent-a-house-in-pakistan", primary: "how to rent a house in pakistan", secondary: ["renting checklist pakistan", "kiraye par ghar kaise lein"] },
  { path: "/guides/rent-agreement-format-pakistan", primary: "rent agreement format pakistan", secondary: ["kirayanama format", "tenancy agreement punjab rent registrar", "rent agreement stamp paper"] },
  { path: "/guides/tenant-registration-punjab-police", primary: "tenant registration punjab police", secondary: ["trs punjab police", "kirayedar registration punjab"] },
  { path: "/guides/how-to-rent-out-your-house-in-pakistan", primary: "how to rent out your house in pakistan", secondary: ["find a tenant pakistan", "post house for rent free"] },
  { path: "/guides/landlords/landlord-responsibilities-pakistan", primary: "landlord responsibilities pakistan", secondary: ["landlord duties punjab rented premises act"] },
  { path: "/guides/landlords/security-deposit-rent-terms-pakistan", primary: "security deposit and advance rent pakistan", secondary: ["rent increase punjab"] },
  { path: "/guides/renting/rental-budget-and-costs-pakistan", primary: "cost of renting a house in pakistan", secondary: ["move in costs rent pakistan"] },
  { path: "/guides/renting/house-vs-flat-vs-portion-pakistan", primary: "house vs flat vs portion", secondary: ["upper portion for rent meaning"] },
  { path: "/guides/buying/how-to-buy-property-in-pakistan", primary: "how to buy property in pakistan", secondary: ["property buying process pakistan"] },
  { path: "/guides/buying/property-buying-due-diligence-pakistan", primary: "how to verify property documents pakistan", secondary: ["property verification before buying"] },
  { path: "/guides/buying/sale-agreement-registration-pakistan", primary: "sale agreement and token money pakistan", secondary: ["bayana agreement", "property registration pakistan"] },
  { path: "/guides/buying/fard-registry-intiqal-punjab", primary: "fard registry intiqal punjab", secondary: ["what is fard", "intiqal meaning"] },
  { path: "/guides/property-tax-on-buying-and-selling-property-pakistan", primary: "property tax on buying and selling property pakistan 2026-27", secondary: ["236k tax rate 2026-27", "236c tax rate 2026-27", "stamp duty punjab e-stamp"] },
  { path: "/safety", primary: "rental scam checks pakistan", secondary: ["safe property buying pakistan"] },
];

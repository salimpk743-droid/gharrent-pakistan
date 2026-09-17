import { createFileRoute, Link } from "@tanstack/react-router";
import { SearchBox } from "@/components/search/search-box";
import { PropertyCard } from "@/components/property/property-card";
import { getHomeData } from "@/lib/server/properties";
import { APP_NAME, APP_TAGLINE, FEATURED_PROPERTY_TYPES, POPULAR_CITIES, PROPERTY_TYPE_META } from "@/lib/constants";
import { Building2, DoorOpen, Home, Hotel, LayoutGrid } from "lucide-react";

export const Route = createFileRoute("/")({
  loader: () => getHomeData(),
  head: () => ({
    meta: [
      { title: `${APP_NAME} — Homes for Rent and Sale Across Pakistan` },
      {
        name: "description",
        content:
          "Find a home to rent or buy across Pakistan. Search houses, flats, portions, plots and commercial properties by location, type and budget.",
      },
    ],
  }),
  component: HomePage,
});

const TYPE_ICONS = {
  House: Home,
  Apartment: Building2,
  Portion: LayoutGrid,
  Room: DoorOpen,
  Hostel: Hotel,
} as const;

const CITY_CLASS = ["city-lahore", "city-karachi", "city-isb", "city-pindi", "city-peshawar"];

function HomePage() {
  const data = Route.useLoaderData();
  return (
    <>
      <section className="hero-photo relative flex min-h-[500px] items-start overflow-hidden text-white">
        <div className="mx-auto w-[min(1050px,calc(100%-32px))] py-10 sm:py-14">
          <p className="text-[10px] font-extrabold tracking-[0.16em] text-lime">FIND YOUR NEXT HOME</p>
          <h1 className="font-display mt-2 text-[2.15rem] leading-[1.05] tracking-tight sm:text-5xl">
            Search homes by
            <br />
            <em className="not-italic text-lime">location.</em>
          </h1>
          <p className="mt-3 max-w-xl text-[15px] text-[#e5efea]">
            {APP_TAGLINE} Pick a province, city and area, then narrow it down by property type and budget.
          </p>
          <div className="mt-6 min-w-0 max-w-[900px]">
            <SearchBox />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] text-[#e8f0ec]">
            <strong>Popular:</strong>
            {POPULAR_CITIES.map((c) => (
              <Link
                key={c.label}
                to="/rent/$province/$district"
                params={{ province: c.provinceSlug, district: c.districtSlug }}
                className="border-b border-white/45 text-white no-underline"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="absolute bottom-4 right-6 hidden text-[10px] text-[#d9e8e0] md:block">
          Province → city → area search
        </div>
      </section>

      <section className="mx-auto w-[min(1120px,calc(100%-32px))] py-16" id="browse">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold tracking-[0.16em] text-forest">BROWSE BY LOCATION</p>
            <h2 className="font-display mt-1 text-3xl tracking-tight">Where are you looking?</h2>
            <p className="mt-1 text-xs text-muted">Choose a city or open the full location directory.</p>
          </div>
          <Link to="/locations" className="shrink-0 text-sm font-bold text-forest no-underline">
            See all locations →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-[1.35fr_1fr_1fr] md:grid-rows-[150px_150px]">
          {POPULAR_CITIES.map((city, i) => (
            <Link
              key={city.label}
              to="/rent/$province/$district"
              params={{ province: city.provinceSlug, district: city.districtSlug }}
              className={`${CITY_CLASS[i]} relative min-h-[140px] overflow-hidden rounded-xl bg-cover bg-center text-left text-white no-underline ${
                i === 0 ? "md:row-span-2 md:min-h-0" : ""
              } ${i === 4 ? "col-span-2 md:col-span-1" : ""}`}
            >
              <span className="absolute inset-0 bg-gradient-to-t from-[rgba(8,39,31,0.76)] to-transparent" />
              <span className="absolute bottom-3 left-4">
                <b className="font-display block text-lg font-semibold">{city.label}</b>
                <small className="text-[10px] text-[#e0ebe5]">{city.region}</small>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-sand py-16" id="listings">
        <div className="mx-auto w-[min(1120px,calc(100%-32px))]">
          <p className="text-[10px] font-extrabold tracking-[0.16em] text-forest">LATEST HOMES</p>
          <h2 className="font-display mt-1 text-3xl tracking-tight">Homes to explore</h2>
          <p className="mt-1 text-xs text-muted">Latest published rent and sale listings from across Pakistan.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.latest.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/rent"
              className="inline-flex min-h-11 items-center rounded-md bg-forest px-4 text-sm font-bold text-white no-underline"
            >
              Browse all homes
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-[min(1120px,calc(100%-32px))] py-16">
        <p className="text-[10px] font-extrabold tracking-[0.16em] text-forest">PROPERTY TYPE</p>
        <h2 className="font-display mt-1 text-3xl tracking-tight">What kind of home do you need?</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          {FEATURED_PROPERTY_TYPES.map((t) => {
            const Icon = TYPE_ICONS[t];
            return (
              <Link
                key={t}
                to="/rent"
                search={{ typeSlug: PROPERTY_TYPE_META[t].slug }}
                className="flex h-[118px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl border border-line bg-[#fbfcfa] px-2 text-center text-ink no-underline hover:border-[#9fc5b4]"
              >
                <Icon className="size-7 text-forest" />
                <b className="font-display text-base">{PROPERTY_TYPE_META[t].plural}</b>
                <small className="text-[10px] text-muted">{PROPERTY_TYPE_META[t].blurb}</small>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-[#eaf2e9] py-16" id="how">
        <div className="mx-auto grid w-[min(1120px,calc(100%-32px))] items-center gap-10 md:grid-cols-2">
          <div className="why-photo relative h-[245px] rounded-xl bg-cover bg-center md:h-[410px]">
            <span className="absolute inset-0 rounded-xl bg-gradient-to-t from-[rgba(13,52,42,0.5)] to-transparent" />
            <div className="absolute bottom-4 left-4 rounded-lg bg-white px-4 py-3">
              <b className="font-display block text-[15px]">Simple property search</b>
              <span className="text-[10px] text-muted">from search to viewing</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-extrabold tracking-[0.16em] text-forest">HOW APNA GHAR WORKS</p>
            <h2 className="font-display mt-1 text-3xl tracking-tight">Keep the property search simple.</h2>
            <ol className="mt-6 grid gap-4">
              {[
                ["01", "Select your location", "Province, city and local area."],
                ["02", "Compare homes", "Review price, size, rooms and listing details."],
                ["03", "View and verify", "Contact the owner and verify the property before paying."],
              ].map(([n, t, d]) => (
                <li key={n} className="flex gap-3">
                  <span className="font-display text-[13px] font-semibold text-[#579176]">{n}</span>
                  <div>
                    <b className="block text-[13px]">{t}</b>
                    <small className="text-[11px] text-[#61736c]">{d}</small>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto w-[min(1120px,calc(100%-32px))] py-16" id="safety">
        <div className="grid gap-8 rounded-[14px] bg-ink px-6 py-10 text-white md:grid-cols-[1.2fr_1fr] md:px-12">
          <div>
            <p className="text-[10px] font-extrabold tracking-[0.16em] text-lime">BUY AND RENT WITH CARE</p>
            <h2 className="font-display mt-2 text-3xl">Check first. Pay later.</h2>
            <p className="mt-3 max-w-md text-xs leading-relaxed text-[#d6e2dc]">
              Inspect the property, verify the owner or representative and keep clear records of payments and
              terms. Apna Ghar is a marketplace, not a party to your contract.
            </p>
            <Link to="/safety" className="mt-4 inline-block text-sm font-bold text-lime no-underline">
              Read safer-buying and renting tips →
            </Link>
          </div>
          <div className="border-t border-white/20 pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            <p className="text-sm">
              <span className="mr-2 text-lime">✓</span> View the property in person
            </p>
            <p className="mt-3 text-sm">
              <span className="mr-2 text-lime">✓</span> Verify the owner or representative
            </p>
            <p className="mt-3 text-sm">
              <span className="mr-2 text-lime">✓</span> Keep receipts and written terms
            </p>
          </div>
        </div>
      </section>

      <section className="bg-forest py-16 text-center text-white">
        <p className="text-[10px] font-extrabold tracking-[0.16em] text-lime">HAVE A HOME TO LIST?</p>
        <h2 className="font-display mt-2 text-3xl tracking-tight sm:text-4xl">
          Post it where people
          <br />
          <em className="not-italic text-lime">can find it.</em>
        </h2>
        <p className="mx-auto mt-3 max-w-md px-4 text-xs text-[#dbe9e3]">
          Add the location and property details people need to decide — for rent or for sale.
        </p>
        <Link
          to="/post"
          className="mt-5 inline-flex min-h-11 items-center rounded-md bg-white px-4 text-sm font-bold text-forest no-underline"
        >
          Post a property →
        </Link>
      </section>
    </>
  );
}

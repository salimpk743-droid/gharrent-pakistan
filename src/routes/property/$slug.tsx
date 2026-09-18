import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PropertyGallery } from "@/components/property/property-gallery";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/input";
import { getPropertyBySlug, recordContactClick } from "@/lib/server/properties";
import { reportProperty } from "@/lib/server/reports";
import { toggleFavorite } from "@/lib/server/favorites";
import { FURNISHED_LABEL, PURPOSE_KICKER, REPORT_REASONS, SIZE_UNIT_LABEL } from "@/lib/constants";
import { listingBreadcrumbJsonLd, listingJsonLd, listingSeo } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { formatListingPrice, formatLocation } from "@/lib/utils";
import { telLink, whatsappLink } from "@/lib/phone";
import { useAuthGate } from "@/components/auth/use-auth-gate";
import { Bath, BedDouble, Flag, Heart, MapPin, Phone, Share2 } from "lucide-react";
import type { PublicProperty } from "@/lib/types";

export const Route = createFileRoute("/property/$slug")({
  loader: async ({ params }) => {
    const property = await getPropertyBySlug({ data: { slug: params.slug } });
    if (!property || "notPublic" in property) throw notFound();
    return property as PublicProperty;
  },
  head: ({ loaderData }) => listingSeo(loaderData),
  component: PropertyPage,
  notFoundComponent: () => (
    <main className="mx-auto w-[min(720px,calc(100%-32px))] py-20 text-center">
      <h1 className="font-display text-3xl">This listing is not available</h1>
      <p className="mt-2 text-sm text-muted">It may have been paused, rented, sold or removed.</p>
      <Link to="/rent" className="mt-6 inline-block font-bold text-forest">
        Browse homes
      </Link>
    </main>
  ),
});

function PropertyPage() {
  const property = Route.useLoaderData();
  const { user, isPending, showSignIn } = useAuthGate();
  const [saved, setSaved] = useState(Boolean(property.saved));
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0].id);
  const [details, setDetails] = useState("");
  const loc = formatLocation(property);
  const price = formatListingPrice(property.monthlyRent, property.listingPurpose);
  const call = telLink(property.contactPhone);
  const wa = whatsappLink(
    property.contactWhatsapp || property.contactPhone,
    `Assalamualaikum, I saw your Apna Ghar listing: ${property.title}`,
  );
  const size =
    property.propertySize != null
      ? `${property.propertySize.toLocaleString("en-PK")} ${SIZE_UNIT_LABEL[property.sizeUnit]}`
      : null;

  async function onSave() {
    if (!user || showSignIn) {
      window.location.href = `/login?next=/property/${property.slug}`;
      return;
    }
    if (isPending) return;
    const result = await toggleFavorite({ data: { propertyId: property.id } });
    if (result.ok) {
      setSaved(result.saved);
      toast(result.saved ? "Saved to your list" : "Removed from saved");
    } else toast.error(result.error);
  }

  async function onShare() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: property.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast("Link copied");
      }
      void recordContactClick({ data: { propertyId: property.id, type: "share" } });
    } catch {
      /* user cancelled */
    }
  }

  async function onReport() {
    if (!user || showSignIn) {
      window.location.href = `/login?next=/property/${property.slug}`;
      return;
    }
    if (isPending) return;
    const result = await reportProperty({ data: { propertyId: property.id, reason, details } });
    if (result.ok) {
      toast("Thank you. We will review this listing.");
      setReporting(false);
    } else toast.error(result.error);
  }

  return (
    <main className="mx-auto w-[min(1120px,calc(100%-32px))] py-8 pb-24">
      <JsonLd data={listingJsonLd(property)} />
      <JsonLd data={listingBreadcrumbJsonLd(property)} />
      <nav className="mb-4 flex flex-wrap gap-2 text-sm text-muted" aria-label="Breadcrumb">
        <Link to="/" className="no-underline hover:text-forest">
          Home
        </Link>
        {property.provinceSlug && (
          <>
            <span>/</span>
            {property.listingPurpose === "SALE" ? (
              <Link to="/sale/$province" params={{ province: property.provinceSlug }} className="no-underline hover:text-forest">
                {property.provinceName}
              </Link>
            ) : (
              <Link to="/rent/$province" params={{ province: property.provinceSlug }} className="no-underline hover:text-forest">
                {property.provinceName}
              </Link>
            )}
          </>
        )}
        {property.provinceSlug && property.districtSlug && (
          <>
            <span>/</span>
            {property.listingPurpose === "SALE" ? (
              <Link
                to="/sale/$province/$district"
                params={{ province: property.provinceSlug, district: property.districtSlug }}
                className="no-underline hover:text-forest"
              >
                {property.districtName}
              </Link>
            ) : (
              <Link
                to="/rent/$province/$district"
                params={{ province: property.provinceSlug, district: property.districtSlug }}
                className="no-underline hover:text-forest"
              >
                {property.districtName}
              </Link>
            )}
          </>
        )}
      </nav>

      <PropertyGallery images={property.images} title={property.title} />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-extrabold tracking-[0.14em] text-forest">
              {PURPOSE_KICKER[property.listingPurpose]}
            </span>
            {property.isFeatured && <Badge>Featured</Badge>}
            {property.isSample && <Badge className="bg-ink text-white">Demo listing</Badge>}
            <StatusBadge status={property.status} purpose={property.listingPurpose} />
          </div>
          <p className="mt-3 text-2xl font-extrabold">
            {price.amount}
            {price.suffix ? <span className="text-sm font-normal text-muted"> {price.suffix}</span> : null}
          </p>
          <h1 className="font-display mt-2 text-3xl tracking-tight">{property.title}</h1>
          <p className="mt-2 flex items-center gap-1 text-sm text-muted">
            <MapPin className="size-4" /> {loc} · {property.propertyType}
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1">
              <BedDouble className="size-4" /> {property.bedrooms} beds
            </span>
            <span className="flex items-center gap-1">
              <Bath className="size-4" /> {property.bathrooms} baths
            </span>
            {size && <span>{size}</span>}
            <span>{FURNISHED_LABEL[property.furnishedStatus]}</span>
          </div>

          <h2 className="font-display mt-8 text-xl">About this home</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#52645d]">{property.description}</p>

          <h2 className="font-display mt-8 text-xl">Features</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {[
              property.parking && "Parking",
              property.electricity && "Electricity",
              property.gas && "Gas",
              property.water && "Water",
              property.maintenance && "Maintenance included",
              property.familyAllowed && "Family allowed",
              property.bachelorAllowed && "Bachelor allowed",
              property.petsAllowed && "Pets allowed",
            ]
              .filter(Boolean)
              .map((f) => (
                <li key={String(f)} className="rounded-md bg-sand px-3 py-2">
                  {f}
                </li>
              ))}
          </ul>

          {property.address && (
            <>
              <h2 className="font-display mt-8 text-xl">Location</h2>
              <p className="mt-2 text-sm text-muted">{property.address}</p>
            </>
          )}
        </div>

        <aside className="h-fit rounded-xl border border-line bg-white p-5 lg:sticky lg:top-24">
          <p className="text-[10px] font-extrabold tracking-[0.16em] text-forest">ADVERTISER</p>
          <p className="mt-2 font-semibold">{property.advertiser.displayName}</p>
          {property.advertiser.googleVerified && (
            <p className="text-xs text-muted">Google account on file — this is not a property inspection.</p>
          )}
          {property.isSample && (
            <p className="mt-2 rounded-md bg-cream px-3 py-2 text-xs">
              This is a sample listing for demonstration. Treat the contact number as illustrative.
            </p>
          )}
          <div className="mt-4 grid gap-2">
            {call && (
              <Button asChild>
                <a
                  href={call}
                  onClick={() => void recordContactClick({ data: { propertyId: property.id, type: "call" } })}
                >
                  <Phone className="size-4" /> Call
                </a>
              </Button>
            )}
            {wa && (
              <Button asChild variant="outline">
                <a
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => void recordContactClick({ data: { propertyId: property.id, type: "whatsapp" } })}
                >
                  WhatsApp
                </a>
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => void onShare()}>
              <Share2 className="size-4" /> Share
            </Button>
            <Button type="button" variant="outline" onClick={() => void onSave()} disabled={isPending}>
              <Heart className={`size-4 ${saved ? "fill-[#d34d5b] text-[#d34d5b]" : ""}`} />
              {saved ? "Saved" : "Save"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setReporting((v) => !v)}>
              <Flag className="size-4" /> Report this listing
            </Button>
          </div>
          {reporting && (
            <form
              className="mt-4 grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                void onReport();
              }}
            >
              <Label>
                Reason
                <Select value={reason} onChange={(e) => setReason(e.target.value)}>
                  {REPORT_REASONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </Select>
              </Label>
              <Label>
                Details (optional)
                <Textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} />
              </Label>
              <Button type="submit">Send report</Button>
            </form>
          )}
        </aside>
      </div>
    </main>
  );
}

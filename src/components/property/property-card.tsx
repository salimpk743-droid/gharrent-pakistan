import { Link } from "@tanstack/react-router";
import { Bath, BedDouble, Heart, MapPin, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SIZE_UNIT_LABEL } from "@/lib/constants";
import { formatPkr } from "@/lib/utils";
import type { PublicProperty } from "@/lib/types";

export function PropertyCard({
  property,
  onToggleSave,
}: {
  property: PublicProperty;
  onToggleSave?: (id: string) => void;
}) {
  const loc = [property.area, property.districtName].filter(Boolean).join(", ");
  const size =
    property.propertySize != null
      ? `${property.propertySize.toLocaleString("en-PK")} ${SIZE_UNIT_LABEL[property.sizeUnit]}`
      : null;
  return (
    <article className="group overflow-hidden rounded-xl border border-line bg-white transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(16,50,42,0.12)]">
      <Link to="/property/$slug" params={{ slug: property.slug }} className="block text-ink no-underline">
        <div
          className="relative h-[190px] bg-sand bg-cover bg-center"
          style={{ backgroundImage: property.coverImage ? `url(${property.coverImage.url})` : undefined }}
        >
          {property.isFeatured && <Badge className="absolute left-2.5 top-2.5">Featured</Badge>}
          {property.isSample && (
            <span className="absolute bottom-2.5 left-2.5 rounded bg-[rgba(18,55,46,0.82)] px-1.5 py-1 text-[8px] font-bold uppercase text-white">
              Demo listing
            </span>
          )}
          {onToggleSave && (
            <button
              type="button"
              className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full bg-white text-ink"
              aria-label={property.saved ? "Remove from saved" : "Save property"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSave(property.id);
              }}
            >
              <Heart className={`size-4 ${property.saved ? "fill-[#d34d5b] text-[#d34d5b]" : ""}`} />
            </button>
          )}
        </div>
        <div className="p-3.5">
          <div className="text-base font-extrabold">
            {formatPkr(property.monthlyRent)}{" "}
            <small className="text-[10px] font-normal text-muted">/ month</small>
          </div>
          <h3 className="font-display mt-1.5 text-base font-semibold leading-snug">{property.title}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
            <MapPin className="size-3 shrink-0" aria-hidden="true" />
            {loc} · {property.propertyType}
          </p>
          <div className="mt-2.5 flex gap-3 border-t border-[#edf0ed] pt-2.5 text-[10px] text-[#607069]">
            <span className="flex items-center gap-1">
              <BedDouble className="size-3.5 text-ink" aria-hidden="true" />
              <b className="text-ink">{property.bedrooms}</b> Beds
            </span>
            <span className="flex items-center gap-1">
              <Bath className="size-3.5 text-ink" aria-hidden="true" />
              <b className="text-ink">{property.bathrooms}</b> Baths
            </span>
            {size && (
              <span className="flex items-center gap-1">
                <Maximize2 className="size-3.5 text-ink" aria-hidden="true" />
                {size}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

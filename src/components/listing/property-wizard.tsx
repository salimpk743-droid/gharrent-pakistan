import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { listAreasForCity, listCitiesForProvince, listProvinces } from "@/lib/server/locations";
import {
  addListingImage,
  deleteListingImage,
  saveDraft,
  setCoverImage,
  submitListing,
} from "@/lib/server/listings";
import { compressImageFile } from "@/lib/compress-image";
import {
  FURNISHED_LABEL,
  FURNISHED_STATUSES,
  PURPOSE_KICKER,
  PROPERTY_TYPES,
  type ListingPurpose,
} from "@/lib/constants";
import { formatListingPrice, formatLocation } from "@/lib/utils";
import type { AreaNode, LocationNode, OwnerListing } from "@/lib/types";
import { Star, Trash2, Upload } from "lucide-react";

const STEPS = ["Location", "Property", "Photos", "Details", "Contact", "Publish"] as const;

const AMENITIES = [
  ["parking", "Parking"],
  ["electricity", "Electricity"],
  ["gas", "Gas"],
  ["water", "Water"],
  ["maintenance", "Maintenance included"],
  ["familyAllowed", "Family allowed"],
  ["bachelorAllowed", "Bachelor allowed"],
  ["petsAllowed", "Pets allowed"],
] as const;

export function PropertyWizard({ initial }: { initial: OwnerListing }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [provinces, setProvinces] = useState<LocationNode[]>([]);
  const [cities, setCities] = useState<LocationNode[]>([]);
  const [areas, setAreas] = useState<AreaNode[]>([]);
  const [listing, setListing] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void listProvinces()
      .then(setProvinces)
      .catch(() => setProvinces([]));
  }, []);

  useEffect(() => {
    if (!listing.provinceId) {
      setCities([]);
      return;
    }
    let cancelled = false;
    void listCitiesForProvince({ data: { provinceId: listing.provinceId } })
      .then((rows) => {
        if (!cancelled) setCities(rows);
      })
      .catch(() => {
        if (!cancelled) setCities([]);
      });
    return () => {
      cancelled = true;
    };
  }, [listing.provinceId]);

  useEffect(() => {
    if (!listing.districtId) {
      setAreas([]);
      return;
    }
    let cancelled = false;
    void listAreasForCity({ data: { districtId: listing.districtId } })
      .then((rows) => {
        if (!cancelled) setAreas(rows);
      })
      .catch(() => {
        if (!cancelled) setAreas([]);
      });
    return () => {
      cancelled = true;
    };
  }, [listing.districtId]);

  async function persist(patch: Partial<OwnerListing> = {}) {
    const next = { ...listing, ...patch };
    setListing(next);
    const result = await saveDraft({
      data: {
        id: next.id,
        title: next.title,
        description: next.description,
        propertyType: next.propertyType,
        listingPurpose: next.listingPurpose,
        provinceId: next.provinceId,
        districtId: next.districtId,
        tehsilId: next.tehsilId,
        areaId: next.areaId,
        area: next.area,
        address: next.address,
        monthlyRent: next.monthlyRent,
        bedrooms: next.bedrooms,
        bathrooms: next.bathrooms,
        furnishedStatus: next.furnishedStatus,
        parking: next.parking,
        electricity: next.electricity,
        gas: next.gas,
        water: next.water,
        maintenance: next.maintenance,
        familyAllowed: next.familyAllowed,
        bachelorAllowed: next.bachelorAllowed,
        petsAllowed: next.petsAllowed,
        contactPhone: next.contactPhone,
        contactWhatsapp: next.contactWhatsapp,
      },
    });
    if (result.ok && result.listing) setListing(result.listing);
    return result;
  }

  async function next() {
    setError(null);
    setBusy(true);
    try {
      await persist();
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    } catch {
      setError("Could not save this step. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit() {
    setBusy(true);
    setError(null);
    try {
      const saved = await persist();
      const status = saved.ok && saved.listing ? saved.listing.status : listing.status;
      if (status === "PUBLISHED" || status === "PAUSED") {
        toast.success("Your listing has been updated.");
        await navigate({ to: "/account/listings" });
        return;
      }
      const result = await submitListing({ data: { id: listing.id } });
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        if (/mobile number|WhatsApp/i.test(result.error)) setStep(4);
        return;
      }
      toast.success("Your property is now live.");
      await navigate({ to: "/account/listings" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const compressed = await compressImageFile(file);
        const result = await addListingImage({
          data: {
            propertyId: listing.id,
            dataBase64: compressed.dataUrl,
            width: compressed.width,
            height: compressed.height,
          },
        });
        if (!result.ok) {
          toast.error(result.error);
          break;
        }
        setListing((cur) => ({
          ...cur,
          images: [...cur.images, result.image],
          coverImage: result.image.isCover ? result.image : cur.coverImage,
        }));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload that photo.");
    } finally {
      setBusy(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;
  const locLabel = useMemo(() => formatLocation(listing), [listing]);
  const price = formatListingPrice(listing.monthlyRent, listing.listingPurpose);

  return (
    <div className="mx-auto w-[min(760px,calc(100%-24px))] py-8 pb-28">
      <p className="text-[10px] font-extrabold tracking-[0.16em] text-forest">POST A PROPERTY</p>
      <h1 className="font-display mt-2 text-3xl tracking-tight">List your property</h1>
      <p className="mt-1 text-sm text-muted">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}. Your ad goes live as soon as you publish.
      </p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-sand" aria-hidden="true">
        <div className="h-full bg-forest transition-[width] duration-200" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-8 grid gap-4">
        {step === 0 && (
          <>
            <div className="flex h-11 min-w-0 items-end gap-6 overflow-hidden border-b border-line">
              <button
                type="button"
                className={`h-11 shrink-0 px-1 text-sm font-bold ${
                  listing.listingPurpose === "RENT" ? "border-b-2 border-forest text-forest" : "text-[#b7c2bd]"
                }`}
                onClick={() => setListing((l) => ({ ...l, listingPurpose: "RENT" }))}
              >
                For rent
              </button>
              <button
                type="button"
                className={`h-11 shrink-0 px-1 text-sm font-bold ${
                  listing.listingPurpose === "SALE" ? "border-b-2 border-forest text-forest" : "text-[#b7c2bd]"
                }`}
                onClick={() => setListing((l) => ({ ...l, listingPurpose: "SALE" }))}
              >
                For sale
              </button>
            </div>
            <Label>
              Province / region
              <Select
                value={listing.provinceId || ""}
                onChange={(e) =>
                  setListing((l) => ({
                    ...l,
                    provinceId: e.target.value,
                    districtId: null,
                    tehsilId: null,
                    areaId: null,
                    area: "",
                  }))
                }
              >
                <option value="">Select province</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Label>
            <Label>
              City
              <Select
                value={listing.districtId || ""}
                disabled={!listing.provinceId}
                onChange={(e) =>
                  setListing((l) => ({ ...l, districtId: e.target.value, tehsilId: null, areaId: null, area: "" }))
                }
              >
                <option value="">Select city</option>
                {cities.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </Label>
            <Label>
              Area
              <Select
                value={listing.areaId || ""}
                disabled={!listing.districtId}
                onChange={(e) => {
                  const selected = areas.find((a) => a.id === e.target.value);
                  setListing((l) => ({
                    ...l,
                    areaId: e.target.value || null,
                    area: selected?.name || "",
                  }));
                }}
              >
                <option value="">Select area</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
                {listing.area && !areas.some((a) => a.id === listing.areaId || a.name === listing.area) && (
                  <option value={listing.areaId || ""}>{listing.area}</option>
                )}
              </Select>
            </Label>
            <Label>
              Address (optional)
              <Input
                value={listing.address}
                onChange={(e) => setListing((l) => ({ ...l, address: e.target.value }))}
                placeholder="Street, house number or nearby landmark"
              />
            </Label>
          </>
        )}

        {step === 1 && (
          <>
            <Label>
              Listing title
              <Input
                value={listing.title === "Untitled listing" ? "" : listing.title}
                maxLength={80}
                placeholder="e.g. 5 Marla family house in Johar Town"
                onChange={(e) => setListing((l) => ({ ...l, title: e.target.value }))}
              />
            </Label>
            <Label>
              Property type
              <Select
                value={listing.propertyType}
                onChange={(e) =>
                  setListing((l) => ({ ...l, propertyType: e.target.value as OwnerListing["propertyType"] }))
                }
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Label>
            <Label>
              {listing.listingPurpose === "SALE" ? "Sale price (Rs.)" : "Monthly rent (Rs.)"}
              <Input
                inputMode="numeric"
                value={listing.monthlyRent || ""}
                onChange={(e) =>
                  setListing((l) => ({ ...l, monthlyRent: Number(e.target.value.replace(/[^\d]/g, "")) || 0 }))
                }
                placeholder={listing.listingPurpose === "SALE" ? "18500000" : "65000"}
              />
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Label>
                Bedrooms
                <Input
                  type="number"
                  min={0}
                  max={20}
                  value={listing.bedrooms}
                  onChange={(e) => setListing((l) => ({ ...l, bedrooms: Number(e.target.value) }))}
                />
              </Label>
              <Label>
                Bathrooms
                <Input
                  type="number"
                  min={0}
                  max={20}
                  value={listing.bathrooms}
                  onChange={(e) => setListing((l) => ({ ...l, bathrooms: Number(e.target.value) }))}
                />
              </Label>
            </div>
            <Label>
              Furnished status
              <Select
                value={listing.furnishedStatus}
                onChange={(e) =>
                  setListing((l) => ({ ...l, furnishedStatus: e.target.value as OwnerListing["furnishedStatus"] }))
                }
              >
                {FURNISHED_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {FURNISHED_LABEL[s]}
                  </option>
                ))}
              </Select>
            </Label>
          </>
        )}

        {step === 2 && (
          <div>
            <p className="text-sm text-muted">Add at least one cover photo. JPEG, PNG or WebP, compressed automatically.</p>
            <label className="mt-3 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line bg-sand text-sm text-muted">
              <Upload className="mb-2 size-5" />
              Upload photos
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                onChange={(e) => void onFiles(e.target.files)}
              />
            </label>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {listing.images.map((img) => (
                <div key={img.id} className="relative overflow-hidden rounded-lg border border-line">
                  <img src={img.url} alt="" className="h-28 w-full object-cover" />
                  {img.isCover && (
                    <span className="absolute left-2 top-2 rounded bg-lime px-1.5 py-0.5 text-[10px] font-bold">
                      Cover
                    </span>
                  )}
                  <div className="flex">
                    <button
                      type="button"
                      className="flex min-h-10 flex-1 items-center justify-center gap-1 text-xs"
                      onClick={() =>
                        void setCoverImage({ data: { propertyId: listing.id, imageId: img.id } }).then(() =>
                          setListing((l) => ({
                            ...l,
                            images: l.images.map((i) => ({ ...i, isCover: i.id === img.id })),
                            coverImage: img,
                          })),
                        )
                      }
                    >
                      <Star className="size-3.5" /> Cover
                    </button>
                    <button
                      type="button"
                      className="flex min-h-10 flex-1 items-center justify-center gap-1 text-xs text-danger"
                      onClick={() =>
                        void deleteListingImage({ data: { propertyId: listing.id, imageId: img.id } }).then(() =>
                          setListing((l) => ({ ...l, images: l.images.filter((i) => i.id !== img.id) })),
                        )
                      }
                    >
                      <Trash2 className="size-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <>
            <Label>
              Description
              <Textarea
                rows={6}
                maxLength={4000}
                value={listing.description}
                placeholder="Mention parking, utilities, furnished status, nearby landmarks and who the home suits."
                onChange={(e) => setListing((l) => ({ ...l, description: e.target.value }))}
              />
            </Label>
            <fieldset className="grid gap-2">
              <legend className="mb-1 text-sm font-semibold text-ink">What does this home include?</legend>
              {AMENITIES.map(([key, label]) => (
                <label key={key} className="flex min-h-11 items-center gap-3 rounded-md border border-line px-3 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-forest"
                    checked={Boolean(listing[key])}
                    onChange={(e) => setListing((l) => ({ ...l, [key]: e.target.checked }))}
                  />
                  {label}
                </label>
              ))}
            </fieldset>
          </>
        )}

        {step === 4 && (
          <>
            <Label>
              Contact phone
              <Input
                type="tel"
                value={listing.contactPhone || ""}
                placeholder="03xx-xxxxxxx"
                onChange={(e) => setListing((l) => ({ ...l, contactPhone: e.target.value }))}
              />
            </Label>
            <Label>
              WhatsApp (optional)
              <Input
                type="tel"
                value={listing.contactWhatsapp || ""}
                placeholder="Same as phone if left blank"
                onChange={(e) => setListing((l) => ({ ...l, contactWhatsapp: e.target.value }))}
              />
            </Label>
            <p className="text-xs text-muted">
              People will use these numbers to call or message you. Do not add CNIC, email or payment details.
            </p>
          </>
        )}

        {step === 5 && (
          <>
            <div className="rounded-xl border border-line bg-sand p-5">
              <p className="text-[10px] font-extrabold tracking-[0.16em] text-forest">PREVIEW</p>
              <p className="mt-2 text-[10px] font-extrabold tracking-[0.14em] text-forest">
                {PURPOSE_KICKER[listing.listingPurpose as ListingPurpose]}
              </p>
              <h2 className="font-display mt-1 text-2xl">{listing.title || "Untitled listing"}</h2>
              <p className="mt-1 text-lg font-extrabold">
                {price.amount}
                {price.suffix ? <span className="text-sm font-normal text-muted"> {price.suffix}</span> : null}
              </p>
              <p className="text-sm text-muted">
                {locLabel || "Location not set"} · {listing.propertyType}
              </p>
              <p className="mt-3 text-sm">
                {listing.bedrooms} beds · {listing.bathrooms} baths
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
                {listing.description || "No description yet."}
              </p>
              <p className="mt-4 text-sm">
                Phone: {listing.contactPhone || "Not set"}
                {listing.contactWhatsapp ? ` · WhatsApp: ${listing.contactWhatsapp}` : ""}
              </p>
              <p className="mt-4 text-sm text-muted">This listing will go live immediately after you publish.</p>
            </div>
          </>
        )}

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)} disabled={busy}>
            Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button type="button" className="ml-auto" onClick={() => void next()} disabled={busy}>
            {busy ? "Saving…" : "Continue"}
          </Button>
        ) : (
          <Button type="button" className="ml-auto" onClick={() => void onSubmit()} disabled={busy}>
            {busy
              ? listing.status === "PUBLISHED" || listing.status === "PAUSED"
                ? "Saving…"
                : "Publishing…"
              : listing.status === "PUBLISHED" || listing.status === "PAUSED"
                ? "Save changes"
                : "Publish listing"}
          </Button>
        )}
      </div>
    </div>
  );
}

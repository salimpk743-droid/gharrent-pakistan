import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listAreasForCity, listCitiesForProvince, listProvinces } from "@/lib/server/locations";
import {
  PROPERTY_TYPE_META,
  PROPERTY_TYPES,
  RENT_PRESETS,
  SALE_PRESETS,
  type ListingPurpose,
} from "@/lib/constants";
import type { MarketplaceSearch } from "@/lib/rent-search";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { AreaNode, LocationNode } from "@/lib/types";

export function SearchBox({
  compact = false,
  purpose: purposeProp = "RENT",
}: {
  compact?: boolean;
  purpose?: ListingPurpose;
}) {
  const navigate = useNavigate();
  const [provinces, setProvinces] = useState<LocationNode[]>([]);
  const [cities, setCities] = useState<LocationNode[]>([]);
  const [areas, setAreas] = useState<AreaNode[]>([]);
  const [purpose, setPurpose] = useState<ListingPurpose>(purposeProp);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");
  const [type, setType] = useState("All homes");
  const [budget, setBudget] = useState("any");

  useEffect(() => {
    setPurpose(purposeProp);
  }, [purposeProp]);

  useEffect(() => {
    void listProvinces()
      .then(setProvinces)
      .catch(() => setProvinces([]));
  }, []);

  const selectedProvince = provinces.find((p) => p.slug === province);
  const selectedCity = cities.find((d) => d.slug === district);

  useEffect(() => {
    if (!selectedProvince) {
      setCities([]);
      return;
    }
    let cancelled = false;
    void listCitiesForProvince({ data: { provinceId: selectedProvince.id } })
      .then((rows) => {
        if (!cancelled) setCities(rows);
      })
      .catch(() => {
        if (!cancelled) setCities([]);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedProvince?.id]);

  useEffect(() => {
    if (!selectedCity) {
      setAreas([]);
      return;
    }
    let cancelled = false;
    void listAreasForCity({ data: { districtId: selectedCity.id } })
      .then((rows) => {
        if (!cancelled) setAreas(rows);
      })
      .catch(() => {
        if (!cancelled) setAreas([]);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCity?.id]);

  const presets = purpose === "SALE" ? SALE_PRESETS : RENT_PRESETS;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const preset = presets.find((p) => p.id === budget);
    const typeSlug = type === "All homes" ? undefined : PROPERTY_TYPE_META[type as keyof typeof PROPERTY_TYPE_META]?.slug;
    const search: MarketplaceSearch = {
      minRent: preset?.min,
      maxRent: preset?.max,
      areaSlug: area || undefined,
    };
    if (purpose === "SALE") {
      if (province && district && typeSlug) {
        void navigate({
          to: "/sale/$province/$district/$type",
          params: { province, district, type: typeSlug },
          search,
        });
        return;
      }
      if (province && district) {
        void navigate({
          to: "/sale/$province/$district",
          params: { province, district },
          search: { ...search, typeSlug },
        });
        return;
      }
      if (province) {
        void navigate({
          to: "/sale/$province",
          params: { province },
          search: { ...search, typeSlug },
        });
        return;
      }
      void navigate({ to: "/sale", search: { ...search, typeSlug } });
      return;
    }
    if (province && district && typeSlug) {
      void navigate({
        to: "/rent/$province/$district/$type",
        params: { province, district, type: typeSlug },
        search,
      });
      return;
    }
    if (province && district) {
      void navigate({
        to: "/rent/$province/$district",
        params: { province, district },
        search: { ...search, typeSlug },
      });
      return;
    }
    if (province) {
      void navigate({
        to: "/rent/$province",
        params: { province },
        search: { ...search, typeSlug },
      });
      return;
    }
    void navigate({ to: "/rent", search: { ...search, typeSlug } });
  }

  return (
    <div className={`min-w-0 overflow-hidden rounded-xl bg-white text-ink shadow-[0_18px_45px_rgba(0,0,0,0.22)] ${compact ? "p-3" : "px-3 pb-3"}`}>
      {!compact && (
        <div className="flex h-11 min-w-0 items-end gap-6 overflow-hidden border-b border-line">
          <button
            type="button"
            className={`h-11 shrink-0 px-1 text-sm font-bold ${
              purpose === "RENT" ? "border-b-2 border-forest text-forest" : "text-[#b7c2bd]"
            }`}
            onClick={() => {
              setPurpose("RENT");
              setBudget("any");
            }}
          >
            For rent
          </button>
          <button
            type="button"
            className={`h-11 shrink-0 px-1 text-sm font-bold ${
              purpose === "SALE" ? "border-b-2 border-forest text-forest" : "text-[#b7c2bd]"
            }`}
            onClick={() => {
              setPurpose("SALE");
              setBudget("any");
            }}
          >
            For sale
          </button>
        </div>
      )}
      <form onSubmit={submit} className="grid min-w-0 gap-2 pt-3 sm:grid-cols-2 lg:grid-cols-4">
        <Label>
          Province
          <Select
            value={province}
            onChange={(e) => {
              setProvince(e.target.value);
              setDistrict("");
              setArea("");
            }}
          >
            <option value="">All Pakistan</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.name}
              </option>
            ))}
          </Select>
        </Label>
        <Label>
          City
          <Select
            value={district}
            disabled={!province}
            onChange={(e) => {
              setDistrict(e.target.value);
              setArea("");
            }}
          >
            <option value="">All cities</option>
            {cities.map((d) => (
              <option key={d.id} value={d.slug}>
                {d.name}
              </option>
            ))}
          </Select>
        </Label>
        <Label>
          Area
          <Select value={area} disabled={!district} onChange={(e) => setArea(e.target.value)}>
            <option value="">All areas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.slug}>
                {a.name}
              </option>
            ))}
          </Select>
        </Label>
        <Label>
          Type
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option>All homes</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Label>
        <Label>
          {purpose === "SALE" ? "Price" : "Rent"}
          <Select value={budget} onChange={(e) => setBudget(e.target.value)}>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </Label>
        <div className="flex min-w-0 items-end sm:col-span-2 lg:col-span-3">
          <Button type="submit" className="w-full">
            <Search className="size-4" aria-hidden="true" />
            Search
          </Button>
        </div>
      </form>
    </div>
  );
}

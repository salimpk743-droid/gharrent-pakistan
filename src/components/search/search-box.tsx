import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { listLocationTree } from "@/lib/server/locations";
import { PROPERTY_TYPE_META, PROPERTY_TYPES, RENT_PRESETS } from "@/lib/constants";
import type { RentSearch } from "@/lib/rent-search";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { ProvinceNode } from "@/lib/types";

export function SearchBox({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const [tree, setTree] = useState<ProvinceNode[]>([]);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [tehsil, setTehsil] = useState("");
  const [area, setArea] = useState("");
  const [type, setType] = useState("All homes");
  const [rent, setRent] = useState("any");

  useEffect(() => {
    void listLocationTree().then(setTree).catch(() => setTree([]));
  }, []);

  const districts = useMemo(
    () => tree.find((p) => p.slug === province)?.districts ?? [],
    [tree, province],
  );
  const tehsils = useMemo(
    () => districts.find((d) => d.slug === district)?.tehsils ?? [],
    [districts, district],
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const preset = RENT_PRESETS.find((p) => p.id === rent);
    const typeSlug = type === "All homes" ? undefined : PROPERTY_TYPE_META[type as keyof typeof PROPERTY_TYPE_META]?.slug;
    const search: RentSearch = {
      q: area || undefined,
      minRent: preset?.min,
      maxRent: preset?.max,
    };
    if (province && district && typeSlug) {
      void navigate({
        to: "/rent/$province/$district/$type",
        params: { province, district, type: typeSlug },
        search,
      });
      return;
    }
    if (province && district) {
      void navigate({ to: "/rent/$province/$district", params: { province, district }, search: { ...search, typeSlug, tehsilSlug: tehsil || undefined } });
      return;
    }
    if (province) {
      void navigate({ to: "/rent/$province", params: { province }, search: { ...search, typeSlug, tehsilSlug: tehsil || undefined } });
      return;
    }
    void navigate({ to: "/rent", search: { ...search, typeSlug } });
  }

  return (
    <div className={`min-w-0 overflow-hidden rounded-xl bg-white text-ink shadow-[0_18px_45px_rgba(0,0,0,0.22)] ${compact ? "p-3" : "px-3 pb-3"}`}>
      {!compact && (
        <div className="flex h-11 min-w-0 items-end gap-6 overflow-hidden border-b border-line">
          <button type="button" className="h-11 shrink-0 border-b-2 border-forest px-1 text-sm font-bold text-forest">
            For rent
          </button>
          <span className="h-11 shrink-0 px-1 text-sm font-bold text-[#b7c2bd]" title="Commercial listings are not available yet">
            Commercial <small className="font-semibold">(later)</small>
          </span>
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
              setTehsil("");
            }}
          >
            <option value="">All Pakistan</option>
            {tree.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.name}
              </option>
            ))}
          </Select>
        </Label>
        <Label>
          District
          <Select
            value={district}
            disabled={!province}
            onChange={(e) => {
              setDistrict(e.target.value);
              setTehsil("");
            }}
          >
            <option value="">All districts</option>
            {districts.map((d) => (
              <option key={d.id} value={d.slug}>
                {d.name}
              </option>
            ))}
          </Select>
        </Label>
        <Label>
          Tehsil
          <Select value={tehsil} disabled={!district} onChange={(e) => setTehsil(e.target.value)}>
            <option value="">All tehsils</option>
            {tehsils.map((t) => (
              <option key={t.id} value={t.slug}>
                {t.name}
              </option>
            ))}
          </Select>
        </Label>
        <Label>
          Area
          <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Neighbourhood or area" />
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
          Rent
          <Select value={rent} onChange={(e) => setRent(e.target.value)}>
            {RENT_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </Label>
        <div className="flex min-w-0 items-end sm:col-span-2">
          <Button type="submit" className="w-full">
            <Search className="size-4" aria-hidden="true" />
            Search
          </Button>
        </div>
      </form>
    </div>
  );
}

import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { ensureSeedData } from "./seed";

export const listLocationTree = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeedData();
  const sql = await getSql();
  const provinces = await sql<{ id: string; slug: string; name: string }>`
    select id, slug, name from provinces order by sort_order asc, name asc
  `;
  const districts = await sql<{ id: string; province_id: string; slug: string; name: string }>`
    select id, province_id, slug, name from districts order by name asc
  `;
  const tehsils = await sql<{ id: string; district_id: string; slug: string; name: string }>`
    select id, district_id, slug, name from tehsils order by name asc
  `;
  return provinces.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    districts: districts
      .filter((d) => d.province_id === p.id)
      .map((d) => ({
        id: d.id,
        slug: d.slug,
        name: d.name,
        tehsils: tehsils
          .filter((t) => t.district_id === d.id)
          .map((t) => ({ id: t.id, slug: t.slug, name: t.name })),
      })),
  }));
});

export async function resolveLocation(slugs: {
  provinceSlug?: string;
  districtSlug?: string;
  tehsilSlug?: string;
}) {
  await ensureSeedData();
  const sql = await getSql();
  let province: { id: string; slug: string; name: string } | null = null;
  let district: { id: string; slug: string; name: string; province_id: string } | null = null;
  let tehsil: { id: string; slug: string; name: string } | null = null;
  if (slugs.provinceSlug) {
    const rows = await sql<{ id: string; slug: string; name: string }>`
      select id, slug, name from provinces where slug = ${slugs.provinceSlug} limit 1
    `;
    province = rows[0] ?? null;
  }
  if (province && slugs.districtSlug) {
    const rows = await sql<{ id: string; slug: string; name: string; province_id: string }>`
      select id, slug, name, province_id from districts
      where province_id = ${province.id} and slug = ${slugs.districtSlug} limit 1
    `;
    district = rows[0] ?? null;
  }
  if (district && slugs.tehsilSlug) {
    const rows = await sql<{ id: string; slug: string; name: string }>`
      select id, slug, name from tehsils
      where district_id = ${district.id} and slug = ${slugs.tehsilSlug} limit 1
    `;
    tehsil = rows[0] ?? null;
  }
  const label = [tehsil?.name, district?.name, province?.name].filter(Boolean).join(", ");
  return { province, district, tehsil, label: label || "Pakistan" };
}

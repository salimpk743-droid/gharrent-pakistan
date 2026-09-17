import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { ensureSeedData } from "./seed";

const PROVINCE_SLUG_ALIASES: Record<string, string> = {
  islamabad: "islamabad-capital-territory",
};

function canonicalProvinceSlug(slug?: string) {
  if (!slug) return slug;
  return PROVINCE_SLUG_ALIASES[slug] ?? slug;
}

export const listLocationTree = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeedData();
  const sql = await getSql();
  const provinces = await sql<{ id: string; slug: string; name: string }>`
    select id, slug, name from provinces order by sort_order asc, name asc
  `;
  const districts = await sql<{ id: string; province_id: string; slug: string; name: string }>`
    select id, province_id, slug, name from districts order by name asc
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
      })),
  }));
});

export const listAreasForCity = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ districtId: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    await ensureSeedData();
    const sql = await getSql();
    return sql<{ id: string; slug: string; name: string; aliases: string }>`
      select id, slug, name, aliases from areas
      where district_id = ${data.districtId}
      order by name asc
    `;
  });

export async function resolveLocation(slugs: {
  provinceSlug?: string;
  districtSlug?: string;
  tehsilSlug?: string;
  areaSlug?: string;
}) {
  await ensureSeedData();
  const sql = await getSql();
  let province: { id: string; slug: string; name: string } | null = null;
  let district: { id: string; slug: string; name: string; province_id: string } | null = null;
  let tehsil: { id: string; slug: string; name: string } | null = null;
  let area: { id: string; slug: string; name: string } | null = null;
  const provinceSlug = canonicalProvinceSlug(slugs.provinceSlug);
  if (provinceSlug) {
    const rows = await sql<{ id: string; slug: string; name: string }>`
      select id, slug, name from provinces where slug = ${provinceSlug} limit 1
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
  if (district && slugs.areaSlug) {
    const rows = await sql<{ id: string; slug: string; name: string }>`
      select id, slug, name from areas
      where district_id = ${district.id} and slug = ${slugs.areaSlug} limit 1
    `;
    area = rows[0] ?? null;
  }
  const label = [area?.name, district?.name, province?.name].filter(Boolean).join(", ");
  return { province, district, tehsil, area, label: label || "Pakistan" };
}

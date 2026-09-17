import { flattenLocations } from "@/data/pakistan-locations";
import { flattenAreas } from "@/data/pakistan-areas";
import { slugify } from "@/lib/utils";
import { getSql } from "@/lib/db";

type SeedSql = Awaited<ReturnType<typeof getSql>>;

const globalRef = globalThis as typeof globalThis & {
  __gharrentSeed__?: Promise<void>;
};

async function seedLocations(sql: SeedSql) {
  const [{ n }] = await sql<{ n: number }>`select count(*)::int as n from provinces`;
  if (n > 0) return;
  const { provinces, districts, tehsils } = flattenLocations();
  for (const p of provinces) {
    await sql`insert into provinces (id, slug, name, sort_order)
      values (${p.id}, ${p.slug}, ${p.name}, ${p.sortOrder})
      on conflict (id) do nothing`;
  }
  for (const d of districts) {
    await sql`insert into districts (id, province_id, slug, name)
      values (${d.id}, ${d.provinceId}, ${d.slug}, ${d.name})
      on conflict (id) do nothing`;
  }
  for (const t of tehsils) {
    await sql`insert into tehsils (id, district_id, slug, name)
      values (${t.id}, ${t.districtId}, ${t.slug}, ${t.name})
      on conflict (id) do nothing`;
  }
}

async function repairIslamabadIds(sql: SeedSql) {
  await sql`
    update properties
    set province_id = 'islamabad-capital-territory',
        district_id = 'islamabad-capital-territory-islamabad'
    where province_id = 'islamabad' or district_id = 'islamabad-islamabad'
  `;
  await sql`
    update districts
    set name = 'Islamabad'
    where id = 'islamabad-capital-territory-islamabad' and name <> 'Islamabad'
  `;
}

async function seedAreas(sql: SeedSql) {
  const existing = await sql<{ id: string }>`select id from areas`;
  const have = new Set(existing.map((row) => row.id));
  const areas = flattenAreas();
  for (const a of areas) {
    if (have.has(a.id)) continue;
    await sql`insert into areas (id, district_id, slug, name, aliases)
      values (${a.id}, ${a.districtId}, ${a.slug}, ${a.name}, ${a.aliases})
      on conflict (id) do nothing`;
  }
}

async function matchPropertyAreas(sql: SeedSql) {
  const unmatched = await sql<{ id: string; district_id: string | null; area: string }>`
    select id, district_id, area from properties
    where area_id is null and area <> ''
  `;
  if (unmatched.length === 0) return;
  const areas = await sql<{ id: string; district_id: string; name: string; aliases: string }>`
    select id, district_id, name, aliases from areas
  `;
  const byDistrict = new Map<string, typeof areas>();
  for (const a of areas) {
    const list = byDistrict.get(a.district_id) ?? [];
    list.push(a);
    byDistrict.set(a.district_id, list);
  }
  for (const p of unmatched) {
    if (!p.district_id) continue;
    const list = byDistrict.get(p.district_id) ?? [];
    const needle = p.area.toLowerCase().trim();
    const match = list.find((a) => {
      if (a.name.toLowerCase() === needle) return true;
      const aliases = a.aliases ? a.aliases.split("|").map((s) => s.toLowerCase().trim()) : [];
      return aliases.includes(needle);
    });
    if (match) {
      await sql`update properties set area_id = ${match.id} where id = ${p.id}`;
    }
  }
}

type Demo = {
  title: string;
  type: string;
  purpose?: "RENT" | "SALE";
  provinceId: string;
  districtId: string;
  tehsilId: string;
  area: string;
  address: string;
  rent: number;
  beds: number;
  baths: number;
  size: number;
  sizeUnit: string;
  furnished: string;
  image: string;
  description: string;
  featured?: boolean;
  parking?: boolean;
  family?: boolean;
  bachelor?: boolean;
};

const DEMOS: Demo[] = [
  {
    title: "Modern 5 Marla family home",
    type: "House",
    provinceId: "punjab",
    districtId: "punjab-lahore",
    tehsilId: "punjab-lahore-lahore-city",
    area: "Johar Town",
    address: "Block G, Johar Town",
    rent: 65000,
    beds: 3,
    baths: 3,
    size: 5,
    sizeUnit: "MARLA",
    furnished: "SEMI_FURNISHED",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
    description:
      "A well-kept family house in Johar Town with tiled floors, a small lawn and street parking. Near schools, a masjid and the main market. Sample listing for demonstration only.",
    featured: true,
    parking: true,
    family: true,
  },
  {
    title: "Bright apartment near F-11 Markaz",
    type: "Apartment",
    provinceId: "islamabad-capital-territory",
    districtId: "islamabad-capital-territory-islamabad",
    tehsilId: "islamabad-capital-territory-islamabad-islamabad",
    area: "F-11",
    address: "F-11/2, Islamabad",
    rent: 95000,
    beds: 2,
    baths: 2,
    size: 1150,
    sizeUnit: "SQFT",
    furnished: "FURNISHED",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80",
    description:
      "A bright two-bed apartment a short walk from F-11 Markaz. Lift access, backup electricity and a building guard. Sample listing for demonstration only.",
    featured: true,
    parking: true,
    family: true,
  },
  {
    title: "Peaceful upper portion with parking",
    type: "Portion",
    provinceId: "sindh",
    districtId: "sindh-karachi",
    tehsilId: "sindh-karachi-malir",
    area: "DHA Phase 6",
    address: "Street 12, DHA Phase 6",
    rent: 72000,
    beds: 3,
    baths: 3,
    size: 10,
    sizeUnit: "MARLA",
    furnished: "UNFURNISHED",
    image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=80",
    description:
      "An independent upper portion with a separate entrance and covered parking. Quiet street, good water supply. Sample listing for demonstration only.",
    parking: true,
    family: true,
  },
  {
    title: "Garden-facing executive flat",
    type: "Apartment",
    provinceId: "punjab",
    districtId: "punjab-lahore",
    tehsilId: "punjab-lahore-model-town",
    area: "Gulberg",
    address: "Gulberg III",
    rent: 115000,
    beds: 3,
    baths: 3,
    size: 1600,
    sizeUnit: "SQFT",
    furnished: "FURNISHED",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80",
    description:
      "A larger apartment overlooking a garden belt in Gulberg. Suitable for a family that wants city access without a full house. Sample listing for demonstration only.",
    featured: true,
    parking: true,
    family: true,
  },
  {
    title: "Saddar family house with courtyard",
    type: "House",
    provinceId: "punjab",
    districtId: "punjab-rawalpindi",
    tehsilId: "punjab-rawalpindi-rawalpindi",
    area: "Saddar",
    address: "Near Committee Chowk",
    rent: 55000,
    beds: 4,
    baths: 3,
    size: 7,
    sizeUnit: "MARLA",
    furnished: "UNFURNISHED",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1400&q=80",
    description:
      "A traditional family house close to Saddar with a small inner courtyard. Walkable to shops and transport. Sample listing for demonstration only.",
    parking: true,
    family: true,
  },
  {
    title: "University Town house for a family",
    type: "House",
    provinceId: "khyber-pakhtunkhwa",
    districtId: "khyber-pakhtunkhwa-peshawar",
    tehsilId: "khyber-pakhtunkhwa-peshawar-peshawar-city",
    area: "University Town",
    address: "Street 4, University Town",
    rent: 48000,
    beds: 3,
    baths: 2,
    size: 10,
    sizeUnit: "MARLA",
    furnished: "SEMI_FURNISHED",
    image: "https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=1400&q=80",
    description:
      "A calm house in University Town, close to schools and the main road. Separate drawing room and a small lawn. Sample listing for demonstration only.",
    parking: true,
    family: true,
  },
  {
    title: "Madina Town portion on the first floor",
    type: "Portion",
    provinceId: "punjab",
    districtId: "punjab-faisalabad",
    tehsilId: "punjab-faisalabad-faisalabad-city",
    area: "Madina Town",
    address: "Madina Town, Faisalabad",
    rent: 35000,
    beds: 2,
    baths: 2,
    size: 5,
    sizeUnit: "MARLA",
    furnished: "UNFURNISHED",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80",
    description:
      "A compact first-floor portion suitable for a small family. Market and masjid within a short walk. Sample listing for demonstration only.",
    family: true,
  },
  {
    title: "Gulgasht colony family house",
    type: "House",
    provinceId: "punjab",
    districtId: "punjab-multan",
    tehsilId: "punjab-multan-multan-city",
    area: "Gulgasht Colony",
    address: "Gulgasht, Multan",
    rent: 42000,
    beds: 3,
    baths: 2,
    size: 7,
    sizeUnit: "MARLA",
    furnished: "UNFURNISHED",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
    description:
      "A straightforward family house in Gulgasht Colony. Car porch, two balconies and a tiled kitchen. Sample listing for demonstration only.",
    parking: true,
    family: true,
  },
  {
    title: "Clifton apartment with sea breeze",
    type: "Apartment",
    provinceId: "sindh",
    districtId: "sindh-karachi",
    tehsilId: "sindh-karachi-karachi-south",
    area: "Clifton",
    address: "Block 5, Clifton",
    rent: 140000,
    beds: 2,
    baths: 2,
    size: 1400,
    sizeUnit: "SQFT",
    furnished: "FURNISHED",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80",
    description:
      "A furnished Clifton apartment in a building with a generator and security. Close to restaurants and the seafront. Sample listing for demonstration only.",
    parking: true,
    family: true,
    bachelor: true,
  },
  {
    title: "F-7 house with a quiet lawn",
    type: "House",
    provinceId: "islamabad-capital-territory",
    districtId: "islamabad-capital-territory-islamabad",
    tehsilId: "islamabad-capital-territory-islamabad-islamabad",
    area: "F-7",
    address: "F-7/3, Islamabad",
    rent: 180000,
    beds: 4,
    baths: 4,
    size: 1,
    sizeUnit: "KANAL",
    furnished: "SEMI_FURNISHED",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
    description:
      "A larger sector house with a lawn, servant quarter and covered parking. Suitable for a family that wants space in the city centre. Sample listing for demonstration only.",
    featured: true,
    parking: true,
    family: true,
  },
  {
    title: "Private room in DHA Lahore",
    type: "Room",
    provinceId: "punjab",
    districtId: "punjab-lahore",
    tehsilId: "punjab-lahore-cantonment",
    area: "DHA Phase 5",
    address: "DHA Phase 5, Lahore",
    rent: 22000,
    beds: 1,
    baths: 1,
    size: 180,
    sizeUnit: "SQFT",
    furnished: "FURNISHED",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80",
    description:
      "A furnished private room with attached bath in a family house. Kitchen access and street parking. Sample listing for demonstration only.",
    bachelor: true,
  },
  {
    title: "Abbottabad hillside family house",
    type: "House",
    provinceId: "khyber-pakhtunkhwa",
    districtId: "khyber-pakhtunkhwa-abbottabad",
    tehsilId: "khyber-pakhtunkhwa-abbottabad-abbottabad",
    area: "Jinnahabad",
    address: "Jinnahabad, Abbottabad",
    rent: 40000,
    beds: 3,
    baths: 2,
    size: 10,
    sizeUnit: "MARLA",
    furnished: "UNFURNISHED",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1400&q=80",
    description:
      "A cool-weather family house in Jinnahabad with mountain views and a small garden. Sample listing for demonstration only.",
    parking: true,
    family: true,
  },
  {
    title: "10 Marla plot in DHA Phase 5",
    type: "Plot",
    purpose: "SALE",
    provinceId: "punjab",
    districtId: "punjab-lahore",
    tehsilId: "punjab-lahore-cantonment",
    area: "DHA Phase 5",
    address: "DHA Phase 5, Lahore",
    rent: 35000000,
    beds: 0,
    baths: 0,
    size: 10,
    sizeUnit: "MARLA",
    furnished: "UNFURNISHED",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80",
    description:
      "A regular 10 marla residential plot in DHA Phase 5, Lahore. Corner-adjacent street, possession available. Sample listing for demonstration only.",
    featured: true,
    family: true,
  },
  {
    title: "F-10 family house for sale",
    type: "House",
    purpose: "SALE",
    provinceId: "islamabad-capital-territory",
    districtId: "islamabad-capital-territory-islamabad",
    tehsilId: "islamabad-capital-territory-islamabad-islamabad",
    area: "F-10",
    address: "F-10/3, Islamabad",
    rent: 85000000,
    beds: 5,
    baths: 5,
    size: 1,
    sizeUnit: "KANAL",
    furnished: "SEMI_FURNISHED",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80",
    description:
      "A one-kanal family house in F-10 with a lawn, drawing and dining, and covered parking. Sample listing for demonstration only.",
    featured: true,
    parking: true,
    family: true,
  },
  {
    title: "Clifton shop on a busy street",
    type: "Shop",
    purpose: "SALE",
    provinceId: "sindh",
    districtId: "sindh-karachi",
    tehsilId: "sindh-karachi-karachi-south",
    area: "Clifton",
    address: "Block 2, Clifton",
    rent: 28000000,
    beds: 0,
    baths: 1,
    size: 900,
    sizeUnit: "SQFT",
    furnished: "UNFURNISHED",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80",
    description:
      "A ground-floor shop in Clifton suitable for retail. Frontage on a busy street with nearby parking. Sample listing for demonstration only.",
    parking: true,
  },
];

async function seedDemoProperties(sql: SeedSql) {
  const [{ n }] = await sql<{ n: number }>`select count(*)::int as n from properties`;
  if (n === 0) {
    await insertDemos(sql, DEMOS);
    return;
  }
  const [{ sales }] = await sql<{ sales: number }>`
    select count(*)::int as sales from properties where listing_purpose = 'SALE' and deleted_at is null
  `;
  if (sales === 0) {
    const [{ real }] = await sql<{ real: number }>`
      select count(*)::int as real from properties where is_sample = false and deleted_at is null
    `;
    if (real === 0) {
      await insertDemos(sql, DEMOS.filter((d) => d.purpose === "SALE"));
    }
  }
}

async function insertDemos(sql: SeedSql, demos: Demo[]) {
  const expires = new Date();
  expires.setUTCDate(expires.getUTCDate() + 60);
  for (const d of demos) {
    const id = crypto.randomUUID();
    const slug = `${slugify(d.title)}-${slugify(d.area)}-${id.slice(0, 6)}`;
    const areaId = `${d.districtId}-${slugify(d.area)}`;
    const purpose = d.purpose ?? "RENT";
    await sql`insert into properties (
      id, owner_id, title, slug, description, property_type, listing_purpose, status,
      province_id, district_id, tehsil_id, area_id, area, address,
      monthly_rent, bedrooms, bathrooms, property_size, size_unit, furnished_status,
      parking, electricity, gas, water, family_allowed, bachelor_allowed,
      contact_phone, contact_whatsapp, is_featured, is_sample,
      published_at, expires_at, available_from
    ) values (
      ${id}, ${"system-demo"}, ${d.title}, ${slug}, ${d.description}, ${d.type}, ${purpose}, ${"PUBLISHED"},
      ${d.provinceId}, ${d.districtId}, ${d.tehsilId}, ${areaId}, ${d.area}, ${d.address},
      ${d.rent}, ${d.beds}, ${d.baths}, ${d.size}, ${d.sizeUnit}, ${d.furnished},
      ${Boolean(d.parking)}, ${true}, ${true}, ${true}, ${d.family !== false}, ${Boolean(d.bachelor)},
      ${"03001234567"}, ${"03001234567"}, ${Boolean(d.featured)}, ${true},
      ${new Date().toISOString()}, ${expires.toISOString()}, ${new Date().toISOString().slice(0, 10)}
    )`;
    const imageId = crypto.randomUUID();
    await sql`insert into property_images (
      id, property_id, storage_key, url, mime_type, sort_order, is_cover, width, height
    ) values (
      ${imageId}, ${id}, ${`demo/${imageId}`}, ${d.image}, ${"image/jpeg"}, ${0}, ${true}, ${1400}, ${900}
    )`;
  }
}

async function runSeed() {
  const sql = await getSql();
  await seedLocations(sql);
  await repairIslamabadIds(sql);
  await seedAreas(sql);
  await matchPropertyAreas(sql);
  await seedDemoProperties(sql);
}

export function ensureSeedData(): Promise<void> {
  if (!globalRef.__gharrentSeed__) {
    globalRef.__gharrentSeed__ = runSeed().catch((err) => {
      globalRef.__gharrentSeed__ = undefined;
      throw err;
    });
  }
  return globalRef.__gharrentSeed__;
}

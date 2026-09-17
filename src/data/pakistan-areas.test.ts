import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { flattenAreas } from "./pakistan-areas.ts";
import { flattenLocations, LOCATION_TREE } from "./pakistan-locations.ts";

describe("pakistan area hierarchy", () => {
  const { provinces, districts } = flattenLocations();
  const areas = flattenAreas();

  function namesFor(districtId: string) {
    return areas.filter((a) => a.districtId === districtId).map((a) => a.name);
  }

  function aliasesFor(districtId: string, name: string) {
    const row = areas.find((a) => a.districtId === districtId && a.name === name);
    return row?.aliases.split("|").filter(Boolean) ?? [];
  }

  it("gives every city its own area list and never mixes cities", () => {
    const islamabad = namesFor("islamabad-capital-territory-islamabad");
    const lahore = namesFor("punjab-lahore");
    const karachi = namesFor("sindh-karachi");
    assert.ok(islamabad.includes("F-10"));
    assert.ok(islamabad.includes("F-11"));
    assert.ok(islamabad.includes("DHA"));
    assert.ok(lahore.includes("Johar Town"));
    assert.ok(lahore.includes("Gulberg"));
    assert.ok(lahore.includes("DHA Phase 5"));
    assert.ok(karachi.includes("Clifton"));
    assert.ok(karachi.includes("Gulshan-e-Iqbal"));
    assert.ok(!lahore.includes("F-10"));
    assert.ok(!karachi.includes("Johar Town"));
    assert.ok(!islamabad.includes("Clifton"));
  });

  it("covers other major cities and falls back for smaller districts", () => {
    const peshawar = namesFor("khyber-pakhtunkhwa-peshawar");
    const quetta = namesFor("balochistan-quetta");
    const rawalpindi = namesFor("punjab-rawalpindi");
    assert.ok(peshawar.includes("Hayatabad"));
    assert.ok(quetta.includes("Jinnah Town"));
    assert.ok(rawalpindi.includes("Bahria Town"));
    const covered = new Set(areas.map((a) => a.districtId));
    for (const d of districts) {
      assert.ok(covered.has(d.id), `missing areas for ${d.id}`);
      assert.ok(namesFor(d.id).length >= 1, `empty areas for ${d.id}`);
    }
  });

  it("canonicalises DHA aliases instead of duplicating phases", () => {
    const lahore = areas.filter((a) => a.districtId === "punjab-lahore");
    const phase1 = lahore.filter((a) => a.slug.includes("dha-phase-1") || a.name === "DHA Phase 1");
    assert.equal(phase1.length, 1);
    assert.ok(phase1[0].aliases.includes("DHA 1"));
  });

  it("includes Islamabad sectors and rural localities such as Ali Pur", () => {
    const islamabad = namesFor("islamabad-capital-territory-islamabad");
    for (const name of ["F-5", "F-9", "F-10", "I-15", "B-17", "Ali Pur", "Bhara Kahu", "Tarnol", "Nilore", "Sihala", "Shah Allah Ditta"]) {
      assert.ok(islamabad.includes(name), `Islamabad missing ${name}`);
    }
    assert.ok(aliasesFor("islamabad-capital-territory-islamabad", "Ali Pur").includes("Alipur"));
  });

  it("includes Buner tehsils and towns including Mandanr", () => {
    const buner = namesFor("khyber-pakhtunkhwa-buner");
    for (const name of ["Mandanr", "Daggar", "Gagra", "Khudu Khel", "Gadezai", "Chamla", "Chagharzai", "Pir Baba", "Totalai", "Torwarsak"]) {
      assert.ok(buner.includes(name), `Buner missing ${name}`);
    }
    assert.ok(aliasesFor("khyber-pakhtunkhwa-buner", "Mandanr").includes("Mandarn"));
  });

  it("preserves existing shipped neighbourhood names", () => {
    const islamabad = namesFor("islamabad-capital-territory-islamabad");
    const lahore = namesFor("punjab-lahore");
    const karachi = namesFor("sindh-karachi");
    assert.ok(islamabad.includes("F-10"));
    assert.ok(lahore.includes("Johar Town"));
    assert.ok(karachi.includes("Clifton"));
    assert.ok(namesFor("punjab-rawalpindi").includes("Saddar"));
    assert.ok(namesFor("khyber-pakhtunkhwa-peshawar").includes("University Town"));
  });

  it("keeps Karachi as one city and adds newly created Punjab districts", () => {
    const ids = new Set(districts.map((d) => d.id));
    assert.ok(ids.has("sindh-karachi"));
    assert.ok(!ids.has("sindh-karachi-central"));
    assert.ok(!ids.has("sindh-karachi-east"));
    for (const id of ["punjab-bhakkar", "punjab-khanewal", "punjab-chiniot", "punjab-layyah", "punjab-muzaffargarh", "punjab-kot-addu", "punjab-murree", "punjab-wazirabad", "punjab-talagang", "punjab-taunsa", "punjab-rajanpur", "punjab-toba-tek-singh"]) {
      assert.ok(ids.has(id), `missing district ${id}`);
    }
  });

  it("keeps every previously shipped city key", () => {
    const ids = new Set(districts.map((d) => d.id));
    const required = [
      "punjab-lahore",
      "punjab-rawalpindi",
      "punjab-faisalabad",
      "sindh-karachi",
      "sindh-nawabshah",
      "khyber-pakhtunkhwa-swat",
      "khyber-pakhtunkhwa-chitral",
      "khyber-pakhtunkhwa-buner",
      "balochistan-turbat",
      "balochistan-lasbela",
      "azad-jammu-and-kashmir-rawalakot",
      "islamabad-capital-territory-islamabad",
    ];
    for (const id of required) {
      assert.ok(ids.has(id), `lost shipped city ${id}`);
    }
  });

  it("covers all seven provinces and does not treat tehsils as extra cities", () => {
    assert.equal(provinces.length, 7);
    assert.ok(provinces.some((p) => p.id === "punjab"));
    assert.ok(provinces.some((p) => p.id === "islamabad-capital-territory"));
    assert.ok(!districts.some((d) => d.id === "khyber-pakhtunkhwa-mandanr"));
    assert.ok(LOCATION_TREE["Khyber Pakhtunkhwa"].Buner.includes("Mandanr"));
  });
});

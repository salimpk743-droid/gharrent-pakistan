import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { flattenAreas } from "./pakistan-areas.ts";
import { flattenLocations } from "./pakistan-locations.ts";

describe("pakistan area hierarchy", () => {
  const { districts } = flattenLocations();
  const areas = flattenAreas();

  function namesFor(districtId: string) {
    return areas.filter((a) => a.districtId === districtId).map((a) => a.name);
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
    }
  });

  it("canonicalises DHA aliases instead of duplicating phases", () => {
    const lahore = areas.filter((a) => a.districtId === "punjab-lahore");
    const phase1 = lahore.filter((a) => a.slug.includes("dha-phase-1") || a.name === "DHA Phase 1");
    assert.equal(phase1.length, 1);
    assert.ok(phase1[0].aliases.includes("DHA 1"));
  });
});

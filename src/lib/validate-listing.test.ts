import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateForSubmit } from "./validate-listing.ts";

const valid = {
  title: "5 Marla family house in Johar Town",
  description: "A bright family house with parking, gas and nearby schools. Suitable for a family.",
  propertyType: "House",
  provinceId: "punjab",
  districtId: "punjab-lahore",
  area: "Johar Town",
  monthlyRent: 65000,
  bedrooms: 3,
  bathrooms: 3,
  contactPhone: "03001234567",
  imageCount: 2,
  sizeUnit: "MARLA",
  furnishedStatus: "UNFURNISHED",
};

describe("listing submit validation", () => {
  it("accepts a complete listing", () => {
    assert.deepEqual(validateForSubmit(valid), []);
  });

  it("requires location, photos, phone and a real title", () => {
    const errors = validateForSubmit({
      title: "Home",
      monthlyRent: 0,
      imageCount: 0,
      contactPhone: "abc",
    });
    assert.ok(errors.some((e) => /title/i.test(e)));
    assert.ok(errors.some((e) => /province/i.test(e)));
    assert.ok(errors.some((e) => /cover photo/i.test(e)));
    assert.ok(errors.some((e) => /mobile/i.test(e)));
    assert.ok(errors.some((e) => /rent/i.test(e)));
  });
});

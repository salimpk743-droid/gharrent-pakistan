import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isLikelyDuplicate } from "./listing-spam.ts";

const base = {
  contactPhone: "+923001234567",
  districtId: "punjab-lahore",
  propertyType: "House",
  listingPurpose: "RENT",
  monthlyRent: 65000,
  area: "Johar Town",
  title: "3 Bed House for Rent in Johar Town, Lahore",
  description: "Nice house",
  bedrooms: 3,
  bathrooms: 2,
};

describe("duplicate listing check", () => {
  it("flags the same property posted twice", () => {
    assert.equal(isLikelyDuplicate(base, { ...base }), true);
    assert.equal(isLikelyDuplicate(base, { ...base, area: "johar  town" }), true);
  });
  it("ignores minor fields (title, description, bedrooms, bathrooms)", () => {
    assert.equal(isLikelyDuplicate(base, { ...base, title: "Another title" }), true);
    assert.equal(isLikelyDuplicate(base, { ...base, description: "Reworded" }), true);
    assert.equal(isLikelyDuplicate(base, { ...base, bedrooms: 4, bathrooms: 3 }), true);
  });
  it("treats a tiny price change as the same price", () => {
    assert.equal(isLikelyDuplicate(base, { ...base, monthlyRent: 65500 }), true);
    assert.equal(isLikelyDuplicate(base, { ...base, monthlyRent: 64400 }), true);
  });
  it("allows a clearly different price, area, type, purpose or phone", () => {
    assert.equal(isLikelyDuplicate(base, { ...base, monthlyRent: 70000 }), false);
    assert.equal(isLikelyDuplicate(base, { ...base, area: "DHA" }), false);
    assert.equal(isLikelyDuplicate(base, { ...base, area: "" }), false);
    assert.equal(isLikelyDuplicate(base, { ...base, propertyType: "Portion" }), false);
    assert.equal(isLikelyDuplicate(base, { ...base, listingPurpose: "SALE" }), false);
    assert.equal(isLikelyDuplicate(base, { ...base, contactPhone: "+923009999999" }), false);
    assert.equal(isLikelyDuplicate(base, { ...base, districtId: "sindh-karachi" }), false);
  });
  it("ignores ads without a phone or city", () => {
    assert.equal(isLikelyDuplicate({ ...base, contactPhone: "" }, { ...base, contactPhone: "" }), false);
    assert.equal(isLikelyDuplicate({ ...base, districtId: null }, { ...base, districtId: null }), false);
  });
});

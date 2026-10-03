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
};

describe("duplicate listing check", () => {
  it("flags the same property posted twice", () => {
    assert.equal(isLikelyDuplicate(base, { ...base, title: "Another title" }), true);
    assert.equal(isLikelyDuplicate(base, { ...base, area: "" }), true);
  });
  it("allows different price, area, type, purpose or phone", () => {
    assert.equal(isLikelyDuplicate(base, { ...base, monthlyRent: 70000 }), false);
    assert.equal(isLikelyDuplicate(base, { ...base, area: "DHA", title: "x" }), false);
    assert.equal(isLikelyDuplicate(base, { ...base, propertyType: "Portion" }), false);
    assert.equal(isLikelyDuplicate(base, { ...base, listingPurpose: "SALE" }), false);
    assert.equal(isLikelyDuplicate(base, { ...base, contactPhone: "+923009999999" }), false);
  });
  it("ignores ads without a phone or city", () => {
    assert.equal(isLikelyDuplicate({ ...base, contactPhone: "" }, { ...base, contactPhone: "" }), false);
  });
});

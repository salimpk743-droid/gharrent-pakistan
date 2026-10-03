import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { autoListingTitle, needsAutoTitle } from "./listing-title.ts";

describe("auto listing title", () => {
  it("uses beds, type, purpose and place", () => {
    assert.equal(
      autoListingTitle({ propertyType: "House", bedrooms: 3, listingPurpose: "RENT", area: "Johar Town", districtName: "Lahore" }),
      "3 Bed House for Rent in Johar Town, Lahore",
    );
  });
  it("skips bedrooms for plots and shops and handles sale", () => {
    assert.equal(
      autoListingTitle({ propertyType: "Plot", bedrooms: 2, listingPurpose: "SALE", districtName: "Multan" }),
      "Plot for Sale in Multan",
    );
  });
  it("never exceeds 80 characters and is at least 8", () => {
    const t = autoListingTitle({ propertyType: "Apartment", bedrooms: 2, area: "x".repeat(90), districtName: "Karachi" });
    assert.ok(t.length <= 80 && t.length >= 8);
    assert.ok(autoListingTitle({}).length >= 8);
  });
  it("detects missing titles", () => {
    assert.equal(needsAutoTitle("Untitled listing"), true);
    assert.equal(needsAutoTitle(""), true);
    assert.equal(needsAutoTitle("Family house near park"), false);
  });
});

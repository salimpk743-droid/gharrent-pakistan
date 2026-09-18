import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { searchPageCopy } from "./search-copy.ts";

describe("search page copy batch 1", () => {
  it("uses mixed-type copy on the Lahore rent city page", () => {
    const copy = searchPageCopy({ purpose: "RENT", province: "punjab", district: "lahore" });
    assert.equal(copy?.title, "Property for Rent in Lahore | Apna Ghar");
    assert.equal(copy?.h1, "Property for Rent in Lahore");
    assert.match(copy?.description || "", /houses, flats and rooms/i);
    assert.match(copy?.intro || "", /Johar Town/);
    assert.match(copy?.intro || "", /Gulberg/);
    assert.match(copy?.intro || "", /DHA/);
    assert.doesNotMatch(copy?.intro || "", /portion/i);
    assert.doesNotMatch(copy?.title || "", /^Houses for Rent in Lahore/);
  });

  it("uses houses-for-rent copy for Lahore houses", () => {
    const copy = searchPageCopy({ purpose: "RENT", province: "punjab", district: "lahore", type: "houses" });
    assert.equal(copy?.title, "Houses for Rent in Lahore | Apna Ghar");
    assert.equal(copy?.h1, "Houses for Rent in Lahore");
    assert.match(copy?.intro || "", /5 marla/i);
    assert.match(copy?.intro || "", /Johar Town/);
    assert.doesNotMatch(copy?.intro || "", /10 marla/i);
    assert.doesNotMatch(copy?.intro || "", /kanal/i);
    assert.equal(
      searchPageCopy({ purpose: "RENT", province: "punjab", district: "lahore", type: "house" })?.h1,
      copy?.h1,
    );
  });

  it("uses flats terminology for Lahore apartments", () => {
    const copy = searchPageCopy({ purpose: "RENT", province: "punjab", district: "lahore", type: "apartments" });
    assert.equal(copy?.title, "Flats for Rent in Lahore | Apna Ghar");
    assert.equal(copy?.h1, "Flats for Rent in Lahore");
    assert.match(copy?.intro || "", /apartments/i);
    assert.match(copy?.intro || "", /Gulberg/);
  });

  it("names Islamabad, not ICT, on Islamabad houses", () => {
    const copy = searchPageCopy({
      purpose: "RENT",
      province: "islamabad-capital-territory",
      district: "islamabad",
      type: "houses",
    });
    assert.equal(copy?.title, "Houses for Rent in Islamabad | Apna Ghar");
    assert.equal(copy?.h1, "Houses for Rent in Islamabad");
    assert.match(copy?.intro || "", /1 kanal/i);
    assert.match(copy?.intro || "", /F-7/);
    assert.doesNotMatch(copy?.title || "", /Capital Territory/);
    assert.doesNotMatch(copy?.h1 || "", /Capital Territory/);
    assert.doesNotMatch(copy?.intro || "", /Capital Territory/);
    assert.doesNotMatch(copy?.intro || "", /5 marla/i);
  });

  it("does not override other marketplace pages", () => {
    assert.equal(searchPageCopy({ purpose: "RENT", province: "punjab", district: "lahore", type: "rooms" }), undefined);
    assert.equal(searchPageCopy({ purpose: "SALE", province: "punjab", district: "lahore" }), undefined);
    assert.equal(searchPageCopy({ purpose: "RENT", province: "sindh", district: "karachi" }), undefined);
    assert.equal(searchPageCopy({ purpose: "RENT", province: "punjab" }), undefined);
  });
});

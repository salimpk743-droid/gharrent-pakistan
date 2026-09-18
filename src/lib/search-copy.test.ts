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

describe("search page copy batch 2", () => {
  it("uses property copy on the Peshawar rent city page", () => {
    const copy = searchPageCopy({
      purpose: "RENT",
      province: "khyber-pakhtunkhwa",
      district: "peshawar",
    });
    assert.equal(copy?.title, "Property for Rent in Peshawar | Apna Ghar");
    assert.equal(copy?.h1, "Property for Rent in Peshawar");
    assert.match(copy?.intro || "", /10 marla/i);
    assert.match(copy?.intro || "", /University Town/);
    assert.doesNotMatch(copy?.title || "", /^Houses for Rent in Peshawar/);
    assert.doesNotMatch(copy?.intro || "", /Hayatabad/);
    assert.doesNotMatch(copy?.intro || "", /flat|apartment|portion/i);
  });

  it("uses houses-for-rent copy for Peshawar houses", () => {
    const copy = searchPageCopy({
      purpose: "RENT",
      province: "khyber-pakhtunkhwa",
      district: "peshawar",
      type: "houses",
    });
    assert.equal(copy?.title, "Houses for Rent in Peshawar | Apna Ghar");
    assert.equal(copy?.h1, "Houses for Rent in Peshawar");
    assert.match(copy?.intro || "", /10 marla/i);
    assert.match(copy?.intro || "", /University Town/);
    assert.doesNotMatch(copy?.h1 || "", /Khyber Pakhtunkhwa/);
  });

  it("does not treat Faisalabad rent as a houses page", () => {
    const copy = searchPageCopy({ purpose: "RENT", province: "punjab", district: "faisalabad" });
    assert.equal(copy?.title, "Property for Rent in Faisalabad | Apna Ghar");
    assert.equal(copy?.h1, "Property for Rent in Faisalabad");
    assert.match(copy?.intro || "", /portion/i);
    assert.match(copy?.intro || "", /Madina Town/);
    assert.match(copy?.intro || "", /5 marla/i);
    assert.match(copy?.intro || "", /first-floor/i);
    assert.doesNotMatch(copy?.title || "", /^Houses for Rent in Faisalabad/);
    assert.doesNotMatch(copy?.intro || "", /house|flat|apartment/i);
  });

  it("uses portions-for-rent copy for Faisalabad portions", () => {
    const copy = searchPageCopy({
      purpose: "RENT",
      province: "punjab",
      district: "faisalabad",
      type: "portions",
    });
    assert.equal(copy?.title, "Portions for Rent in Faisalabad | Apna Ghar");
    assert.equal(copy?.h1, "Portions for Rent in Faisalabad");
    assert.match(copy?.intro || "", /first-floor/i);
    assert.match(copy?.intro || "", /Madina Town/);
    assert.match(copy?.intro || "", /5 marla/i);
  });

  it("uses property copy on the Multan rent city page", () => {
    const copy = searchPageCopy({ purpose: "RENT", province: "punjab", district: "multan" });
    assert.equal(copy?.title, "Property for Rent in Multan | Apna Ghar");
    assert.equal(copy?.h1, "Property for Rent in Multan");
    assert.match(copy?.intro || "", /7 marla/i);
    assert.match(copy?.intro || "", /Gulgasht Colony/);
    assert.doesNotMatch(copy?.title || "", /^Houses for Rent in Multan/);
    assert.doesNotMatch(copy?.intro || "", /flat|apartment|portion/i);
  });

  it("uses houses-for-rent copy for Multan houses", () => {
    const copy = searchPageCopy({ purpose: "RENT", province: "punjab", district: "multan", type: "houses" });
    assert.equal(copy?.title, "Houses for Rent in Multan | Apna Ghar");
    assert.equal(copy?.h1, "Houses for Rent in Multan");
    assert.match(copy?.intro || "", /7 marla/i);
    assert.match(copy?.intro || "", /Gulgasht Colony/);
  });

  it("skips empty batch-2 city and type pages", () => {
    const skipped = [
      { purpose: "SALE" as const, province: "khyber-pakhtunkhwa", district: "peshawar" },
      { purpose: "SALE" as const, province: "khyber-pakhtunkhwa", district: "peshawar", type: "houses" },
      { purpose: "RENT" as const, province: "khyber-pakhtunkhwa", district: "peshawar", type: "apartments" },
      { purpose: "SALE" as const, province: "khyber-pakhtunkhwa", district: "peshawar", type: "apartments" },
      { purpose: "RENT" as const, province: "khyber-pakhtunkhwa", district: "peshawar", type: "portions" },
      { purpose: "SALE" as const, province: "khyber-pakhtunkhwa", district: "peshawar", type: "portions" },
      { purpose: "SALE" as const, province: "punjab", district: "faisalabad" },
      { purpose: "RENT" as const, province: "punjab", district: "faisalabad", type: "houses" },
      { purpose: "SALE" as const, province: "punjab", district: "faisalabad", type: "houses" },
      { purpose: "RENT" as const, province: "punjab", district: "faisalabad", type: "apartments" },
      { purpose: "SALE" as const, province: "punjab", district: "faisalabad", type: "apartments" },
      { purpose: "SALE" as const, province: "punjab", district: "faisalabad", type: "portions" },
      { purpose: "SALE" as const, province: "punjab", district: "multan" },
      { purpose: "SALE" as const, province: "punjab", district: "multan", type: "houses" },
      { purpose: "RENT" as const, province: "punjab", district: "multan", type: "apartments" },
      { purpose: "SALE" as const, province: "punjab", district: "multan", type: "apartments" },
      { purpose: "RENT" as const, province: "punjab", district: "multan", type: "portions" },
      { purpose: "SALE" as const, province: "punjab", district: "multan", type: "portions" },
    ];
    for (const opts of skipped) {
      assert.equal(searchPageCopy(opts), undefined, JSON.stringify(opts));
    }
  });
});

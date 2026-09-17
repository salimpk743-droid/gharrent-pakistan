import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeSearchFilters, searchHeading } from "./search.ts";
import { typeFromSlug } from "./constants.ts";

describe("search filters", () => {
  it("maps type slugs and clamps pagination", () => {
    const f = normalizeSearchFilters({ typeSlug: "houses", page: 0, pageSize: 999, minRent: 50000 });
    assert.equal(f.type, "House");
    assert.equal(f.page, 1);
    assert.equal(f.pageSize, 24);
    assert.equal(f.minRent, 50000);
    assert.equal(typeFromSlug("apartments"), "Apartment");
    assert.equal(typeFromSlug("plots"), "Plot");
  });

  it("builds a useful heading for rent and sale", () => {
    assert.equal(
      searchHeading({ type: "House" }, "Lahore, Punjab"),
      "Houses for rent in Lahore, Punjab",
    );
    assert.equal(searchHeading({}), "Rental homes in Pakistan");
    assert.equal(
      searchHeading({ typeSlug: "apartments" }, "Lahore, Punjab"),
      "Apartments for rent in Lahore, Punjab",
    );
    assert.equal(
      searchHeading({ type: "House", purpose: "SALE" }, "Lahore, Punjab"),
      "Houses for sale in Lahore, Punjab",
    );
    assert.equal(searchHeading({ purpose: "SALE" }, "Karachi, Sindh"), "Homes for sale in Karachi, Sindh");
  });

  it("keeps an explicit purpose so rent and sale are not mixed", () => {
    const rent = normalizeSearchFilters({ purpose: "RENT", typeSlug: "houses" });
    const sale = normalizeSearchFilters({ purpose: "SALE", typeSlug: "plots" });
    assert.equal(rent.purpose, "RENT");
    assert.equal(sale.purpose, "SALE");
    assert.equal(sale.type, "Plot");
  });
});

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
  });

  it("builds a useful heading", () => {
    assert.equal(
      searchHeading({ type: "House" }, "Lahore, Punjab"),
      "Houses for rent in Lahore, Punjab",
    );
    assert.equal(searchHeading({}), "Rental homes in Pakistan");
    assert.equal(
      searchHeading({ typeSlug: "apartments" }, "Lahore, Punjab"),
      "Apartments for rent in Lahore, Punjab",
    );
  });
});

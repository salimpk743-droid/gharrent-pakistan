import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LEGACY_PATH_REDIRECTS, legacyPathRedirect } from "./legacy-paths.ts";
import { QUESTION_GUIDE_PATHS } from "./question-guides.ts";

describe("legacy guide redirects", () => {
  it("sends the old rental agreement checklist to the rent agreement format guide", () => {
    assert.equal(
      legacyPathRedirect("/guides/landlords/rental-agreement-legal-checklist/"),
      "/guides/rent-agreement-format-pakistan",
    );
    assert.equal(legacyPathRedirect("/guides"), null);
  });
  it("every redirect target is a real guide", () => {
    for (const target of Object.values(LEGACY_PATH_REDIRECTS)) assert.ok(QUESTION_GUIDE_PATHS.includes(target), target);
  });
});

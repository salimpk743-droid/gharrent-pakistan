import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { QUESTION_GUIDES, QUESTION_GUIDE_PATHS } from "./question-guides.ts";
import { GUIDE_KEYWORD_MAP } from "./guide-keywords.ts";

describe("guides", () => {
  it("every guide has a unique title, H1 and description", () => {
    for (const field of ["title", "h1", "description"] as const) {
      const values = QUESTION_GUIDES.map((g) => g[field].toLowerCase());
      assert.equal(new Set(values).size, values.length, `duplicate ${field}`);
    }
  });

  it("every guide is dated, sourced and has FAQs", () => {
    for (const g of QUESTION_GUIDES) {
      assert.match(g.updatedIso, /^\d{4}-\d{2}-\d{2}$/, g.slug);
      assert.ok(g.updatedLabel, g.slug);
      assert.ok(g.sources.length > 0, `${g.slug} has no sources`);
      assert.ok(g.faqs.length > 0, `${g.slug} has no FAQs`);
      assert.ok(g.description.length <= 200, `${g.slug} description too long`);
    }
  });

  it("each page owns exactly one primary keyword, and no keyword is claimed twice", () => {
    const paths = GUIDE_KEYWORD_MAP.map((r) => r.path);
    assert.equal(new Set(paths).size, paths.length, "a page appears twice in the keyword map");
    const all = GUIDE_KEYWORD_MAP.flatMap((r) => [r.primary, ...r.secondary]);
    assert.equal(new Set(all).size, all.length, "a keyword is targeted by two pages");
  });

  it("every question guide is in the keyword map", () => {
    const mapped = new Set(GUIDE_KEYWORD_MAP.map((r) => r.path));
    for (const path of QUESTION_GUIDE_PATHS) assert.ok(mapped.has(path), `${path} missing from GUIDE_KEYWORD_MAP`);
  });

  it("new process guides link to /post", () => {
    for (const slug of ["tenant-registration-punjab-police", "rent-agreement-format-pakistan", "how-to-rent-out-your-house-in-pakistan"]) {
      const g = QUESTION_GUIDES.find((x) => x.slug === slug);
      assert.ok(g, slug);
      assert.ok(JSON.stringify(g).includes('"/post"'), `${slug} has no /post link`);
    }
  });
});

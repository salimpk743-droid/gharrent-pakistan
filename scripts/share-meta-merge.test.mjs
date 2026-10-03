import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { injectGrokPwaHead, mergeShareMetaTags, extractShareMetaTags } from "./grok-pwa-shared.mjs";

const site = { title: "Apna Ghar", description: "Generic site description", card: "custom", image: "/apna-ghar-facebook.jpg" };

describe("per-page share metas survive the platform injector", () => {
  it("keeps the page's og:title, og:description and og:image", () => {
    const html =
      '<html><head><title>Flats for Rent in Lahore | Apna Ghar</title>' +
      '<meta property="og:title" content="Flats for Rent in Lahore | Apna Ghar">' +
      '<meta property="og:description" content="Find flats for rent in Lahore.">' +
      '<meta property="og:image" content="https://apnaaghar.pk/api/images/abc">' +
      '<meta name="twitter:title" content="Flats for Rent in Lahore | Apna Ghar">' +
      "</head><body></body></html>";
    const out = injectGrokPwaHead(html, { host: "apnaaghar.pk", site, path: "/rent/punjab/lahore/apartments" });
    assert.match(out, /property="og:title" content="Flats for Rent in Lahore \| Apna Ghar"/);
    assert.match(out, /property="og:description" content="Find flats for rent in Lahore\."/);
    assert.match(out, /property="og:image" content="https:\/\/apnaaghar\.pk\/api\/images\/abc"/);
    assert.doesNotMatch(out, /content="Generic site description"/);
    assert.equal((out.match(/property="og:title"/g) || []).length, 1);
    assert.equal((out.match(/property="og:image"/g) || []).length, 1);
    assert.equal((out.match(/name="twitter:card"/g) || []).length, 1);
  });

  it("falls back to the platform card when a page sets no share metas", () => {
    const html = "<html><head><title>Sign in — Apna Ghar</title></head><body></body></html>";
    const out = injectGrokPwaHead(html, { host: "apnaaghar.pk", site, path: "/login" });
    assert.match(out, /property="og:title" content="Apna Ghar"/);
    assert.match(out, /property="og:description" content="Generic site description"/);
  });

  it("merge replaces only keys the page provided", () => {
    const page = extractShareMetaTags('<meta property="og:title" content="Page">');
    const merged = mergeShareMetaTags(
      ['<meta property="og:title" content="Site">', '<meta name="twitter:card" content="summary_large_image">'],
      page,
    );
    assert.deepEqual(merged, ['<meta property="og:title" content="Page">', '<meta name="twitter:card" content="summary_large_image">']);
  });
});

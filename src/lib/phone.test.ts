import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizePkPhone, telLink, whatsappLink } from "./phone.ts";

describe("pakistani phone numbers", () => {
  it("accepts local, +92 and dashed forms", () => {
    assert.equal(normalizePkPhone("0300-1234567"), "03001234567");
    assert.equal(normalizePkPhone("+92 300 1234567"), "03001234567");
    assert.equal(normalizePkPhone("923001234567"), "03001234567");
  });

  it("rejects invalid numbers", () => {
    assert.equal(normalizePkPhone("021-1234567"), null);
    assert.equal(normalizePkPhone("hello"), null);
    assert.equal(normalizePkPhone(""), null);
  });

  it("builds tel and WhatsApp links", () => {
    assert.equal(telLink("03001234567"), "tel:+923001234567");
    assert.equal(whatsappLink("03001234567"), "https://wa.me/923001234567");
  });
});

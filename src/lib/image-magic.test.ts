import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sniffImageMime } from "./image-magic.ts";

describe("image magic bytes", () => {
  it("detects jpeg png and webp, and rejects arbitrary bytes", () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]).toString("base64");
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0, 0, 0, 0, 0, 0]).toString("base64");
    const webp = Buffer.concat([
      Buffer.from("RIFF"),
      Buffer.from([0, 0, 0, 0]),
      Buffer.from("WEBP"),
    ]).toString("base64");
    const exe = Buffer.from("MZ................").toString("base64");
    assert.equal(sniffImageMime(jpeg), "image/jpeg");
    assert.equal(sniffImageMime(png), "image/png");
    assert.equal(sniffImageMime(webp), "image/webp");
    assert.equal(sniffImageMime(exe), null);
  });
});

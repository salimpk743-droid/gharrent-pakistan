import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyPosterPrefs,
  createSubmitLock,
  createTaskQueue,
  fieldErrors,
  firstStepWithError,
  fitWithin,
  isClientId,
  isHeicFile,
  looksLikeHeicBytes,
  newClientId,
  normalizeCover,
  parsePosterPrefs,
  PHOTO_MESSAGES,
  pickCover,
  precheckPhoto,
  publishFailureMessage,
  publishListing,
  stepErrors,
  type PublishDeps,
} from "./post-ad.ts";

const MB = 1024 * 1024;

describe("photo checks when picked", () => {
  it("accepts JPEG, PNG and WebP, and big photos up to 40 MB (they are shrunk on the phone)", () => {
    assert.deepEqual(precheckPhoto({ name: "a.jpg", type: "image/jpeg", size: 25 * MB }), { kind: "direct" });
    assert.deepEqual(precheckPhoto({ name: "a.png", type: "image/png", size: 1000 }), { kind: "direct" });
    assert.deepEqual(precheckPhoto({ name: "a.webp", type: "", size: 1000 }), { kind: "direct" });
  });
  it("sends iPhone HEIC/HEIF photos to the converter", () => {
    assert.deepEqual(precheckPhoto({ name: "IMG_1.HEIC", type: "", size: 3 * MB }), { kind: "heic" });
    assert.deepEqual(precheckPhoto({ name: "x", type: "image/heif", size: 3 * MB }), { kind: "heic" });
    assert.equal(isHeicFile({ name: "photo.heic" }), true);
    assert.equal(isHeicFile({ name: "photo.jpg", type: "image/jpeg" }), false);
  });
  it("detects HEIC from the file header when the type is missing", () => {
    const heic = new Uint8Array([0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63]);
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
    assert.equal(looksLikeHeicBytes(heic), true);
    assert.equal(looksLikeHeicBytes(jpeg), false);
  });
  it("rejects files that are not photos, too big, empty or with unsafe names", () => {
    assert.equal(precheckPhoto({ name: "a.pdf", type: "application/pdf", size: 1000 }).kind, "reject");
    assert.equal(precheckPhoto({ name: "a.gif", type: "image/gif", size: 1000 }).kind, "reject");
    assert.equal(precheckPhoto({ name: "a.mp4", type: "video/mp4", size: 1000 }).kind, "reject");
    assert.deepEqual(precheckPhoto({ name: "a.jpg", type: "image/jpeg", size: 41 * MB }), {
      kind: "reject",
      message: PHOTO_MESSAGES.tooBig,
    });
    assert.equal(precheckPhoto({ name: "a.jpg", type: "image/jpeg", size: 0 }).kind, "reject");
    assert.equal(precheckPhoto({ name: "x.svg", type: "image/svg+xml", size: 10 }).kind, "reject");
    assert.equal(precheckPhoto({ name: "../a.jpg", type: "image/jpeg", size: 10 }).kind, "reject");
  });
  it("shrinks to at most 1600px on the long edge and never enlarges", () => {
    assert.deepEqual(fitWithin(8000, 6000), { width: 1600, height: 1200 });
    assert.deepEqual(fitWithin(3000, 4000), { width: 1200, height: 1600 });
    assert.deepEqual(fitWithin(800, 600), { width: 800, height: 600 });
  });
});

describe("publish lock (double tap)", () => {
  it("lets only the first tap through until released", () => {
    const lock = createSubmitLock();
    assert.equal(lock.tryAcquire(), true);
    assert.equal(lock.tryAcquire(), false);
    assert.equal(lock.tryAcquire(), false);
    lock.release();
    assert.equal(lock.tryAcquire(), true);
  });
});

describe("upload queue", () => {
  it("runs at most 3 uploads at once and finishes them all", async () => {
    let active = 0;
    let peak = 0;
    const done: number[] = [];
    const q = createTaskQueue<number>(3, async (n) => {
      active += 1;
      peak = Math.max(peak, active);
      await new Promise((r) => setTimeout(r, 5 + (n % 3)));
      active -= 1;
      done.push(n);
    });
    for (let i = 0; i < 8; i += 1) q.add(i);
    await q.onIdle();
    assert.equal(peak, 3);
    assert.equal(done.length, 8);
  });
  it("keeps going when one upload fails", async () => {
    const done: number[] = [];
    const q = createTaskQueue<number>(3, async (n) => {
      if (n === 1) throw new Error("network");
      done.push(n);
    });
    [0, 1, 2, 3].forEach((n) => q.add(n));
    await q.onIdle();
    assert.deepEqual(done.sort(), [0, 2, 3]);
  });
});

describe("cover photo", () => {
  it("keeps exactly one cover: the chosen one, else the flagged one, else the first", () => {
    const imgs = [{ id: "a" }, { id: "b", isCover: true }, { id: "c" }];
    assert.deepEqual(
      normalizeCover(imgs, "c").map((i) => i.isCover),
      [false, false, true],
    );
    assert.deepEqual(
      normalizeCover(imgs).map((i) => i.isCover),
      [false, true, false],
    );
    assert.deepEqual(
      normalizeCover([{ id: "a" }, { id: "b" }], "missing").map((i) => i.isCover),
      [true, false],
    );
    const twoCovers = normalizeCover([
      { id: "a", isCover: true },
      { id: "b", isCover: true },
    ]);
    assert.equal(twoCovers.filter((i) => i.isCover).length, 1);
    assert.deepEqual(normalizeCover([]), []);
  });
  it("cards fall back to the first photo when no cover is set", () => {
    assert.equal(pickCover([{ id: "b", isCover: false, sortOrder: 1 }, { id: "a", isCover: false, sortOrder: 0 }])?.id, "a");
    assert.equal(pickCover([{ id: "a", isCover: false, sortOrder: 0 }, { id: "b", isCover: true, sortOrder: 1 }])?.id, "b");
    assert.equal(pickCover([]), null);
  });
});

const goodListing = {
  propertyType: "House",
  listingPurpose: "RENT",
  provinceId: "punjab",
  districtId: "punjab-lahore",
  monthlyRent: 65000,
  contactPhone: "03001234567",
};

describe("inline validation", () => {
  it("passes a complete ad with one photo", () => {
    assert.deepEqual(fieldErrors(goodListing, [{ status: "uploaded" }]), {});
  });
  it("only asks for the minimal required fields", () => {
    const errors = fieldErrors({ propertyType: "House", listingPurpose: "RENT" }, []);
    assert.deepEqual(Object.keys(errors).sort(), ["contactPhone", "districtId", "monthlyRent", "photos", "provinceId"]);
    assert.equal(firstStepWithError(errors), 0);
  });
  it("shows step errors only for the step being continued", () => {
    const errs = stepErrors(1, { ...goodListing, monthlyRent: 10 }, []);
    assert.deepEqual(Object.keys(errs), ["monthlyRent"]);
    assert.deepEqual(stepErrors(0, goodListing, []), {});
  });
  it("needs at least one usable photo and explains failed or preparing photos", () => {
    assert.match(fieldErrors(goodListing, [])!.photos!, /photo/);
    assert.match(fieldErrors(goodListing, [{ status: "failed" }])!.photos!, /photo/);
    assert.match(fieldErrors(goodListing, [{ status: "processing" }])!.photos!, /being prepared/);
    assert.equal(fieldErrors(goodListing, [{ status: "processing" }, { status: "local" }]).photos, undefined);
  });
});

describe("autofill of the poster's last city and phone", () => {
  it("parses saved prefs safely", () => {
    assert.deepEqual(parsePosterPrefs("not json"), {});
    assert.deepEqual(parsePosterPrefs(null), {});
    assert.equal(parsePosterPrefs(JSON.stringify({ districtId: "x", contactPhone: 123 })).contactPhone, undefined);
  });
  it("fills only blank fields", () => {
    const prefs = { provinceId: "punjab", districtId: "punjab-lahore", contactPhone: "03001234567" };
    const filled = applyPosterPrefs({ provinceId: null, districtId: null, contactPhone: "" }, prefs);
    assert.equal(filled.districtId, "punjab-lahore");
    assert.equal(filled.contactPhone, "03001234567");
    const typed = applyPosterPrefs({ provinceId: "sindh", districtId: null, contactPhone: "03110000000" }, prefs);
    assert.equal(typed.provinceId, "sindh");
    assert.equal(typed.districtId, null, "a city from another province is never filled in");
    assert.equal(typed.contactPhone, "03110000000");
  });
});

type Call = string;
function fakeDeps(opts: { failPhotoOnce?: string; failActivate?: boolean } = {}) {
  const calls: Call[] = [];
  const saved = new Set<string>();
  let failedOnce = false;
  let live = false;
  const drafts = new Set<string>();
  const deps: PublishDeps = {
    ensureDraft: async (id) => {
      calls.push(`draft:${id}`);
      drafts.add(id); // idempotent: same id, same ad
      return { ok: true };
    },
    saveFields: async (id) => {
      calls.push(`save:${id}`);
      return { ok: true };
    },
    uploadPhoto: async (_id, photoId) => {
      calls.push(`photo:${photoId}`);
      if (opts.failPhotoOnce === photoId && !failedOnce) {
        failedOnce = true;
        return { ok: false, error: "network" };
      }
      saved.add(photoId);
      return { ok: true };
    },
    activate: async (id, imageIds, coverId) => {
      calls.push(`activate:${id}:${imageIds.join(",")}:${coverId}`);
      if (opts.failActivate) return { ok: false, error: "Monthly rent must be at least Rs. 1,000." };
      if (imageIds.some((p) => !saved.has(p))) return { ok: false, error: "photo missing" };
      live = true;
      return { ok: true, status: "PUBLISHED" };
    },
  };
  return { deps, calls, saved, drafts, isLive: () => live };
}

describe("publish: draft first, live only after photos", () => {
  it("creates the draft, saves, uploads the photos, then activates with the cover", async () => {
    const f = fakeDeps();
    f.saved.add("p2");
    const r = await publishListing(f.deps, {
      adId: "ad-1",
      photos: [
        { id: "p1", uploaded: false, isCover: false },
        { id: "p2", uploaded: true, isCover: true },
      ],
    });
    assert.equal(r.ok, true);
    assert.deepEqual(f.calls, ["draft:ad-1", "save:ad-1", "photo:p1", "activate:ad-1:p1,p2:p2"]);
  });
  it("never activates when a photo fails, and a retry reuses the same ad id without a second ad", async () => {
    const f = fakeDeps({ failPhotoOnce: "p2" });
    f.saved.add("p0");
    const photos = [
      { id: "p1", uploaded: false, isCover: true },
      { id: "p2", uploaded: false, isCover: false },
    ];
    const first = await publishListing(f.deps, { adId: "ad-9", photos });
    assert.equal(first.ok, false);
    assert.equal(!first.ok && first.stage, "photos");
    assert.deepEqual(!first.ok && first.failedPhotoIds, ["p2"]);
    assert.equal(f.isLive(), false);
    assert.equal(f.calls.some((c) => c.startsWith("activate")), false);

    const retry = await publishListing(f.deps, {
      adId: "ad-9",
      photos: photos.map((p) => ({ ...p, uploaded: f.saved.has(p.id) })),
    });
    assert.equal(retry.ok, true);
    assert.equal(f.drafts.size, 1, "one ad id per form, reused on retry");
    assert.equal(f.calls.filter((c) => c === "photo:p1").length, 1, "an uploaded photo is not uploaded again");
  });
  it("keeps the server's plain message when activation is refused", async () => {
    const f = fakeDeps({ failActivate: true });
    const r = await publishListing(f.deps, { adId: "a", photos: [{ id: "p", uploaded: false, isCover: true }] });
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.equal(r.stage, "activate");
      assert.match(publishFailureMessage(r), /Monthly rent/);
    }
  });
  it("turns thrown errors into a failed stage instead of crashing", async () => {
    const f = fakeDeps();
    f.deps.saveFields = async () => {
      throw new Error("Failed to fetch");
    };
    const r = await publishListing(f.deps, { adId: "a", photos: [] });
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.equal(r.stage, "save");
      assert.match(publishFailureMessage(r), /still here/);
      assert.match(publishFailureMessage(r, true), /No internet/);
      assert.match(publishFailureMessage({ ...r, stage: "activate" }), /connection dropped/);
    }
  });
});

describe("error to field mapping", () => {
  it("sends each server message to the field that fixes it", async () => {
    const { fieldForMessage } = await import("./post-ad.ts");
    assert.equal(fieldForMessage("Enter a valid Pakistani mobile number so renters can contact you."), "contactPhone");
    assert.equal(fieldForMessage("WhatsApp number must be a valid Pakistani mobile number."), "contactWhatsapp");
    assert.equal(fieldForMessage("Monthly rent must be at least Rs. 1,000."), "monthlyRent");
    assert.equal(fieldForMessage("Sale price must be at least Rs. 50,000."), "monthlyRent");
    assert.equal(fieldForMessage("Choose a city."), "districtId");
    assert.equal(fieldForMessage("Add at least one cover photo."), "photos");
    assert.equal(
      fieldForMessage("This property already has a live ad with the same phone number, area and price."),
      "other",
    );
  });
});

describe("client ids", () => {
  it("makes valid, unique ids", () => {
    const a = newClientId();
    const b = newClientId();
    assert.equal(isClientId(a), true);
    assert.notEqual(a, b);
    assert.equal(isClientId("draft-123"), false);
    assert.equal(isClientId("'; drop table x; --"), false);
  });
});

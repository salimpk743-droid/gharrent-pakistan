import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  adminNextStatus,
  canAdminTransition,
  canOwnerTransition,
  isPubliclyVisible,
  ownerNextStatus,
} from "./listing-lifecycle.ts";

describe("listing lifecycle", () => {
  it("lets an owner publish a draft immediately", () => {
    assert.equal(canOwnerTransition("DRAFT", "submit"), true);
    assert.equal(ownerNextStatus("DRAFT", "submit"), "PUBLISHED");
    assert.equal(ownerNextStatus("REJECTED", "submit"), "PUBLISHED");
    assert.equal(ownerNextStatus("PENDING_REVIEW", "submit"), "PUBLISHED");
  });

  it("lets an owner pause, resume, mark rented, renew and soft-delete", () => {
    assert.equal(ownerNextStatus("PUBLISHED", "pause"), "PAUSED");
    assert.equal(ownerNextStatus("PAUSED", "resume"), "PUBLISHED");
    assert.equal(ownerNextStatus("PAUSED", "resume", { expired: true }), "EXPIRED");
    assert.equal(ownerNextStatus("PUBLISHED", "markRented"), "RENTED");
    assert.equal(ownerNextStatus("EXPIRED", "renew"), "PUBLISHED");
    assert.equal(ownerNextStatus("PUBLISHED", "delete"), "DELETED");
  });

  it("does not allow deleted listings to be mutated by owners", () => {
    assert.equal(canOwnerTransition("DELETED", "pause"), false);
    assert.equal(ownerNextStatus("DELETED", "delete"), null);
    assert.equal(canOwnerTransition("DRAFT", "pause"), false);
  });

  it("lets staff approve leftover pending listings, suspend and archive live ads", () => {
    assert.equal(adminNextStatus("PENDING_REVIEW", "approve"), "PUBLISHED");
    assert.equal(adminNextStatus("PENDING_REVIEW", "reject"), "REJECTED");
    assert.equal(adminNextStatus("PUBLISHED", "suspend"), "PAUSED");
    assert.equal(canAdminTransition("PUBLISHED", "archive"), true);
    assert.equal(canAdminTransition("DRAFT", "approve"), false);
  });

  it("only published listings are publicly visible", () => {
    assert.equal(isPubliclyVisible("PUBLISHED"), true);
    assert.equal(isPubliclyVisible("PENDING_REVIEW"), false);
    assert.equal(isPubliclyVisible("PUBLISHED", "2026-01-01"), false);
  });
});

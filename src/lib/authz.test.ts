import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertCanMutate,
  canEditListing,
  canManageUsers,
  canModerate,
  canMutateListing,
  canPostListing,
} from "./authz.ts";

const owner = { userId: "user-a", role: "USER" as const, status: "ACTIVE" as const };
const other = { userId: "user-b", role: "USER" as const, status: "ACTIVE" as const };
const admin = { userId: "admin-1", role: "ADMIN" as const, status: "ACTIVE" as const };
const suspended = { userId: "user-a", role: "USER" as const, status: "SUSPENDED" as const };

describe("authorization", () => {
  it("allows the owner to mutate their listing and blocks other users", () => {
    assert.equal(canMutateListing(owner, "user-a"), true);
    assert.equal(canMutateListing(other, "user-a"), false);
    assert.equal(canEditListing(other, "user-a", "PUBLISHED"), false);
    assert.throws(() => assertCanMutate(other, "user-a"), /permission/);
  });

  it("allows staff to mutate another user's listing", () => {
    assert.equal(canMutateListing(admin, "user-a"), true);
    assert.equal(canModerate(admin), true);
    assert.equal(canModerate(owner), false);
    assert.equal(canManageUsers(admin), true);
    assert.equal(canManageUsers({ userId: "m", role: "MODERATOR", status: "ACTIVE" }), false);
  });

  it("blocks suspended users from posting or mutating", () => {
    assert.equal(canPostListing(suspended), false);
    assert.equal(canMutateListing(suspended, "user-a"), false);
    assert.equal(canPostListing(null), false);
  });
});

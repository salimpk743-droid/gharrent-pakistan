import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { friendlyAuthError, friendlyCallbackError, loginHrefFor, safeCallback } from "./auth-errors.ts";

describe("safe return path", () => {
  it("keeps same-site paths", () => {
    assert.equal(safeCallback("/post"), "/post");
    assert.equal(safeCallback("/property/abc?x=1"), "/property/abc?x=1");
  });
  it("refuses other sites, protocol-relative and login loops", () => {
    assert.equal(safeCallback("https://evil.com"), "/");
    assert.equal(safeCallback("//evil.com"), "/");
    assert.equal(safeCallback("/\\evil.com"), "/");
    assert.equal(safeCallback("/login?next=/x"), "/");
    assert.equal(safeCallback(undefined), "/");
  });
  it("sends the visitor back to the page they were on", () => {
    assert.deepEqual(loginHrefFor("/rent/lahore", "?beds=2"), { next: "/rent/lahore?beds=2" });
    assert.deepEqual(loginHrefFor("/"), { next: "/" });
  });
});

describe("friendly sign-in errors", () => {
  it("explains network problems", () => {
    assert.match(friendlyAuthError("Failed to fetch"), /internet/);
    assert.match(friendlyAuthError("Load failed"), /internet/);
  });
  it("maps Better Auth codes", () => {
    assert.match(friendlyAuthError("", "USER_ALREADY_EXISTS"), /already exists/);
    assert.match(friendlyAuthError("Invalid email or password"), /not correct/);
    assert.match(friendlyAuthError("", "TOO_MANY_REQUESTS"), /wait a minute/);
    assert.match(friendlyAuthError("Provider not found"), /Google sign-in is not available/);
  });
  it("never shows raw technical text", () => {
    assert.equal(friendlyAuthError('{"code":500}'), "Something went wrong. Please try again.");
    assert.equal(friendlyAuthError(""), "Something went wrong. Please try again.");
  });
  it("explains Google callback errors", () => {
    assert.match(friendlyCallbackError("access_denied")!, /cancelled/);
    assert.match(friendlyCallbackError("state_mismatch")!, /took too long/);
    assert.match(friendlyCallbackError("please_restart_the_process")!, /took too long/);
    assert.match(friendlyCallbackError("unable_to_get_user_info")!, /could not confirm/);
    assert.equal(friendlyCallbackError(null), null);
  });
});

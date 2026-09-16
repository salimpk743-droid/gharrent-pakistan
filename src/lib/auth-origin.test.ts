import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  GOOGLE_CALLBACK_PATH,
  KNOWN_PRODUCTION_ORIGIN,
  googleCallbackURL,
  isLoopbackOrigin,
  resolveAuthBaseURL,
  resolveTrustedOrigins,
  shouldUsePreviewBrokerFallback,
} from "./auth-origin.ts";

describe("auth origin", () => {
  it("uses BETTER_AUTH_URL when it is a real public origin", () => {
    assert.equal(
      resolveAuthBaseURL({ BETTER_AUTH_URL: "https://gharrent-pakistan.vercel.app/" }),
      KNOWN_PRODUCTION_ORIGIN,
    );
  });

  it("does not use localhost BETTER_AUTH_URL on Vercel", () => {
    assert.equal(
      resolveAuthBaseURL({
        VERCEL: "1",
        VERCEL_ENV: "production",
        BETTER_AUTH_URL: "http://localhost:8080",
      }),
      KNOWN_PRODUCTION_ORIGIN,
    );
  });

  it("prefers VERCEL_PROJECT_PRODUCTION_URL in production", () => {
    assert.equal(
      resolveAuthBaseURL({
        VERCEL: "1",
        VERCEL_ENV: "production",
        VERCEL_PROJECT_PRODUCTION_URL: "gharrent-pakistan.vercel.app",
        VERCEL_URL: "gharrent-pakistan-git-main-user.vercel.app",
      }),
      KNOWN_PRODUCTION_ORIGIN,
    );
  });

  it("falls back to the known production origin on Vercel production", () => {
    assert.equal(resolveAuthBaseURL({ VERCEL: "1", VERCEL_ENV: "production" }), KNOWN_PRODUCTION_ORIGIN);
  });

  it("does not invent a localhost origin for local preview (dynamic baseURL)", () => {
    assert.equal(resolveAuthBaseURL({}), undefined);
  });

  it("never treats the Google callback as a grok preview or loopback URL", () => {
    const callback = googleCallbackURL(KNOWN_PRODUCTION_ORIGIN);
    assert.equal(callback, `${KNOWN_PRODUCTION_ORIGIN}${GOOGLE_CALLBACK_PATH}`);
    assert.equal(isLoopbackOrigin(callback), false);
    assert.equal(callback.includes("grok-sandbox"), false);
    assert.equal(callback.includes("localhost"), false);
  });

  it("disables grok_preview fallback on Vercel", () => {
    assert.equal(shouldUsePreviewBrokerFallback({ VERCEL: "1" }), false);
    assert.equal(shouldUsePreviewBrokerFallback({ GROK_AUTH_CLIENT_ID: "real" }), false);
    assert.equal(shouldUsePreviewBrokerFallback({}), true);
  });

  it("trusts the production origin and Vercel hosts", () => {
    const origins = resolveTrustedOrigins({
      VERCEL: "1",
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "gharrent-pakistan.vercel.app",
    });
    assert.ok(origins.includes(KNOWN_PRODUCTION_ORIGIN));
    assert.ok(origins.includes("https://*.vercel.app"));
  });
});

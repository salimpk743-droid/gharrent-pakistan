import { createFileRoute } from "@tanstack/react-router";

/**
 * POST /api/listing-images?propertyId=…&id=…&sortOrder=…&isCover=…&width=…&height=…
 * Body: the shrunk photo bytes (image/jpeg, png or webp).
 *
 * A plain upload endpoint (instead of a server function) so the browser can show real upload progress.
 * Same rules as `addListingImage`: signed-in owner only, same-site only, idempotent by photo id.
 */
const MAX_BODY_BYTES = 1_600_000;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/listing-images")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { assertSameSiteRequest, CrossSiteRequestError } = await import("@/lib/auth/isolation.server");
        const { requireUserId, UnauthorizedError } = await import("@/lib/auth/verify.server");
        const { insertListingImage } = await import("@/lib/server/listing-images.server");
        try {
          assertSameSiteRequest();
          const auth = request.headers.get("authorization") || "";
          const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : undefined;
          const userId = await requireUserId(bearer);
          const url = new URL(request.url);
          const propertyId = url.searchParams.get("propertyId") || "";
          if (!propertyId) return json({ ok: false, error: "Missing listing id." }, 400);
          const declared = Number(request.headers.get("content-length") || 0);
          if (declared > MAX_BODY_BYTES) {
            return json({ ok: false, error: "Each photo must be under 1.5 MB after compression." }, 413);
          }
          const buf = Buffer.from(await request.arrayBuffer());
          if (!buf.length) return json({ ok: false, error: "The photo was empty. Please try again." }, 400);
          if (buf.length > MAX_BODY_BYTES) {
            return json({ ok: false, error: "Each photo must be under 1.5 MB after compression." }, 413);
          }
          const num = (k: string) => (url.searchParams.has(k) ? Number(url.searchParams.get(k)) : null);
          const coverParam = url.searchParams.get("isCover");
          const result = await insertListingImage(userId, {
            propertyId,
            id: url.searchParams.get("id") || undefined,
            dataBase64: buf.toString("base64"),
            width: num("width"),
            height: num("height"),
            sortOrder: num("sortOrder"),
            isCover: coverParam === null ? null : coverParam === "1" || coverParam === "true",
          });
          if (!result.ok) return json({ ok: false, error: result.error }, result.status);
          return json({ ok: true, image: result.image, duplicate: result.duplicate });
        } catch (err) {
          if (err instanceof UnauthorizedError) {
            return json({ ok: false, error: "Please sign in again, then tap Retry.", code: "unauthorized" }, 401);
          }
          if (err instanceof CrossSiteRequestError) return json({ ok: false, error: "Forbidden" }, 403);
          const status = (err as { status?: number }).status;
          if (status === 403) return json({ ok: false, error: (err as Error).message }, 403);
          console.error("[listing-images] upload failed", err);
          return json({ ok: false, error: "Upload failed. Check your internet and tap Retry." }, 500);
        }
      },
    },
  },
});

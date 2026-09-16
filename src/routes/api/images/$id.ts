import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";

export const Route = createFileRoute("/api/images/$id")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const id = new URL(request.url).pathname.split("/").pop() || "";
        const sql = await getSql();
        const rows = await sql<{ mime_type: string; byte_data: string | null; url: string | null }>`
          select mime_type, byte_data, url from property_images where id = ${id} limit 1
        `;
        const row = rows[0];
        if (!row) return new Response("Not found", { status: 404 });
        if (row.byte_data) {
          const buf = Buffer.from(row.byte_data, "base64");
          return new Response(buf, {
            headers: {
              "Content-Type": row.mime_type || "image/jpeg",
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        }
        if (row.url) {
          return Response.redirect(row.url, 302);
        }
        return new Response("Not found", { status: 404 });
      },
    },
  },
});

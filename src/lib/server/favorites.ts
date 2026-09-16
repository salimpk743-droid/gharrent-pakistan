import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { requireActiveProfile } from "./profile";
import { mapImage, mapPublic, PROPERTY_FROM, PROPERTY_SELECT, type PropertyRow } from "./mappers";

export const toggleFavorite = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { propertyId: string }) => data)
  .handler(async ({ context, data }) => {
    await requireActiveProfile(context.userId);
    const sql = await getSql();
    const published = await sql`select id from properties where id = ${data.propertyId} and status = 'PUBLISHED' and deleted_at is null limit 1`;
    if (!published[0]) return { ok: false as const, error: "That property is not available to save." };
    const existing = await sql`select 1 from favorites where user_id = ${context.userId} and property_id = ${data.propertyId} limit 1`;
    if (existing[0]) {
      await sql`delete from favorites where user_id = ${context.userId} and property_id = ${data.propertyId}`;
      await sql`insert into listing_events (id, property_id, user_id, event_type)
        values (${crypto.randomUUID()}, ${data.propertyId}, ${context.userId}, ${"unsave"})`;
      return { ok: true as const, saved: false };
    }
    await sql`insert into favorites (user_id, property_id) values (${context.userId}, ${data.propertyId})`;
    await sql`insert into listing_events (id, property_id, user_id, event_type)
      values (${crypto.randomUUID()}, ${data.propertyId}, ${context.userId}, ${"save"})`;
    return { ok: true as const, saved: true };
  });

export const listFavorites = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireActiveProfile(context.userId);
    const sql = await getSql();
    const rows = await sql.query<PropertyRow>(
      `select ${PROPERTY_SELECT} from ${PROPERTY_FROM}
       inner join favorites f on f.property_id = p.id
       where f.user_id = $1 and p.deleted_at is null and p.status = 'PUBLISHED'
       order by f.created_at desc`,
      [context.userId],
    );
    const ids = rows.map((r) => r.id);
    const images = ids.length
      ? await sql.query<{
          id: string;
          property_id: string;
          url: string | null;
          sort_order: number;
          is_cover: boolean;
          width: number | null;
          height: number | null;
        }>(
          `select id, property_id, url, sort_order, is_cover, width, height from property_images
           where property_id in (${ids.map((_, i) => `$${i + 1}`).join(",")})
           order by sort_order asc`,
          ids,
        )
      : [];
    const byProp = new Map<string, ReturnType<typeof mapImage>[]>();
    for (const img of images) {
      const list = byProp.get(img.property_id) ?? [];
      list.push(mapImage(img));
      byProp.set(img.property_id, list);
    }
    return rows.map((row) => mapPublic(row, byProp.get(row.id) ?? [], { saved: true }));
  });

import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { REPORT_REASONS } from "@/lib/constants";
import { requireActiveProfile } from "./profile";

const REASON_IDS = new Set(REPORT_REASONS.map((r) => r.id));

export const reportProperty = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { propertyId: string; reason: string; details?: string }) => data)
  .handler(async ({ context, data }) => {
    await requireActiveProfile(context.userId);
    if (!REASON_IDS.has(data.reason as never)) {
      return { ok: false as const, error: "Choose a valid reason." };
    }
    const sql = await getSql();
    const prop = await sql`select id, status from properties where id = ${data.propertyId} and deleted_at is null limit 1`;
    if (!prop[0] || prop[0].status !== "PUBLISHED") {
      return { ok: false as const, error: "That listing cannot be reported." };
    }
    const recent = await sql<{ n: number }>`
      select count(*)::int as n from reports
      where reporter_id = ${context.userId}
        and created_at > now() - interval '1 day'
    `;
    if ((recent[0]?.n ?? 0) >= 8) {
      return { ok: false as const, error: "You have sent too many reports today. Please try again tomorrow." };
    }
    const duplicate = await sql`
      select id from reports
      where property_id = ${data.propertyId} and reporter_id = ${context.userId} and status = 'OPEN'
      limit 1
    `;
    if (duplicate[0]) {
      return { ok: false as const, error: "You have already reported this listing. Thank you." };
    }
    const id = crypto.randomUUID();
    await sql`insert into reports (id, property_id, reporter_id, reason, details)
      values (${id}, ${data.propertyId}, ${context.userId}, ${data.reason}, ${(data.details || "").trim().slice(0, 1000) || null})`;
    await sql`insert into listing_events (id, property_id, user_id, event_type)
      values (${crypto.randomUUID()}, ${data.propertyId}, ${context.userId}, ${"report"})`;
    return { ok: true as const };
  });

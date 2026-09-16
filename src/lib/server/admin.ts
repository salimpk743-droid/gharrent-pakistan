import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { canManageUsers, canModerate } from "@/lib/authz";
import { adminNextStatus, daysFromNow, type AdminAction } from "@/lib/listing-lifecycle";
import { LISTING_DURATION_DAYS } from "@/lib/constants";
import { requireActiveProfile } from "./profile";
import { mapPublic, PROPERTY_FROM, PROPERTY_SELECT, type PropertyRow } from "./mappers";
import type { ListingStatus } from "@/lib/constants";

async function requireStaff(userId: string) {
  const profile = await requireActiveProfile(userId);
  if (!canModerate({ userId: profile.userId, role: profile.role, status: profile.status })) {
    const err = new Error("You do not have access to the admin area.");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
  return profile;
}

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireStaff(context.userId);
    const sql = await getSql();
    const count = async (clause: string) => {
      const rows = await sql.query<{ n: number }>(`select count(*)::int as n from ${clause}`);
      return rows[0]?.n ?? 0;
    };
    return {
      users: await count("profiles"),
      activeListings: await count("properties where status = 'PUBLISHED' and deleted_at is null"),
      pendingListings: await count("properties where status = 'PENDING_REVIEW' and deleted_at is null"),
      reportedListings: await count("reports where status = 'OPEN'"),
      rentedListings: await count("properties where status = 'RENTED' and deleted_at is null"),
      expiredListings: await count("properties where status = 'EXPIRED' and deleted_at is null"),
      pausedListings: await count("properties where status = 'PAUSED' and deleted_at is null"),
    };
  });

export const adminListProperties = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { status?: string; q?: string }) => data)
  .handler(async ({ context, data }) => {
    await requireStaff(context.userId);
    const sql = await getSql();
    const conditions = ["p.deleted_at is null"];
    const params: unknown[] = [];
    if (data.status && data.status !== "ALL") {
      params.push(data.status);
      conditions.push(`p.status = $${params.length}`);
    }
    if (data.q?.trim()) {
      params.push(`%${data.q.trim()}%`);
      conditions.push(`(p.title ilike $${params.length} or p.area ilike $${params.length} or p.id = $${params.length})`);
    }
    const rows = await sql.query<PropertyRow>(
      `select ${PROPERTY_SELECT} from ${PROPERTY_FROM}
       where ${conditions.join(" and ")}
       order by case p.status when 'PENDING_REVIEW' then 0 else 1 end, p.updated_at desc
       limit 100`,
      params,
    );
    return rows.map((row) => mapPublic(row, []));
  });

export const adminPropertyAction = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string; action: AdminAction; reason?: string }) => data)
  .handler(async ({ context, data }) => {
    const profile = await requireStaff(context.userId);
    const sql = await getSql();
    const rows = await sql`select * from properties where id = ${data.id} limit 1`;
    const row = rows[0];
    if (!row) return { ok: false as const, error: "Listing not found." };
    const next = adminNextStatus(String(row.status) as ListingStatus, data.action);
    if (next == null && data.action !== "feature" && data.action !== "unfeature") {
      return { ok: false as const, error: "That moderation action is not available." };
    }
    if (data.action === "feature") {
      await sql`update properties set is_featured = true, updated_at = now() where id = ${data.id}`;
    } else if (data.action === "unfeature") {
      await sql`update properties set is_featured = false, updated_at = now() where id = ${data.id}`;
    } else if (data.action === "approve") {
      const expires = daysFromNow(LISTING_DURATION_DAYS).toISOString();
      await sql`update properties set
        status = 'PUBLISHED',
        published_at = coalesce(published_at, now()),
        expires_at = coalesce(expires_at, ${expires}),
        rejection_reason = null,
        updated_at = now()
        where id = ${data.id}`;
    } else if (data.action === "reject") {
      const reason = (data.reason || "This listing does not meet GharRent’s publishing standards.").trim().slice(0, 500);
      await sql`update properties set status = 'REJECTED', rejection_reason = ${reason}, updated_at = now() where id = ${data.id}`;
    } else if (data.action === "suspend") {
      await sql`update properties set status = 'PAUSED', updated_at = now() where id = ${data.id}`;
    } else if (data.action === "archive") {
      await sql`update properties set status = 'DELETED', deleted_at = now(), updated_at = now() where id = ${data.id}`;
    }
    await sql`insert into audit_log (id, actor_id, action, entity_type, entity_id, meta)
      values (${crypto.randomUUID()}, ${context.userId}, ${data.action}, ${"property"}, ${data.id}, ${data.reason || next || ""})`;
    return { ok: true as const, actor: profile.userId };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireStaff(context.userId);
    const sql = await getSql();
    return sql<{
      user_id: string;
      display_name: string | null;
      email: string | null;
      role: string;
      status: string;
      created_at: string;
      listings: number;
    }>`
      select pf.user_id, pf.display_name, pf.email, pf.role, pf.status, pf.created_at,
        (select count(*)::int from properties p where p.owner_id = pf.user_id and p.deleted_at is null) as listings
      from profiles pf
      order by pf.created_at desc
      limit 200
    `;
  });

export const adminSetUserStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { userId: string; status: "ACTIVE" | "SUSPENDED" }) => data)
  .handler(async ({ context, data }) => {
    const profile = await requireStaff(context.userId);
    if (!canManageUsers({ userId: profile.userId, role: profile.role, status: profile.status })) {
      return { ok: false as const, error: "Only administrators can suspend or restore users." };
    }
    if (data.userId === context.userId) {
      return { ok: false as const, error: "You cannot suspend your own account." };
    }
    const sql = await getSql();
    await sql`update profiles set status = ${data.status}, updated_at = now() where user_id = ${data.userId}`;
    if (data.status === "SUSPENDED") {
      await sql`update properties set status = 'PAUSED', updated_at = now()
        where owner_id = ${data.userId} and status = 'PUBLISHED' and deleted_at is null`;
    }
    await sql`insert into audit_log (id, actor_id, action, entity_type, entity_id)
      values (${crypto.randomUUID()}, ${context.userId}, ${data.status === "SUSPENDED" ? "suspend_user" : "restore_user"}, ${"user"}, ${data.userId})`;
    return { ok: true as const };
  });

export const adminListReports = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireStaff(context.userId);
    const sql = await getSql();
    return sql<{
      id: string;
      property_id: string;
      property_title: string;
      property_slug: string | null;
      reporter_id: string;
      reason: string;
      details: string | null;
      status: string;
      created_at: string;
    }>`
      select r.id, r.property_id, p.title as property_title, p.slug as property_slug,
        r.reporter_id, r.reason, r.details, r.status, r.created_at
      from reports r
      left join properties p on p.id = r.property_id
      order by case r.status when 'OPEN' then 0 else 1 end, r.created_at desc
      limit 200
    `;
  });

export const adminResolveReport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { reportId: string; status: "RESOLVED" | "DISMISSED" }) => data)
  .handler(async ({ context, data }) => {
    await requireStaff(context.userId);
    const sql = await getSql();
    await sql`update reports set status = ${data.status}, resolved_at = now(), resolved_by = ${context.userId} where id = ${data.reportId}`;
    return { ok: true as const };
  });

export const sendContactMessage = createServerFn({ method: "POST" })
  .validator((data: { name?: string; email?: string; subject: string; message: string; userId?: string }) => data)
  .handler(async ({ data }) => {
    const message = data.message.trim();
    if (message.length < 10) return { ok: false as const, error: "Please write a little more so we can help." };
    const sql = await getSql();
    await sql`insert into contact_messages (id, user_id, name, email, subject, message)
      values (${crypto.randomUUID()}, ${data.userId ?? null}, ${(data.name || "").trim().slice(0, 80) || null},
        ${(data.email || "").trim().slice(0, 120) || null}, ${data.subject.trim().slice(0, 120)}, ${message.slice(0, 4000)})`;
    return { ok: true as const };
  });

import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { Profile } from "@/lib/types";
import type { UserRole } from "@/lib/constants";
import { ensureSeedData } from "./seed";

type Sql = Awaited<ReturnType<typeof getSql>>;

function mapProfile(row: Record<string, unknown>): Profile {
  return {
    userId: String(row.user_id),
    displayName: (row.display_name as string) ?? null,
    email: (row.email as string) ?? null,
    imageUrl: (row.image_url as string) ?? null,
    phone: (row.phone as string) ?? null,
    role: (row.role as UserRole) || "USER",
    status: (row.status as Profile["status"]) || "ACTIVE",
    googleVerified: Boolean(row.google_verified),
    phoneVerified: Boolean(row.phone_verified),
    identityVerified: Boolean(row.identity_verified),
    trustedAdvertiser: Boolean(row.trusted_advertiser),
    createdAt: String(row.created_at),
    lastLoginAt: row.last_login_at ? String(row.last_login_at) : null,
  };
}

export async function loadAuthUser(sql: Sql, userId: string) {
  const rows = await sql<{ id: string; name: string; email: string; image: string | null }>`
    select "id", "name", "email", "image" from "user" where "id" = ${userId} limit 1
  `;
  return rows[0] ?? { id: userId, name: "Apna Ghar user", email: "", image: null };
}

export async function ensureProfile(userId: string): Promise<Profile> {
  await ensureSeedData();
  const sql = await getSql();
  const authUser = await loadAuthUser(sql, userId);
  const existing = await sql`select * from profiles where user_id = ${userId} limit 1`;
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const [{ admins }] = await sql<{ admins: number }>`
    select count(*)::int as admins from profiles where role = 'ADMIN'
  `;
  let role: UserRole = "USER";
  if (existing[0]) role = (existing[0].role as UserRole) || "USER";
  else if (adminEmail && authUser.email.toLowerCase() === adminEmail) role = "ADMIN";
  else if (admins === 0) role = "ADMIN";

  if (!existing[0]) {
    await sql`insert into profiles (
      user_id, display_name, email, image_url, role, google_verified, last_login_at
    ) values (
      ${userId}, ${authUser.name || "Apna Ghar user"}, ${authUser.email || null},
      ${authUser.image}, ${role}, ${Boolean(authUser.email)}, ${new Date().toISOString()}
    )`;
  } else {
    const nextRole =
      adminEmail && authUser.email.toLowerCase() === adminEmail ? "ADMIN" : (existing[0].role as string);
    await sql`update profiles set
      display_name = coalesce(display_name, ${authUser.name || "Apna Ghar user"}),
      email = coalesce(${authUser.email || null}, email),
      image_url = coalesce(${authUser.image}, image_url),
      role = ${nextRole},
      google_verified = ${Boolean(authUser.email) || Boolean(existing[0].google_verified)},
      last_login_at = ${new Date().toISOString()},
      updated_at = ${new Date().toISOString()}
      where user_id = ${userId}`;
  }
  const rows = await sql`select * from profiles where user_id = ${userId} limit 1`;
  return mapProfile(rows[0]);
}

export async function requireActiveProfile(userId: string): Promise<Profile> {
  const profile = await ensureProfile(userId);
  if (profile.status === "SUSPENDED") {
    const err = new Error("This account has been suspended. Contact Apna Ghar if you believe this is a mistake.");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
  return profile;
}

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => requireActiveProfile(context.userId));

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { displayName?: string; phone?: string }) => data)
  .handler(async ({ context, data }) => {
    const profile = await requireActiveProfile(context.userId);
    const sql = await getSql();
    const name = (data.displayName || profile.displayName || "").trim().slice(0, 80);
    const phone = (data.phone || "").trim().slice(0, 20) || null;
    await sql`update profiles set
      display_name = ${name || profile.displayName},
      phone = ${phone},
      updated_at = ${new Date().toISOString()}
      where user_id = ${context.userId}`;
    return requireActiveProfile(context.userId);
  });

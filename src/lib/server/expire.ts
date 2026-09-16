import { getSql } from "@/lib/db";

export async function expireOverdueListings() {
  const sql = await getSql();
  await sql`update properties
    set status = 'EXPIRED', updated_at = now()
    where status = 'PUBLISHED'
      and deleted_at is null
      and expires_at is not null
      and expires_at < now()`;
}

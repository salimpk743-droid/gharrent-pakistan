import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getAdminOverview } from "@/lib/server/admin";
import { getMyProfile } from "@/lib/server/profile";
import { canModerate } from "@/lib/authz";
import type { Profile } from "@/lib/types";

import { privateSeo } from "@/lib/seo";

export const Route = createFileRoute("/admin/")({
  head: () => privateSeo({ title: "Admin — Apna Ghar" }),
  component: AdminHome,
});

function AdminHome() {
  const { user, isPending } = useCurrentUserState();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getAdminOverview>> | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!user) return;
    void getMyProfile()
      .then((p) => {
        setProfile(p);
        if (!canModerate({ userId: p.userId, role: p.role, status: p.status })) {
          setDenied(true);
          return;
        }
        return getAdminOverview().then(setStats);
      })
      .catch(() => setDenied(true));
  }, [user]);

  if (isPending) return <div className="grid min-h-[40vh] place-items-center text-sm text-muted">Loading…</div>;
  if (!user) return <Navigate to="/login" search={{ next: "/admin" }} />;
  if (denied) {
    return (
      <main className="mx-auto max-w-lg py-20 text-center">
        <h1 className="font-display text-2xl">Admin access required</h1>
        <p className="mt-2 text-sm text-muted">This area is only available to Apna Ghar moderators.</p>
      </main>
    );
  }

  const cards = stats
    ? [
        ["Users", stats.users, "/admin/users"],
        ["Active listings", stats.activeListings, "/admin/listings"],
        ["Pending review", stats.pendingListings, "/admin/listings"],
        ["Open reports", stats.reportedListings, "/admin/reports"],
        ["Rented", stats.rentedListings, "/admin/listings"],
        ["Expired", stats.expiredListings, "/admin/listings"],
      ]
    : [];

  return (
    <main className="mx-auto w-[min(1120px,calc(100%-32px))] py-10">
      <p className="text-[10px] font-extrabold tracking-[0.16em] text-forest">ADMIN</p>
      <h1 className="font-display mt-2 text-3xl">Platform overview</h1>
      <p className="mt-1 text-sm text-muted">Signed in as {profile?.displayName} ({profile?.role})</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {cards.map(([label, value, href]) => (
          <a key={String(label)} href={String(href)} className="rounded-xl border border-line p-4 no-underline hover:border-forest">
            <p className="text-xs text-muted">{label}</p>
            <p className="font-display mt-1 text-3xl">{value as number}</p>
          </a>
        ))}
      </div>
    </main>
  );
}

import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { adminListProperties, adminPropertyAction } from "@/lib/server/admin";
import { getMyProfile } from "@/lib/server/profile";
import { canModerate } from "@/lib/authz";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { formatListingPrice, formatLocation } from "@/lib/utils";
import { toast } from "sonner";
import type { PublicProperty } from "@/lib/types";
import type { AdminAction } from "@/lib/listing-lifecycle";
import { LISTING_STATUSES, PURPOSE_KICKER } from "@/lib/constants";

export const Route = createFileRoute("/admin/listings")({
  head: () => ({ meta: [{ title: "Moderate listings — Apna Ghar" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminListings,
});

function AdminListings() {
  const { user, isPending } = useCurrentUserState();
  const [denied, setDenied] = useState(false);
  const [status, setStatus] = useState("PUBLISHED");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<PublicProperty[]>([]);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  async function reload(nextStatus = status, nextQ = q) {
    const rows = await adminListProperties({ data: { status: nextStatus, q: nextQ } });
    setItems(rows);
  }

  useEffect(() => {
    if (!user) return;
    void getMyProfile()
      .then((p) => {
        if (!canModerate({ userId: p.userId, role: p.role, status: p.status })) setDenied(true);
        else return reload();
      })
      .catch(() => setDenied(true));
  }, [user]);

  if (isPending) return <div className="grid min-h-[40vh] place-items-center text-sm text-muted">Loading…</div>;
  if (!user) return <Navigate to="/login" search={{ next: "/admin/listings" }} />;
  if (denied) return <p className="py-20 text-center">Admin access required.</p>;

  async function act(id: string, action: AdminAction, extra?: string) {
    const result = await adminPropertyAction({ data: { id, action, reason: extra } });
    if (!result.ok) toast.error(result.error);
    else {
      toast("Updated");
      setRejectId(null);
      await reload();
    }
  }

  return (
    <main className="mx-auto w-[min(1120px,calc(100%-32px))] py-10">
      <h1 className="font-display text-3xl">Listings</h1>
      <div className="mt-4 flex flex-wrap gap-3">
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            void reload(e.target.value, q);
          }}
          className="max-w-xs"
        >
          <option value="ALL">All statuses</option>
          {LISTING_STATUSES.filter((s) => s !== "DELETED").map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
        <Input
          value={q}
          placeholder="Search title or area"
          className="max-w-xs"
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void reload(status, q);
          }}
        />
      </div>
      <div className="mt-6 grid gap-3">
        {items.map((p) => (
          <article key={p.id} className="rounded-xl border border-line p-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={p.status} purpose={p.listingPurpose} />
              <span className="text-[10px] font-extrabold tracking-[0.12em] text-forest">
                {PURPOSE_KICKER[p.listingPurpose]}
              </span>
              <b>{p.title}</b>
              <span className="text-sm text-muted">{formatListingPrice(p.monthlyRent, p.listingPurpose).amount}</span>
            </div>
            <p className="text-xs text-muted">
              {formatLocation(p)} · {p.propertyType}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.status === "PUBLISHED" && (
                <Button asChild size="sm" variant="outline">
                  <Link to="/property/$slug" params={{ slug: p.slug }}>
                    View
                  </Link>
                </Button>
              )}
              {p.status === "PENDING_REVIEW" && (
                <>
                  <Button size="sm" onClick={() => void act(p.id, "approve")}>
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setRejectId(p.id)}>
                    Reject
                  </Button>
                </>
              )}
              {(p.status === "PUBLISHED" || p.status === "PAUSED") && (
                <Button size="sm" variant="outline" onClick={() => void act(p.id, "suspend")}>
                  Suspend
                </Button>
              )}
              {p.status === "PUBLISHED" && (
                <Button size="sm" variant="outline" onClick={() => void act(p.id, p.isFeatured ? "unfeature" : "feature")}>
                  {p.isFeatured ? "Unfeature" : "Feature"}
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => void act(p.id, "archive")}>
                Archive
              </Button>
            </div>
            {rejectId === p.id && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Input
                  value={reason}
                  placeholder="Reason shown to the owner"
                  onChange={(e) => setReason(e.target.value)}
                />
                <Button size="sm" variant="destructive" onClick={() => void act(p.id, "reject", reason)}>
                  Confirm reject
                </Button>
              </div>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}

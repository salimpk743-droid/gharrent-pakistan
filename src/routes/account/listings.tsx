import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SignInPanel } from "@/components/auth/sign-in-panel";
import { useAuthGate } from "@/components/auth/use-auth-gate";
import { listMyListings, ownerAction, submitListing } from "@/lib/server/listings";
import type { OwnerListing } from "@/lib/types";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PURPOSE_KICKER } from "@/lib/constants";
import { formatDate, formatListingPrice, formatLocation } from "@/lib/utils";
import { toast } from "sonner";
import type { OwnerAction } from "@/lib/listing-lifecycle";

import { privateSeo } from "@/lib/seo";

export const Route = createFileRoute("/account/listings")({
  head: () => privateSeo({ title: "My listings — Apna Ghar" }),
  component: MyListings,
});

function MyListings() {
  const { user, isPending, showSignIn } = useAuthGate();
  const [items, setItems] = useState<OwnerListing[] | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  async function reload() {
    const rows = await listMyListings();
    setItems(rows);
  }

  useEffect(() => {
    if (user) void reload();
  }, [user]);

  if (showSignIn || (!user && !isPending)) {
    return (
      <main className="grid min-h-[70vh] place-items-center px-4 py-16">
        <SignInPanel callbackURL="/account/listings" />
      </main>
    );
  }
  if (isPending || !user) {
    return <div className="grid min-h-[40vh] place-items-center text-sm text-muted">Loading…</div>;
  }

  async function act(id: string, action: OwnerAction) {
    const result = await ownerAction({ data: { id, action } });
    if (!result.ok) toast.error(result.error);
    else {
      toast("Listing updated");
      await reload();
    }
  }

  async function publish(id: string) {
    const result = await submitListing({ data: { id } });
    if (!result.ok) toast.error(result.error);
    else {
      toast.success("Your property is now live.");
      await reload();
    }
  }

  return (
    <main className="mx-auto w-[min(1120px,calc(100%-32px))] py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold tracking-[0.16em] text-forest">DASHBOARD</p>
          <h1 className="font-display mt-2 text-3xl">My listings</h1>
        </div>
        <Button asChild>
          <Link to="/post">Post a property</Link>
        </Button>
      </div>
      {!items ? (
        <p className="mt-8 text-sm text-muted">Loading your listings…</p>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line p-10 text-center text-muted">
          You have not posted a property yet.
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {items.map((p) => (
            <article key={p.id} className="grid gap-4 rounded-xl border border-line bg-white p-4 md:grid-cols-[160px_1fr]">
              <div
                className="h-32 rounded-lg bg-sand bg-cover bg-center"
                style={{ backgroundImage: p.coverImage ? `url(${p.coverImage.url})` : undefined }}
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={p.status} purpose={p.listingPurpose} />
                  <span className="text-[10px] font-extrabold tracking-[0.12em] text-forest">
                    {PURPOSE_KICKER[p.listingPurpose]}
                  </span>
                  <span className="text-xs text-muted">Created {formatDate(p.createdAt)}</span>
                  {p.expiresAt && <span className="text-xs text-muted">Expires {formatDate(p.expiresAt)}</span>}
                </div>
                <h2 className="font-display mt-1 text-xl">{p.title}</h2>
                <p className="text-sm text-muted">
                  {formatLocation(p, { includeProvince: false })} · {formatListingPrice(p.monthlyRent, p.listingPurpose).amount}
                  {p.listingPurpose === "RENT" ? " / month" : ""}
                </p>
                {p.status === "REJECTED" && p.rejectionReason && (
                  <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-danger">
                    Your listing was rejected because {p.rejectionReason}
                  </p>
                )}
                {(p.status === "DRAFT" || p.status === "PENDING_REVIEW") && (
                  <p className="mt-2 text-sm text-muted">This listing is not live yet. Publish it to appear in search.</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.status === "PUBLISHED" && (
                    <Button asChild variant="outline" size="sm">
                      <Link to="/property/$slug" params={{ slug: p.slug }}>
                        View
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" size="sm">
                    <Link to="/post/$id" params={{ id: p.id }}>
                      Edit
                    </Link>
                  </Button>
                  {(p.status === "DRAFT" || p.status === "PENDING_REVIEW" || p.status === "REJECTED") && (
                    <Button size="sm" onClick={() => void publish(p.id)}>
                      Publish listing
                    </Button>
                  )}
                  {p.status === "PUBLISHED" && (
                    <Button size="sm" variant="outline" onClick={() => void act(p.id, "pause")}>
                      Pause
                    </Button>
                  )}
                  {p.status === "PAUSED" && (
                    <Button size="sm" variant="outline" onClick={() => void act(p.id, "resume")}>
                      Resume
                    </Button>
                  )}
                  {p.status === "EXPIRED" && (
                    <Button size="sm" variant="outline" onClick={() => void act(p.id, "renew")}>
                      Renew
                    </Button>
                  )}
                  {(p.status === "PUBLISHED" || p.status === "PAUSED") && (
                    <Button size="sm" variant="outline" onClick={() => void act(p.id, "markRented")}>
                      {p.listingPurpose === "SALE" ? "Mark as sold" : "Mark as rented"}
                    </Button>
                  )}
                  {pendingDelete === p.id ? (
                    <span className="flex flex-wrap items-center gap-2 text-sm">
                      Delete this listing? This will remove it from your active listings.
                      <Button size="sm" variant="outline" onClick={() => setPendingDelete(null)}>
                        Cancel
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => void act(p.id, "delete")}>
                        Delete listing
                      </Button>
                    </span>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => setPendingDelete(p.id)}>
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

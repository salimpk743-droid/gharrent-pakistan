import { createFileRoute, Link } from "@tanstack/react-router";
import { PropertyWizard } from "@/components/listing/property-wizard";
import { SignInPanel } from "@/components/auth/sign-in-panel";
import { useAuthGate } from "@/components/auth/use-auth-gate";
import { getMyListing } from "@/lib/server/listings";
import { useEffect, useState } from "react";
import type { OwnerListing } from "@/lib/types";

import { privateSeo } from "@/lib/seo";

export const Route = createFileRoute("/post/$id")({
  head: () => privateSeo({ title: "Edit listing — Apna Ghar" }),
  component: EditListing,
});

function EditListing() {
  const { id } = Route.useParams();
  const { user, isPending, showSignIn } = useAuthGate();
  const [listing, setListing] = useState<OwnerListing | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPending || !user) return;
    void getMyListing({ data: { id } }).then((res) => {
      if (!res.ok) setError(res.error);
      else setListing(res.listing);
    });
  }, [id, isPending, user]);

  if (showSignIn || (!user && !isPending)) {
    return (
      <main className="grid min-h-[70vh] place-items-center px-4 py-16">
        <SignInPanel
          title="Welcome to Apna Ghar"
          message="Sign in to post properties, save homes and manage your listings."
          callbackURL={`/post/${id}`}
        />
      </main>
    );
  }
  if (isPending) return <div className="grid min-h-[40vh] place-items-center text-sm text-muted">Loading…</div>;
  if (error) {
    return (
      <main className="mx-auto max-w-lg py-20 text-center">
        <h1 className="font-display text-2xl">You cannot edit this listing</h1>
        <p className="mt-2 text-sm text-muted">{error}</p>
        <Link to="/account/listings" className="mt-4 inline-block font-bold text-forest">
          Back to My listings
        </Link>
      </main>
    );
  }
  if (!listing) return <div className="grid min-h-[40vh] place-items-center text-sm text-muted">Loading listing…</div>;
  return <PropertyWizard initial={listing} />;
}

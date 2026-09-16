import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listFavorites, toggleFavorite } from "@/lib/server/favorites";
import { PropertyCard } from "@/components/property/property-card";
import type { PublicProperty } from "@/lib/types";

export const Route = createFileRoute("/account/saved")({
  head: () => ({
    meta: [
      { title: "Saved homes — GharRent Pakistan" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { user, isPending } = useCurrentUserState();
  const [items, setItems] = useState<PublicProperty[] | null>(null);

  useEffect(() => {
    if (user) void listFavorites().then(setItems);
  }, [user]);

  if (isPending) return <div className="grid min-h-[40vh] place-items-center text-sm text-muted">Loading…</div>;
  if (!user) return <Navigate to="/login" search={{ next: "/account/saved" }} />;

  return (
    <main className="mx-auto w-[min(1120px,calc(100%-32px))] py-10">
      <p className="text-[10px] font-extrabold tracking-[0.16em] text-forest">SAVED</p>
      <h1 className="font-display mt-2 text-3xl">Saved homes</h1>
      {!items ? (
        <p className="mt-6 text-sm text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line p-10 text-center text-muted">
          You have not saved any properties yet.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              onToggleSave={(id) => {
                void toggleFavorite({ data: { propertyId: id } }).then(() =>
                  setItems((cur) => (cur || []).filter((x) => x.id !== id)),
                );
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}

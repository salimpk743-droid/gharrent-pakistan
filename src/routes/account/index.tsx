import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyProfile, updateMyProfile } from "@/lib/server/profile";
import type { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/account/")({
  head: () => ({
    meta: [
      { title: "Account — GharRent Pakistan" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, isPending } = useCurrentUserState();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!user) return;
    void getMyProfile().then((p) => {
      setProfile(p);
      setName(p.displayName || "");
      setPhone(p.phone || "");
    });
  }, [user]);

  if (isPending) return <div className="grid min-h-[40vh] place-items-center text-sm text-muted">Loading…</div>;
  if (!user) return <Navigate to="/login" search={{ next: "/account" }} />;

  return (
    <main className="mx-auto w-[min(720px,calc(100%-32px))] py-10">
      <p className="text-[10px] font-extrabold tracking-[0.16em] text-forest">ACCOUNT</p>
      <h1 className="font-display mt-2 text-3xl">Your GharRent profile</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link className="rounded-xl border border-line p-4 no-underline hover:border-forest" to="/account/listings">
          <b>My listings</b>
          <p className="mt-1 text-xs text-muted">Edit, pause, renew or mark homes as rented.</p>
        </Link>
        <Link className="rounded-xl border border-line p-4 no-underline hover:border-forest" to="/account/saved">
          <b>Saved homes</b>
          <p className="mt-1 text-xs text-muted">Properties you have bookmarked.</p>
        </Link>
        {profile && (profile.role === "ADMIN" || profile.role === "MODERATOR") && (
          <Link className="rounded-xl border border-line p-4 no-underline hover:border-forest" to="/admin">
            <b>Admin</b>
            <p className="mt-1 text-xs text-muted">Review listings, users and reports.</p>
          </Link>
        )}
      </div>
      <form
        className="mt-8 grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void updateMyProfile({ data: { displayName: name, phone } }).then((p) => {
            setProfile(p);
            toast("Profile saved");
          });
        }}
      >
        <Label>
          Display name
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Label>
        <Label>
          Phone (private)
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03xx-xxxxxxx" />
        </Label>
        <p className="text-xs text-muted">
          Email is {profile?.email || user.primaryEmail || "on your Google account"} and is never shown on public
          listings.
        </p>
        <Button type="submit" className="w-fit">
          Save profile
        </Button>
      </form>
    </main>
  );
}

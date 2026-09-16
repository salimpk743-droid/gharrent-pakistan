import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SignInPanel } from "@/components/auth/sign-in-panel";
import { useAuthGate } from "@/components/auth/use-auth-gate";
import { signOut } from "@/lib/auth/client";
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
  const { user, isPending, showSignIn } = useAuthGate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!user) return;
    void getMyProfile().then((p) => {
      setProfile(p);
      setName(p.displayName || "");
      setPhone(p.phone || "");
    });
  }, [user]);

  if (showSignIn || (!user && !isPending)) {
    return (
      <main className="grid min-h-[70vh] place-items-center px-4 py-16">
        <SignInPanel callbackURL="/account" />
      </main>
    );
  }
  if (isPending || !user) {
    return <div className="grid min-h-[40vh] place-items-center text-sm text-muted">Loading…</div>;
  }

  const displayName = profile?.displayName || user.displayName || "GharRent user";
  const email = profile?.email || user.primaryEmail || "";
  const avatar = profile?.imageUrl || user.profileImageUrl;

  return (
    <main className="mx-auto w-[min(720px,calc(100%-32px))] py-10">
      <p className="text-[10px] font-extrabold tracking-[0.16em] text-forest">ACCOUNT</p>
      <h1 className="font-display mt-2 text-3xl">Your GharRent profile</h1>

      <section className="mt-6 flex items-center gap-4 rounded-xl border border-line bg-white p-4">
        {avatar ? (
          <img src={avatar} alt="" className="size-16 rounded-full object-cover" />
        ) : (
          <span className="grid size-16 place-items-center rounded-full bg-sand text-xl font-bold text-forest">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-ink">{displayName}</p>
          {email ? <p className="truncate text-sm text-muted">{email}</p> : null}
        </div>
      </section>

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
          Phone (optional — not required to sign in)
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03xx-xxxxxxx" />
        </Label>
        <p className="text-xs text-muted">
          Email is {email || "on your Google account"} and is never shown on public listings.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" className="w-fit">
            Save profile
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={signingOut}
            onClick={() => {
              setSigningOut(true);
              void signOut("/").catch(() => setSigningOut(false));
            }}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </form>
    </main>
  );
}

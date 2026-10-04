import { Link, useLocation } from "@tanstack/react-router";
import { loginHrefFor } from "@/lib/auth-errors";
import { useAuthGate } from "@/components/auth/use-auth-gate";
import { UserButton } from "@/lib/auth/gates";

export function AuthSlot() {
  const { user, isPending, showSignIn } = useAuthGate();
  // Come back to the page you were on after signing in (on the homepage this stays /login?next=/).
  const location = useLocation();
  if (isPending && !user && !showSignIn) {
    return <div className="h-9 w-24 animate-pulse rounded-md bg-sand" aria-hidden="true" />;
  }
  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link to="/account" className="hidden text-sm font-semibold text-ink hover:text-forest sm:inline">
          Account
        </Link>
        <UserButton />
      </div>
    );
  }
  const search = loginHrefFor(location.pathname, location.searchStr ?? "");
  return (
    <Link
      to="/login"
      search={search}
      className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold text-ink hover:text-forest"
    >
      Sign in
    </Link>
  );
}

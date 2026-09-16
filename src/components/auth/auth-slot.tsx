import { Link } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { UserButton } from "@/lib/auth/gates";

export function AuthSlot({ loginHref = "/login" }: { loginHref?: string }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
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
  return (
    <Link
      to="/login"
      search={{ next: loginHref && loginHref !== "/login" ? loginHref : "/" }}
      className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold text-ink hover:text-forest"
    >
      Sign in
    </Link>
  );
}

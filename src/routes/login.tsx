import { createFileRoute, Navigate } from "@tanstack/react-router";
import { SignInPanel } from "@/components/auth/sign-in-panel";
import { useAuthGate } from "@/components/auth/use-auth-gate";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" && s.next.startsWith("/") ? s.next : "/",
  }),
  head: () => ({
    meta: [
      { title: "Sign in — GharRent Pakistan" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Login,
});

function Login() {
  const { next } = Route.useSearch();
  const { user, isPending, showSignIn } = useAuthGate();
  if (user) return <Navigate to={next as never} />;
  if (isPending && !showSignIn) {
    return <div className="grid min-h-[50vh] place-items-center text-sm text-muted">Loading…</div>;
  }
  return (
    <main className="grid min-h-[70vh] place-items-center px-4 py-16">
      <SignInPanel callbackURL={next} />
    </main>
  );
}

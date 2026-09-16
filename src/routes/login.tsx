import { createFileRoute } from "@tanstack/react-router";
import { SignInPanel } from "@/components/auth/sign-in-panel";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Navigate } from "@tanstack/react-router";

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
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="grid min-h-[50vh] place-items-center text-sm text-muted">Loading…</div>;
  }
  if (user) return <Navigate to={next as never} />;
  const posting = next.startsWith("/post");
  return (
    <main className="grid min-h-[70vh] place-items-center px-4 py-16">
      <SignInPanel
        title={posting ? "Sign in to post your property" : "Sign in to GharRent"}
        message={
          posting
            ? "Continue with Google to create your listing. After you sign in we will return you to the posting flow."
            : "Continue with Google to save homes, manage listings and contact advertisers more easily."
        }
        callbackURL={next}
      />
    </main>
  );
}

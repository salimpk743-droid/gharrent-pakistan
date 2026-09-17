import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SignInPanel } from "@/components/auth/sign-in-panel";
import { useAuthGate } from "@/components/auth/use-auth-gate";
import { createDraft } from "@/lib/server/listings";

export const Route = createFileRoute("/post/")({
  head: () => ({
    meta: [
      { title: "Post a property — Apna Ghar" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PostStart,
});

function PostStart() {
  const { user, isPending, showSignIn } = useAuthGate();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPending || !user) return;
    let cancelled = false;
    void createDraft()
      .then((draft) => {
        if (!cancelled) void navigate({ to: "/post/$id", params: { id: draft.id }, replace: true });
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof Error && err.message === "Unauthorized" ? "sign-in" : "error";
        setError(message);
      });
    return () => {
      cancelled = true;
    };
  }, [isPending, user, navigate]);

  if (showSignIn || error === "sign-in" || (!user && !isPending)) {
    return (
      <main className="grid min-h-[70vh] place-items-center px-4 py-16">
        <SignInPanel
          title="Welcome to Apna Ghar"
          message="Sign in to post properties, save homes and manage your listings."
          callbackURL="/post"
        />
      </main>
    );
  }
  if (isPending) {
    return <div className="grid min-h-[50vh] place-items-center text-sm text-muted">Preparing your listing…</div>;
  }
  if (error) {
    return (
      <main className="mx-auto max-w-md py-20 text-center">
        <h1 className="font-display text-2xl">Could not start a listing</h1>
        <p className="mt-2 text-sm text-muted">Please try again in a moment.</p>
      </main>
    );
  }
  return <div className="grid min-h-[50vh] place-items-center text-sm text-muted">Creating your draft…</div>;
}

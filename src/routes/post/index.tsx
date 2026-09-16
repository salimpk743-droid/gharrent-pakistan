import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SignInPanel } from "@/components/auth/sign-in-panel";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { createDraft } from "@/lib/server/listings";

export const Route = createFileRoute("/post/")({
  head: () => ({
    meta: [
      { title: "Post a property — GharRent Pakistan" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PostStart,
});

function PostStart() {
  const { user, isPending } = useCurrentUserState();
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

  if (isPending) {
    return <div className="grid min-h-[50vh] place-items-center text-sm text-muted">Preparing your listing…</div>;
  }
  if (!user || error === "sign-in") {
    return (
      <main className="grid min-h-[70vh] place-items-center px-4 py-16">
        <SignInPanel
          title="Sign in to post your property"
          message="Continue with Google to create an account and start the listing wizard."
          callbackURL="/post"
        />
      </main>
    );
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

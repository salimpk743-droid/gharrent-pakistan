import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { SignInPanel } from "@/components/auth/sign-in-panel";
import { useAuthGate } from "@/components/auth/use-auth-gate";
import { friendlyCallbackError, safeCallback } from "@/lib/auth-errors";

import { FORM_PAGE_FONT_PRELOADS } from "@/lib/form-page-head";
import { privateSeo } from "@/lib/seo";

type LoginSearch = { next?: string; error?: string };

export const Route = createFileRoute("/login")({
  // Both are optional, so a plain /login link is served directly (no extra redirect to add ?next=/).
  validateSearch: (s: Record<string, unknown>): LoginSearch => ({
    next: typeof s.next === "string" && s.next.startsWith("/") ? s.next : undefined,
    error: typeof s.error === "string" ? s.error.slice(0, 80) : undefined,
  }),
  head: () => ({ ...privateSeo({ title: "Sign in — Apna Ghar" }), links: FORM_PAGE_FONT_PRELOADS }),
  component: Login,
});

function Login() {
  const { next: rawNext, error } = Route.useSearch();
  const next = safeCallback(rawNext);
  const { user, isPending, showSignIn } = useAuthGate();
  const router = useRouter();
  useEffect(() => {
    if (user) void router.navigate({ href: next, replace: true });
  }, [user, next, router]);
  if (user) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-sm text-muted" role="status">
        Signed in. Taking you back…
      </div>
    );
  }
  if (isPending && !showSignIn) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-sm text-muted" role="status">
        Checking your account…
      </div>
    );
  }
  return (
    <main className="grid min-h-[70vh] place-items-center px-4 py-10 sm:py-16">
      <SignInPanel
        callbackURL={next}
        initialError={friendlyCallbackError(error)}
        message={
          next.startsWith("/post")
            ? "Sign in to publish your ad. It takes a few seconds with Google."
            : "Sign in to post properties, save homes and manage your listings."
        }
      />
    </main>
  );
}

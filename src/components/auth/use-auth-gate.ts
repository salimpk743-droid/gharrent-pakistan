import { useRouteContext } from "@tanstack/react-router";
import { useCurrentUserState, type AppUser } from "@/lib/auth/use-current-user";

function inLivePreview(): boolean {
  return typeof window !== "undefined" && window.location.hostname.endsWith(".grok-sandbox.com");
}

/**
 * Combine cookie-SSR session with the client session store.
 *
 * Production visitors must see Continue with Google immediately — waiting on
 * `useSession().isPending` is what left /login stuck on "Loading…".
 * Live preview still waits: the owner is often signed in via gate identity
 * with a bearer token that SSR cannot see.
 */
export function useAuthGate(): {
  user: AppUser | null;
  isPending: boolean;
  showSignIn: boolean;
} {
  const { sessionUser } = useRouteContext({ from: "__root__" });
  const { user, isPending } = useCurrentUserState();

  if (user) return { user, isPending: false, showSignIn: false };

  if (sessionUser) {
    return {
      user: {
        id: sessionUser.id,
        displayName: null,
        primaryEmail: sessionUser.email,
        profileImageUrl: null,
        isDevFallback: false,
      },
      isPending,
      showSignIn: false,
    };
  }

  if (isPending && inLivePreview()) {
    return { user: null, isPending: true, showSignIn: false };
  }

  return { user: null, isPending: false, showSignIn: true };
}

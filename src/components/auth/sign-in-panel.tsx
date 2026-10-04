import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { authClient, authEnabled, getBearerToken, signIn } from "@/lib/auth/client";
import { friendlyAuthError, MAX_PASSWORD, MIN_PASSWORD, safeCallback } from "@/lib/auth-errors";
import { emailAndPasswordEnabled } from "@/lib/auth/email-password";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** If Google has not opened after this long, let the visitor try again. */
const GOOGLE_STUCK_MS = 15_000;

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.94 1 10.93 1 13s.43 4.06 1.18 5.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function SignInPanel({
  title = "Welcome to Apna Ghar",
  message = "Sign in to post properties, save homes and manage your listings.",
  callbackURL = "/",
  initialError = null,
  onSignedIn,
}: {
  title?: string;
  message?: string;
  callbackURL?: string;
  /** A message to show straight away (e.g. Google sent the visitor back with an error). */
  initialError?: string | null;
  /** Email sign-in: called instead of reloading the page (the session store updates by itself). */
  onSignedIn?: () => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"register" | "signin">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState(""); // honeypot: hidden from people, filled by bots
  const [googleBusy, setGoogleBusy] = useState(false);
  const [formBusy, setFormBusy] = useState(false);
  const [error, setErrorText] = useState<string | null>(initialError);
  const [errorFrom, setErrorFrom] = useState<"google" | "form">("google");
  const setError = (message: string | null, from: "google" | "form" = "form") => {
    setErrorText(message);
    setErrorFrom(from);
  };
  const busyRef = useRef(false);
  const busy = googleBusy || formBusy;
  const next = safeCallback(callbackURL);

  // Coming back to this page with the browser's Back button after Google opened: unlock the button.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        busyRef.current = false;
        setGoogleBusy(false);
      }
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  async function continueWithGoogle() {
    if (busyRef.current) return;
    busyRef.current = true;
    setGoogleBusy(true);
    setError(null);
    const stuck = window.setTimeout(() => {
      busyRef.current = false;
      setGoogleBusy(false);
      setError("Google is taking too long to open. Check your internet and tap Continue with Google again.", "google");
    }, GOOGLE_STUCK_MS);
    try {
      await signIn("grok-google", {
        callbackURL: next,
        // Keep the return path if Google sends the visitor back with an error.
        errorCallbackURL: `/login?next=${encodeURIComponent(next)}`,
        // This panel only shows when nobody is signed in, so the extra sign-out request is not needed.
        skipPriorSignOut: !getBearerToken(),
      });
      // The browser is now leaving for Google; keep the loading state until it does.
    } catch (err) {
      window.clearTimeout(stuck);
      setError(friendlyAuthError(err instanceof Error ? err.message : ""), "google");
      busyRef.current = false;
      setGoogleBusy(false);
    }
  }

  function validate(): string | null {
    if (mode === "register") {
      const displayName = name.trim();
      if (!displayName) return "Enter your name.";
      if (displayName.length < 2) return "Name must be at least 2 characters.";
      if (displayName.length > 80) return "Name must be 80 characters or fewer.";
    }
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return "Enter your email address.";
    if (!EMAIL_RE.test(trimmedEmail)) return "Enter a valid email address.";
    if (!password) return "Enter a password.";
    if (password.length < MIN_PASSWORD) return `Use a password of at least ${MIN_PASSWORD} characters.`;
    if (password.length > MAX_PASSWORD) return `Password must be ${MAX_PASSWORD} characters or fewer.`;
    return null;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current) return;
    if (company.trim()) {
      setError("Could not create your account. Please try again.");
      return;
    }
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    busyRef.current = true;
    setFormBusy(true);
    setError(null);
    try {
      if (mode === "register") {
        const { data, error: signUpError } = await authClient.signUp.email({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          callbackURL: next,
        });
        if (signUpError) {
          if (/already/i.test(`${signUpError.code ?? ""} ${signUpError.message ?? ""}`)) setMode("signin");
          throw new Error(friendlyAuthError(signUpError.message ?? "", signUpError.code));
        }
        if (!data?.user) throw new Error("Could not create your account. Please try again.");
      } else {
        const { data, error: signInError } = await authClient.signIn.email({
          email: email.trim().toLowerCase(),
          password,
          callbackURL: next,
        });
        if (signInError) {
          throw new Error(friendlyAuthError(signInError.message ?? "", signInError.code));
        }
        if (!data?.user) throw new Error("Could not sign you in. Please try again.");
      }
      if (onSignedIn) {
        busyRef.current = false;
        setFormBusy(false);
        onSignedIn();
        return;
      }
      // No full page reload: refresh the signed-in state and go straight back to where the visitor was.
      await router.invalidate().catch(() => undefined);
      await router.navigate({ href: next, replace: true });
    } catch (err) {
      setError(friendlyAuthError(err instanceof Error ? err.message : ""));
      busyRef.current = false;
      setFormBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-line bg-white p-6 shadow-[0_12px_35px_rgba(16,50,42,0.08)]">
      <p className="text-[10px] font-extrabold tracking-[0.16em] text-forest">ACCOUNT</p>
      <h1 className="font-display mt-2 text-3xl tracking-tight text-ink">{title}</h1>
      <p className="mt-2 text-sm text-muted">{message}</p>
      {authEnabled ? (
        <div className="mt-6 flex flex-col gap-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="min-h-13 w-full gap-3 border-line bg-white text-base text-ink hover:bg-sand"
            disabled={busy}
            aria-busy={googleBusy}
            onClick={() => void continueWithGoogle()}
          >
            {googleBusy ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <GoogleMark />}
            {googleBusy ? "Opening Google…" : "Continue with Google"}
          </Button>
          {error && (errorFrom === "google" || !emailAndPasswordEnabled) ? (
            <p className="rounded-md bg-red-50 px-3 py-2.5 text-sm text-danger" role="alert" aria-live="assertive">
              {error}
            </p>
          ) : null}
          {emailAndPasswordEnabled ? (
            <>
              <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                <span className="h-px flex-1 bg-line" />
                or use your email
                <span className="h-px flex-1 bg-line" />
              </div>
              <form className="grid gap-3" onSubmit={(event) => void onSubmit(event)} noValidate>
                <p className="text-[11px] font-extrabold tracking-[0.14em] text-forest">
                  {mode === "register" ? "CREATE AN ACCOUNT" : "SIGN IN"}
                </p>
                {mode === "register" ? (
                  <Label>
                    Name
                    <Input
                      className="min-h-12 text-base font-normal sm:text-sm"
                      name="name"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      disabled={busy}
                      required
                    />
                  </Label>
                ) : null}
                <Label>
                  Email
                  <Input
                    className="min-h-12 text-base font-normal sm:text-sm"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    disabled={busy}
                    required
                  />
                </Label>
                <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                  <label>
                    Company
                    <input
                      tabIndex={-1}
                      autoComplete="off"
                      name="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </label>
                </div>
                <Label>
                  Password
                  <Input
                    className="min-h-12 text-base font-normal sm:text-sm"
                    name="password"
                    type="password"
                    autoComplete={mode === "register" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "register" ? `At least ${MIN_PASSWORD} characters` : "Your password"}
                    disabled={busy}
                    minLength={MIN_PASSWORD}
                    maxLength={MAX_PASSWORD}
                    required
                  />
                </Label>
                {error && errorFrom === "form" ? (
                  <p className="rounded-md bg-red-50 px-3 py-2.5 text-sm text-danger" role="alert" aria-live="assertive">
                    {error}
                  </p>
                ) : null}
                <Button type="submit" size="lg" className="w-full" disabled={busy} aria-busy={formBusy}>
                  {formBusy ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : null}
                  {formBusy
                    ? mode === "register"
                      ? "Creating account…"
                      : "Signing in…"
                    : mode === "register"
                      ? "Create account"
                      : "Sign in"}
                </Button>
                <p className="text-center text-sm text-muted">
                  {mode === "register" ? (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center px-1 font-semibold text-forest hover:underline"
                        disabled={busy}
                        onClick={() => {
                          setMode("signin");
                          setError(null);
                        }}
                      >
                        Sign in
                      </button>
                    </>
                  ) : (
                    <>
                      New to Apna Ghar?{" "}
                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center px-1 font-semibold text-forest hover:underline"
                        disabled={busy}
                        onClick={() => {
                          setMode("register");
                          setError(null);
                        }}
                      >
                        Create an account
                      </button>
                    </>
                  )}
                </p>
              </form>
            </>
          ) : null}
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted">Sign-in is disabled in this environment.</p>
      )}
      <p className="mt-5 text-xs leading-relaxed text-muted">
        Create an account with your name, email and password, or continue with Google. No phone number is
        required. We do not post on your behalf.
      </p>
    </div>
  );
}

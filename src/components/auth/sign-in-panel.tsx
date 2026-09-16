import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export function SignInPanel({
  title = "Sign in to GharRent",
  message = "Continue with Google to post properties, save homes and manage your listings.",
  callbackURL = "/",
}: {
  title?: string;
  message?: string;
  callbackURL?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-line bg-white p-6 shadow-[0_12px_35px_rgba(16,50,42,0.08)]">
      <p className="text-[10px] font-extrabold tracking-[0.16em] text-forest">ACCOUNT</p>
      <h1 className="font-display mt-2 text-3xl tracking-tight text-ink">{title}</h1>
      <p className="mt-2 text-sm text-muted">{message}</p>
      {authEnabled ? (
        <div className="mt-6 flex flex-col gap-2">
          {GROK_PROVIDERS.map((p) => (
            <Button
              key={p.providerId}
              type="button"
              variant={p.idp === "google" ? "default" : "outline"}
              className="w-full"
              onClick={() => signIn(p.providerId, { callbackURL })}
            >
              Continue with {p.label}
            </Button>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted">Sign-in is disabled in this environment.</p>
      )}
      <p className="mt-5 text-xs leading-relaxed text-muted">
        We only use your name, email and profile photo to create your GharRent account. We do not post on
        your behalf.
      </p>
    </div>
  );
}

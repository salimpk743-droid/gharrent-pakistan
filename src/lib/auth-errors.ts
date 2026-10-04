/** Plain-language sign-in messages and safe return paths. Pure, so it is unit-tested (auth-errors.test.ts). */

export const MIN_PASSWORD = 8;
export const MAX_PASSWORD = 128;

/** Only same-site paths are allowed as a return address (no //evil.com, no https://…). */
export function safeCallback(url: string | null | undefined): string {
  const value = String(url || "");
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/";
  if (value.startsWith("/login")) return "/";
  return value.slice(0, 500);
}

/** The login link for the page the visitor is on, so they come back to it after signing in. */
export function loginHrefFor(pathname: string, search = ""): { next?: string } {
  const here = safeCallback(`${pathname}${search}`);
  return here === "/" ? { next: "/" } : { next: here };
}

export function friendlyAuthError(message: string | null | undefined, code?: string | null): string {
  const raw = String(message || "");
  const text = `${code ?? ""} ${raw}`.toLowerCase();
  if (/failed to fetch|networkerror|network request failed|load failed|err_internet|offline/.test(text)) {
    return "No internet connection. Check your connection and try again.";
  }
  if (/timed? ?out|timeout/.test(text)) return "This is taking too long. Please check your internet and try again.";
  if (/user_already_exists|already exists|already registered/.test(text)) {
    return "An account with this email already exists. Tap “Sign in” below, or continue with Google.";
  }
  if (/invalid_email_or_password|invalid email or password|invalid credentials|invalid password/.test(text)) {
    return "That email or password is not correct.";
  }
  if (/password_too_short|too short/.test(text)) return `Use a password of at least ${MIN_PASSWORD} characters.`;
  if (/password_too_long|too long/.test(text)) return `Password must be ${MAX_PASSWORD} characters or fewer.`;
  if (/invalid_email|invalid email/.test(text)) return "Enter a valid email address.";
  if (/too_many_requests|too many requests|rate limit|429/.test(text)) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  if (/provider not found|provider_not_found/.test(text)) {
    return "Google sign-in is not available right now. Please use email, or try again in a few minutes.";
  }
  if (/invalid origin|invalid_origin|invalid callbackurl|invalid_callback/.test(text)) {
    return "Sign-in could not start from this page. Please refresh and try again.";
  }
  const cleaned = raw.trim();
  if (cleaned && cleaned.length <= 120 && !/[{}<>]|^\s*error\b|exception|stack/i.test(cleaned)) return cleaned;
  return "Something went wrong. Please try again.";
}

/** Messages for the `?error=` code Better Auth adds when a Google sign-in comes back with a problem. */
export function friendlyCallbackError(code: string | null | undefined): string | null {
  if (!code) return null;
  const c = code.toLowerCase();
  if (/access_denied|cancel/.test(c)) return "Google sign-in was cancelled. You can try again, or use your email.";
  if (/state|please_restart|expired|mismatch/.test(c)) {
    return "Your sign-in took too long or was opened in another tab. Please tap Continue with Google again.";
  }
  if (/account_not_linked|email_doesn.?t_match|email_not_found/.test(c)) {
    return "This email already has an account. Sign in with your email and password instead.";
  }
  if (/unable_to_get_user_info|invalid_code|oauth|provider/.test(c)) {
    return "Google could not confirm your account. Please try again, or use your email.";
  }
  if (/banned|suspended/.test(c)) return "This account has been suspended. Contact Apna Ghar if you think this is a mistake.";
  return "Sign-in did not finish. Please try again, or use your email.";
}

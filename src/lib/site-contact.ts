/**
 * Public contact details for Apna Ghar — the single place to change them.
 * The owner may correct the email spelling later; edit only this file.
 */
export const CONTACT_EMAIL = "gahrrentpakistan@gmail.com";

export function mailtoUrl(subject?: string): string {
  return `mailto:${CONTACT_EMAIL}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
}

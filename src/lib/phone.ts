/** Normalize a Pakistani mobile number to 03XXXXXXXXX, or null if invalid. */
export function normalizePkPhone(input: string | null | undefined): string | null {
  if (!input) return null;
  const digits = String(input).replace(/[^\d]/g, "");
  let n = digits;
  if (n.startsWith("0092")) n = n.slice(4);
  else if (n.startsWith("92")) n = n.slice(2);
  if (n.startsWith("0")) n = n.slice(1);
  if (!/^3\d{9}$/.test(n)) return null;
  return `0${n}`;
}

export function formatPkPhone(input: string | null | undefined): string {
  const n = normalizePkPhone(input);
  if (!n) return String(input || "").trim();
  return `${n.slice(0, 4)}-${n.slice(4)}`;
}

export function whatsappLink(input: string | null | undefined, text?: string): string | null {
  const n = normalizePkPhone(input);
  if (!n) return null;
  const intl = `92${n.slice(1)}`;
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${intl}${q}`;
}

export function telLink(input: string | null | undefined): string | null {
  const n = normalizePkPhone(input);
  if (!n) return null;
  return `tel:+92${n.slice(1)}`;
}

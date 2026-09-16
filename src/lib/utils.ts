import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string): string {
  return String(value || "")
    .normalize("NFKD")
    .replaceAll("_", " ")
    .replace(/&/g, " and ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, (ch) => `\\${ch}`);
}

export function formatPkr(amount: number | string | null | undefined): string {
  const n = typeof amount === "number" ? amount : Number(String(amount ?? "").replace(/[^0-9.-]/g, "")) || 0;
  return `Rs. ${Math.round(n).toLocaleString("en-PK")}`;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

export function newId(): string {
  return crypto.randomUUID();
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

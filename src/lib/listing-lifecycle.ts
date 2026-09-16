import type { ListingStatus } from "./constants";

export type OwnerAction = "submit" | "pause" | "resume" | "markRented" | "renew" | "delete" | "reopen";
export type AdminAction = "approve" | "reject" | "suspend" | "archive" | "feature" | "unfeature";

const OWNER_TRANSITIONS: Record<OwnerAction, { from: ListingStatus[]; to: ListingStatus }> = {
  submit: { from: ["DRAFT", "REJECTED"], to: "PENDING_REVIEW" },
  pause: { from: ["PUBLISHED"], to: "PAUSED" },
  resume: { from: ["PAUSED"], to: "PUBLISHED" },
  markRented: { from: ["PUBLISHED", "PAUSED"], to: "RENTED" },
  renew: { from: ["EXPIRED", "PUBLISHED", "PAUSED"], to: "PUBLISHED" },
  delete: {
    from: ["DRAFT", "PENDING_REVIEW", "PUBLISHED", "PAUSED", "REJECTED", "RENTED", "EXPIRED"],
    to: "DELETED",
  },
  reopen: { from: ["RENTED"], to: "DRAFT" },
};

const ADMIN_TRANSITIONS: Record<AdminAction, { from: ListingStatus[] | "*"; to?: ListingStatus }> = {
  approve: { from: ["PENDING_REVIEW"], to: "PUBLISHED" },
  reject: { from: ["PENDING_REVIEW"], to: "REJECTED" },
  suspend: { from: ["PUBLISHED", "PAUSED", "PENDING_REVIEW"], to: "PAUSED" },
  archive: { from: "*", to: "DELETED" },
  feature: { from: ["PUBLISHED"] },
  unfeature: { from: ["PUBLISHED", "PAUSED"] },
};

export function canOwnerTransition(from: ListingStatus, action: OwnerAction): boolean {
  if (from === "DELETED") return false;
  return OWNER_TRANSITIONS[action].from.includes(from);
}

export function ownerNextStatus(
  from: ListingStatus,
  action: OwnerAction,
  options?: { autoPublish?: boolean; expired?: boolean },
): ListingStatus | null {
  if (!canOwnerTransition(from, action)) return null;
  if (action === "submit") {
    return options?.autoPublish ? "PUBLISHED" : "PENDING_REVIEW";
  }
  if (action === "resume" && options?.expired) return "EXPIRED";
  return OWNER_TRANSITIONS[action].to;
}

export function canAdminTransition(from: ListingStatus, action: AdminAction): boolean {
  if (from === "DELETED" && action !== "archive") return false;
  const rule = ADMIN_TRANSITIONS[action];
  if (rule.from === "*") return from !== "DELETED" || action === "archive";
  return rule.from.includes(from);
}

export function adminNextStatus(from: ListingStatus, action: AdminAction): ListingStatus | null {
  if (!canAdminTransition(from, action)) return null;
  return ADMIN_TRANSITIONS[action].to ?? from;
}

export function isPubliclyVisible(status: ListingStatus, deletedAt?: string | null): boolean {
  return status === "PUBLISHED" && !deletedAt;
}

export function daysFromNow(days: number, from = new Date()): Date {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function isExpired(expiresAt: string | Date | null | undefined, now = new Date()): boolean {
  if (!expiresAt) return false;
  const d = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return !Number.isNaN(d.getTime()) && d.getTime() < now.getTime();
}

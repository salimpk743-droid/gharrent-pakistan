import type { ListingStatus, UserRole } from "./constants";

export type Actor = {
  userId: string;
  role: UserRole;
  status: "ACTIVE" | "SUSPENDED";
};

export function isStaff(role: UserRole | null | undefined): boolean {
  return role === "ADMIN" || role === "MODERATOR";
}

export function isAdmin(role: UserRole | null | undefined): boolean {
  return role === "ADMIN";
}

export function canAccessAccount(actor: Actor | null): boolean {
  return Boolean(actor && actor.status === "ACTIVE");
}

export function canPostListing(actor: Actor | null): boolean {
  return Boolean(actor && actor.status === "ACTIVE");
}

export function canMutateListing(actor: Actor | null, ownerId: string): boolean {
  if (!actor || actor.status !== "ACTIVE") return false;
  if (actor.userId === ownerId) return true;
  return isStaff(actor.role);
}

export function canEditListing(actor: Actor | null, ownerId: string, status: ListingStatus): boolean {
  if (!canMutateListing(actor, ownerId)) return false;
  if (status === "DELETED") return isStaff(actor!.role);
  return true;
}

export function canViewOwnerDashboard(actor: Actor | null, ownerId: string): boolean {
  return canMutateListing(actor, ownerId);
}

export function canModerate(actor: Actor | null): boolean {
  return Boolean(actor && actor.status === "ACTIVE" && isStaff(actor.role));
}

export function canManageUsers(actor: Actor | null): boolean {
  return Boolean(actor && actor.status === "ACTIVE" && isAdmin(actor.role));
}

export function assertCanMutate(actor: Actor | null, ownerId: string): void {
  if (!canMutateListing(actor, ownerId)) {
    const err = new Error("You do not have permission to change this listing.");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
}

/** Client-supplied owner ids must never be trusted — compare only to session user. */
export function isSelf(actor: Actor | null, claimedUserId: string | undefined): boolean {
  if (!actor || !claimedUserId) return false;
  return actor.userId === claimedUserId;
}

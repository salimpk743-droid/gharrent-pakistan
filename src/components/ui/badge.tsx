import { cn } from "@/lib/utils";
import type { ListingStatus } from "@/lib/constants";
import { STATUS_LABEL } from "@/lib/constants";

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-lime px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}

const STATUS_CLASS: Record<ListingStatus, string> = {
  DRAFT: "bg-sand text-muted",
  PENDING_REVIEW: "bg-cream text-ink",
  PUBLISHED: "bg-lime text-ink",
  PAUSED: "bg-sand text-ink",
  REJECTED: "bg-red-100 text-danger",
  RENTED: "bg-forest/10 text-forest",
  EXPIRED: "bg-sand text-muted",
  DELETED: "bg-sand text-muted",
};

export function StatusBadge({ status }: { status: ListingStatus }) {
  return <Badge className={STATUS_CLASS[status]}>{STATUS_LABEL[status]}</Badge>;
}

import { Link } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link
      to="/"
      className={cn("flex min-w-0 items-center gap-1 text-ink no-underline", className)}
      aria-label="Apna Ghar home"
    >
      <span className="grid size-7 shrink-0 place-items-center rounded-md bg-forest text-white">
        <Home className="size-4" strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className="truncate text-[21px] font-extrabold tracking-tight">
        Apna<span className="text-forest-2">Ghar</span>
      </span>
      {!compact && (
        <small className="mb-2.5 hidden self-end text-[7px] font-bold uppercase tracking-[0.08em] text-ink sm:inline">
          Pakistan
        </small>
      )}
    </Link>
  );
}

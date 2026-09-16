import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Home, Plus, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/", label: "Home", icon: Home, exact: true, emphasize: false },
  { to: "/rent", label: "Search", icon: Search, exact: false, emphasize: false },
  { to: "/post", label: "Post", icon: Plus, exact: false, emphasize: true },
  { to: "/account/saved", label: "Saved", icon: Heart, exact: false, emphasize: false },
  { to: "/account", label: "Account", icon: User, exact: true, emphasize: false },
] as const;

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 grid h-16 grid-cols-5 border-t border-line bg-white shadow-[0_-5px_18px_rgba(20,50,42,0.08)] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile"
    >
      {ITEMS.map((item) => {
        const active = item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold no-underline",
              active || item.emphasize ? "text-forest" : "text-[#60716a]",
            )}
          >
            <Icon className="size-5" strokeWidth={item.emphasize ? 2.4 : 2} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

import { Link, useRouterState } from "@tanstack/react-router";
import { AuthSlot } from "@/components/auth/auth-slot";
import { Brand } from "./brand";

const NAV = [
  { to: "/locations" as const, label: "Browse" },
  { to: "/rent" as const, label: "Rent" },
  { to: "/sale" as const, label: "Buy" },
  { to: "/safety" as const, label: "Safety" },
];

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="sticky top-0 z-30 flex h-[68px] min-w-0 items-center gap-3 border-b border-line bg-white px-4 md:gap-6 md:px-[max(16px,calc((100vw-1120px)/2))]">
      <Brand className="min-w-0 shrink" />
      <nav className="ml-auto hidden items-center gap-6 md:flex" aria-label="Main">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`text-[13px] font-semibold no-underline ${
              pathname.startsWith(item.to) ? "text-forest" : "text-[#365048] hover:text-forest-2"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="ml-auto flex shrink-0 items-center gap-1.5 md:ml-4 md:gap-2">
        <Link
          to="/post"
          className="inline-flex min-h-11 items-center rounded-md bg-forest px-3 text-sm font-bold text-white hover:bg-forest-2 md:px-3.5"
        >
          <span className="sm:hidden">Post</span>
          <span className="hidden sm:inline">Post a property</span>
        </Link>
        <div className="hidden md:block">
          <AuthSlot />
        </div>
      </div>
    </header>
  );
}

import { Footer } from "./footer";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh min-w-0 flex-col bg-white text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Header />
      <div id="main" className="flex min-w-0 flex-1 flex-col">
        {children}
      </div>
      <Footer />
      <MobileNav />
    </div>
  );
}

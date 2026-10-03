import { useRouterState } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { whatsappChatUrl } from "@/lib/site-contact";

/** Paths where the floating button would get in the way or is not wanted. */
function hiddenOn(pathname: string): boolean {
  // The homepage must stay exactly as it is.
  if (pathname === "/") return true;
  return pathname.startsWith("/admin") || pathname.startsWith("/login");
}

export function FloatingWhatsApp() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (hiddenOn(pathname)) return null;
  return (
    <a
      href={whatsappChatUrl()}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Apna Ghar on WhatsApp"
      className="fixed bottom-20 right-4 z-30 flex size-12 items-center justify-center rounded-full bg-[#1f8f4e] text-white shadow-[0_6px_18px_rgba(20,50,42,0.25)] no-underline hover:bg-[#187a42] md:bottom-6 md:right-6 md:size-14"
    >
      <MessageCircle className="size-6" aria-hidden="true" />
    </a>
  );
}

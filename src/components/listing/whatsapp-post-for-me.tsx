import { MessageCircle } from "lucide-react";
import { WHATSAPP_DISPLAY, WHATSAPP_POST_FOR_ME_MESSAGE, whatsappChatUrl } from "@/lib/site-contact";

/** "Send your property on WhatsApp and we'll post it free" — used on /post and empty listing pages. */
export function WhatsAppPostForMe({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-line bg-sand p-4 sm:p-5 ${className}`}>
      <p className="text-sm font-bold text-ink">Prefer WhatsApp? We'll post it for you, free.</p>
      <p className="mt-1 text-sm text-muted">
        Send your property details and a few photos to{" "}
        <span className="whitespace-nowrap">{WHATSAPP_DISPLAY}</span>. We will create the ad for you at no cost.
      </p>
      <a
        href={whatsappChatUrl(WHATSAPP_POST_FOR_ME_MESSAGE)}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#1f7a4d] px-4 text-sm font-bold text-white no-underline hover:bg-[#19663f]"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        Send your property on WhatsApp
      </a>
    </div>
  );
}

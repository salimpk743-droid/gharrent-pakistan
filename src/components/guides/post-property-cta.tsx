import { WHATSAPP_POST_FOR_ME_MESSAGE, whatsappChatUrl } from "@/lib/site-contact";

/** Shown on guides: owners can post free (or send it on WhatsApp). */
export function PostPropertyCta({ city }: { city?: string }) {
  return (
    <section className="mt-10 rounded-xl border border-line bg-cream p-5">
      <h2 className="mt-0! text-xl!">Have a property to rent out or sell{city ? ` in ${city}` : ""}?</h2>
      <p>
        <a href="/post">Post your property free</a> — no account needed until you publish. Or{" "}
        <a href={whatsappChatUrl(WHATSAPP_POST_FOR_ME_MESSAGE)} target="_blank" rel="noreferrer">
          send it on WhatsApp
        </a>{" "}
        and we will post it for you, free.
      </p>
    </section>
  );
}

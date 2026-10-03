import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { sendContactMessage } from "@/lib/server/admin";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { toast } from "sonner";

import { publicSeo } from "@/lib/seo";
import { Mail, MessageCircle } from "lucide-react";
import {
  CONTACT_EMAIL,
  WHATSAPP_DISPLAY,
  WHATSAPP_POST_FOR_ME_MESSAGE,
  mailtoUrl,
  whatsappChatUrl,
} from "@/lib/site-contact";

export const Route = createFileRoute("/contact")({
  head: () =>
    publicSeo({
      title: "Contact Apna Ghar | Pakistan Property Marketplace",
      description: `Contact Apna Ghar by email (${CONTACT_EMAIL}) or WhatsApp (${WHATSAPP_DISPLAY}) about listings, posting a property, safety or the website.`,
      path: "/contact",
    }),
  component: ContactPage,
});

function ContactPage() {
  const user = useCurrentUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General question");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot: real people never see or fill this

  return (
    <main className="mx-auto w-[min(640px,calc(100%-32px))] py-16">
      <p className="text-[10px] font-extrabold tracking-[0.16em] text-forest">CONTACT</p>
      <h1 className="font-display mt-2 text-4xl">Contact Apna Ghar</h1>
      <p className="mt-2 text-sm text-muted">
        Questions about posting, a listing or the website? Email or WhatsApp us, or use the form below. To report a
        specific listing, open that listing and choose Report this listing.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <a
          href={mailtoUrl("Apna Ghar")}
          className="flex items-center gap-3 rounded-xl border border-line p-4 text-sm no-underline hover:border-forest"
        >
          <Mail className="size-5 shrink-0 text-forest" aria-hidden="true" />
          <span>
            <b className="block text-ink">Email</b>
            <span className="break-all text-muted">{CONTACT_EMAIL}</span>
          </span>
        </a>
        <a
          href={whatsappChatUrl()}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl border border-line p-4 text-sm no-underline hover:border-forest"
        >
          <MessageCircle className="size-5 shrink-0 text-forest" aria-hidden="true" />
          <span>
            <b className="block text-ink">WhatsApp</b>
            <span className="text-muted">{WHATSAPP_DISPLAY}</span>
          </span>
        </a>
      </div>
      <p className="mt-3 text-sm text-muted">
        Want us to post your property for you?{" "}
        <a
          href={whatsappChatUrl(WHATSAPP_POST_FOR_ME_MESSAGE)}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-forest"
        >
          Send the details and photos on WhatsApp
        </a>{" "}
        and we will post it free.
      </p>
      <h2 className="font-display mt-10 text-2xl">Send a message</h2>
      <form
        className="mt-4 grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          void sendContactMessage({
            data: { name, email, subject, message, userId: user?.id, website },
          }).then((res) => {
            setBusy(false);
            if (!res.ok) toast.error(res.error);
            else {
              toast("Message received. Thank you.");
              setMessage("");
            }
          });
        }}
      >
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>
        </div>
        <Label>
          Name
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Label>
        <Label>
          Email
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Label>
        <Label>
          Subject
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </Label>
        <Label>
          Message
          <Textarea required minLength={10} rows={6} value={message} onChange={(e) => setMessage(e.target.value)} />
        </Label>
        <Button type="submit" disabled={busy}>
          {busy ? "Sending…" : "Send message"}
        </Button>
      </form>
    </main>
  );
}

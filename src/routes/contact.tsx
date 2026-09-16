import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { sendContactMessage } from "@/lib/server/admin";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — GharRent Pakistan" },
      { name: "description", content: "Contact GharRent Pakistan about listings, safety or the website." },
    ],
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

  return (
    <main className="mx-auto w-[min(640px,calc(100%-32px))] py-16">
      <p className="text-[10px] font-extrabold tracking-[0.16em] text-forest">CONTACT</p>
      <h1 className="font-display mt-2 text-4xl">Contact GharRent</h1>
      <p className="mt-2 text-sm text-muted">
        Use this form for product questions or to tell us about a problem with the website. To report a specific
        listing, open that listing and choose Report this listing.
      </p>
      <form
        className="mt-8 grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          void sendContactMessage({
            data: { name, email, subject, message, userId: user?.id },
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

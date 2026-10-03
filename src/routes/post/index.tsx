import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SignInPanel } from "@/components/auth/sign-in-panel";
import { useAuthGate } from "@/components/auth/use-auth-gate";
import { PropertyWizard } from "@/components/listing/property-wizard";
import { WhatsAppPostForMe } from "@/components/listing/whatsapp-post-for-me";
import { addListingImage, createDraft, saveDraft, submitListing } from "@/lib/server/listings";
import {
  blankLocalListing,
  clearLocalDraft,
  hasMeaningfulDraft,
  loadLocalFields,
  loadLocalPhotos,
} from "@/lib/local-draft";
import type { OwnerListing } from "@/lib/types";

import { privateSeo } from "@/lib/seo";

export const Route = createFileRoute("/post/")({
  head: () => privateSeo({ title: "Post a property free — Apna Ghar" }),
  component: PostStart,
});

type Phase = "idle" | "importing" | "error";

/** Move a draft saved on this device into the signed-in account, then publish it if the visitor pressed Publish. */
async function importLocalDraft(): Promise<{ id: string; published: boolean; error?: string } | null> {
  const fields = loadLocalFields();
  if (!hasMeaningfulDraft(fields) || !fields) return null;
  const photos = await loadLocalPhotos();
  const draft = await createDraft();
  const { publishRequested, savedAt: _savedAt, ...rest } = fields;
  await saveDraft({ data: { id: draft.id, ...rest } });
  const ordered = [...photos].sort((a, b) => Number(b.isCover) - Number(a.isCover));
  for (const photo of ordered) {
    const result = await addListingImage({
      data: { propertyId: draft.id, dataBase64: photo.dataUrl, width: photo.width, height: photo.height },
    });
    if (!result.ok) break;
  }
  await clearLocalDraft();
  if (!publishRequested) return { id: draft.id, published: false };
  const submitted = await submitListing({ data: { id: draft.id } });
  return submitted.ok
    ? { id: draft.id, published: true }
    : { id: draft.id, published: false, error: submitted.error };
}

function PostStart() {
  const { user, isPending } = useAuthGate();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("idle");
  const [localInitial, setLocalInitial] = useState<OwnerListing | null>(null);
  const [askSignIn, setAskSignIn] = useState(false);
  const started = useRef(false);

  // Logged out: restore whatever was saved on this device.
  useEffect(() => {
    if (isPending || user || localInitial) return;
    const fields = loadLocalFields();
    const base = { ...blankLocalListing(), ...(fields ?? {}) } as OwnerListing;
    void loadLocalPhotos().then((photos) => {
      const images = photos.map((p, i) => ({
        id: p.id,
        url: p.dataUrl,
        sortOrder: i,
        isCover: p.isCover,
        width: p.width,
        height: p.height,
      }));
      setLocalInitial({ ...base, images, coverImage: images.find((i) => i.isCover) ?? null });
    });
  }, [isPending, user, localInitial]);

  // Signed in: bring over a device draft (and publish it if requested), else start a fresh draft.
  useEffect(() => {
    if (isPending || !user || started.current) return;
    started.current = true;
    setPhase("importing");
    void (async () => {
      try {
        const imported = await importLocalDraft();
        if (imported?.published) {
          toast.success("Your property is now live.");
          await navigate({ to: "/account/listings", replace: true });
          return;
        }
        if (imported) {
          if (imported.error) toast.error(imported.error, { duration: 15000 });
          await navigate({ to: "/post/$id", params: { id: imported.id }, replace: true });
          return;
        }
        const draft = await createDraft();
        await navigate({ to: "/post/$id", params: { id: draft.id }, replace: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        if (/too many/i.test(message)) toast.error(message);
        setPhase("error");
      }
    })();
  }, [isPending, user, navigate]);

  if (user || isPending) {
    if (phase === "error") {
      return (
        <main className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="font-display text-2xl">Could not start a listing</h1>
          <p className="mt-2 text-sm text-muted">Please try again in a moment.</p>
          <WhatsAppPostForMe className="mt-6 text-left" />
        </main>
      );
    }
    return <div className="grid min-h-[50vh] place-items-center text-sm text-muted">Preparing your listing…</div>;
  }

  if (askSignIn) {
    return (
      <main className="grid min-h-[70vh] place-items-center gap-4 px-4 py-16">
        <SignInPanel
          title="Sign in to publish"
          message="Your property details and photos are saved on this device. Sign in or create a free account and your ad will go live straight away."
          callbackURL="/post"
        />
        <button
          type="button"
          className="text-sm font-semibold text-forest hover:underline"
          onClick={() => setAskSignIn(false)}
        >
          Back to my listing
        </button>
      </main>
    );
  }

  if (!localInitial) {
    return <div className="grid min-h-[50vh] place-items-center text-sm text-muted">Loading…</div>;
  }

  return (
    <main>
      <PropertyWizard initial={localInitial} local={{ onPublish: () => setAskSignIn(true) }} />
      <div className="mx-auto -mt-20 w-[min(760px,calc(100%-24px))] pb-28">
        <WhatsAppPostForMe />
      </div>
    </main>
  );
}

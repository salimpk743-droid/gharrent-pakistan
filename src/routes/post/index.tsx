import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SignInPanel } from "@/components/auth/sign-in-panel";
import { useAuthGate } from "@/components/auth/use-auth-gate";
import { PropertyWizard } from "@/components/listing/property-wizard";
import {
  blankLocalListing,
  loadLocalFields,
  loadLocalPhotos,
  loadPosterPrefs,
  type LocalPhoto,
} from "@/lib/local-draft";
import { applyPosterPrefs } from "@/lib/post-ad";
import type { OwnerListing } from "@/lib/types";

import { FORM_PAGE_FONT_PRELOADS } from "@/lib/form-page-head";
import { privateSeo } from "@/lib/seo";

export const Route = createFileRoute("/post/")({
  head: () => ({ ...privateSeo({ title: "Post a property free — Apna Ghar" }), links: FORM_PAGE_FONT_PRELOADS }),
  component: PostStart,
});

type Restored = { key: string; listing: OwnerListing; photos: LocalPhoto[]; publishRequested: boolean };

/**
 * Post an ad. The form renders straight away (also on the server), for guests and signed-in posters alike;
 * everything stays on this device until Publish. Guests sign in at Publish, then the ad publishes by itself.
 */
function PostStart() {
  const { user } = useAuthGate();
  const signedIn = Boolean(user);
  const [restored, setRestored] = useState<Restored | null>(null);
  const [askSignIn, setAskSignIn] = useState(false);
  const [publishAfterSignIn, setPublishAfterSignIn] = useState(false);

  // Bring back a form saved on this device, and pre-fill the poster's last city and phone.
  useEffect(() => {
    let cancelled = false;
    const fields = loadLocalFields();
    const prefs = loadPosterPrefs();
    void loadLocalPhotos().then((photos) => {
      if (cancelled) return;
      const hasPrefs = Boolean(prefs.districtId || prefs.contactPhone);
      if (!fields && !photos.length && !hasPrefs) return;
      const { publishRequested, savedAt: _savedAt, ...rest } = fields ?? {};
      const base = { ...blankLocalListing(), ...(prefs.listingPurpose ? { listingPurpose: prefs.listingPurpose } : {}), ...rest } as OwnerListing;
      setRestored({
        key: "restored",
        listing: applyPosterPrefs(base, prefs),
        photos,
        publishRequested: Boolean(publishRequested),
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (signedIn) setAskSignIn(false);
  }, [signedIn]);

  return (
    <main>
      <PropertyWizard
        key={restored?.key ?? "fresh"}
        initial={restored?.listing ?? blankLocalListing()}
        initialPhotos={restored?.photos}
        mode="new"
        signedIn={signedIn}
        onNeedSignIn={() => setAskSignIn(true)}
        autoPublish={Boolean(restored?.publishRequested) || publishAfterSignIn}
      />
      {askSignIn && !signedIn ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-ink/50 px-3 py-6 sm:grid sm:place-items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Sign in to publish"
        >
          <div className="mx-auto grid w-full max-w-md gap-3">
            <SignInPanel
              title="Sign in to publish"
              message="Your details and photos are saved on this device. Sign in or create a free account and your ad goes live straight away."
              callbackURL="/post"
              onSignedIn={() => {
                setAskSignIn(false);
                setPublishAfterSignIn(true);
              }}
            />
            <button
              type="button"
              className="min-h-12 rounded-md bg-white text-base font-semibold text-forest shadow"
              onClick={() => setAskSignIn(false)}
            >
              Back to my ad
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

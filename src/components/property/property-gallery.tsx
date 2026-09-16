import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PropertyImage } from "@/lib/types";

export function PropertyGallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const [index, setIndex] = useState(0);
  if (!images.length) {
    return <div className="flex h-64 items-center justify-center rounded-xl bg-sand text-sm text-muted">No photos yet</div>;
  }
  const current = images[Math.min(index, images.length - 1)];
  return (
    <div>
      <div className="relative overflow-hidden rounded-xl bg-sand">
        <img
          src={current.url}
          alt={`${title} photo ${index + 1} of ${images.length}`}
          className="h-[280px] w-full object-cover sm:h-[420px]"
          loading="eager"
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink"
              aria-label="Previous photo"
              onClick={() => setIndex((i) => (i + images.length - 1) % images.length)}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink"
              aria-label="Next photo"
              onClick={() => setIndex((i) => (i + 1) % images.length)}
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`size-16 shrink-0 overflow-hidden rounded-md border ${i === index ? "border-forest" : "border-line"}`}
              aria-label={`Show photo ${i + 1}`}
            >
              <img src={img.url} alt="" className="size-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

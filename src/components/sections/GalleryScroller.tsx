"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

type Image = { id: string; src: string };

export function GalleryScroller({ images }: { images: Image[] }) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(dir: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.8, 640);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  return (
    <div className="group relative mt-10">
      {/* Left arrow */}
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scroll(-1)}
        className="absolute start-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-ink/80 p-2.5 text-cream shadow-lg backdrop-blur-sm transition hover:bg-ink sm:flex"
      >
        <ChevronLeft className="size-5 rtl:rotate-180" />
      </button>

      <div
        ref={ref}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:px-8"
      >
        {images.map((image) => (
          <Link
            key={image.id}
            href="/gallery"
            className="relative aspect-[3/4] w-64 flex-none snap-start overflow-hidden rounded-2xl ring-1 ring-ink/10 sm:w-72"
          >
            <div
              className="h-full w-full bg-cover bg-center transition-transform duration-500 hover:scale-105"
              style={{ backgroundImage: `url('${image.src}')` }}
            />
          </Link>
        ))}
        <div className="w-1 flex-none" aria-hidden />
      </div>

      {/* Right arrow */}
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scroll(1)}
        className="absolute end-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-ink/80 p-2.5 text-cream shadow-lg backdrop-blur-sm transition hover:bg-ink sm:flex"
      >
        <ChevronRight className="size-5 rtl:rotate-180" />
      </button>
    </div>
  );
}
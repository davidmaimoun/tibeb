"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A faded background image with a light parallax drift on scroll.
 * Respects prefers-reduced-motion (stays still). Swap `src` for the guide's
 * photos; tune `opacity` and `strength` (max px drift) per section.
 */
export function ParallaxBg({
  src,
  opacity = 0.07,
  strength = 60,
  className,
}: {
  src: string;
  opacity?: number;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // Where the element's center sits relative to the viewport center (-1..1).
      const center = rect.top + rect.height / 2;
      const progress = (center - vh / 2) / vh;
      setOffset(progress * strength);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div
        className="absolute inset-x-0 -inset-y-[18%] bg-cover bg-center will-change-transform"
        style={{
          backgroundImage: `url('${src}')`,
          opacity,
          transform: `translate3d(0, ${offset}px, 0)`,
        }}
      />
    </div>
  );
}

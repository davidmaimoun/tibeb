import { cn } from "@/lib/utils";
import { Container } from "./Container";
import { ParallaxBg } from "./ParallaxBg";

/**
 * A page section with consistent vertical rhythm.
 * Pass `bgImage` to lay a very faded photo behind the content — swap the URLs
 * for the guide's own photos. Add `parallax` for a light scroll drift.
 */
export function Section({
  id,
  children,
  className,
  containerClassName,
  bgImage,
  parallax = false,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  bgImage?: string;
  parallax?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-24 overflow-hidden py-20 sm:py-28",
        className,
      )}
    >
      {bgImage ? (
        parallax ? (
          <ParallaxBg src={bgImage} opacity={0.06} />
        ) : (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.05]"
            style={{ backgroundImage: `url('${bgImage}')` }}
          />
        )
      ) : null}
      <Container className={cn("relative", containerClassName)}>
        {children}
      </Container>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  className,
  light = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  light?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? (
        <p className={cn("eyebrow mb-3", light && "text-accent")}>{eyebrow}</p>
      ) : null}
      <h2
        className={cn(
          "display text-3xl sm:text-4xl md:text-5xl",
          light ? "text-cream" : "text-ink",
        )}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            "mt-4 text-base sm:text-lg leading-relaxed",
            light ? "text-cream/80" : "text-ink-soft/80",
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
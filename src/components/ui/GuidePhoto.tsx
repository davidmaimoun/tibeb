import { useId } from "react";

type Shape = "blob" | "drop" | "paw" | "pebble";

const PATHS: Record<Exclude<Shape, "paw">, string> = {
  blob: "M70 6 C104 6 132 30 132 66 C132 104 116 150 78 170 C46 186 14 158 8 116 C2 78 18 34 48 16 C55 11 62 6 70 6 Z",
  drop: "M70 6 C104 56 128 86 128 116 A58 58 0 1 1 12 116 C12 86 36 56 70 6 Z",
  pebble:
    "M40 14 C92 6 132 30 130 78 C128 126 104 174 60 170 C20 166 6 130 8 92 C10 54 8 20 40 14 Z",
};

// Masque la photo du guide dans une forme organique (blob, goutte, patte, galet).
// Change simplement `shape` pour varier. L'ombre suit le contour (drop-shadow).
export function GuidePhoto({
  src,
  alt,
  shape = "blob",
  className,
}: {
  src: string;
  alt: string;
  shape?: Shape;
  className?: string;
}) {
  const uid = useId();
  const clip = `gp-${uid.replace(/[:]/g, "")}`;

  return (
    <svg
      viewBox="0 0 140 180"
      className={className}
      role="img"
      aria-label={alt}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id={clip}>
          {shape === "paw" ? (
            <>
              <ellipse cx="70" cy="128" rx="52" ry="42" />
              <ellipse cx="34" cy="76" rx="15" ry="19" />
              <ellipse cx="56" cy="52" rx="14" ry="18" />
              <ellipse cx="88" cy="52" rx="14" ry="18" />
              <ellipse cx="110" cy="76" rx="15" ry="19" />
            </>
          ) : (
            <path d={PATHS[shape]} />
          )}
        </clipPath>
      </defs>
      <image
        href={src}
        x="0"
        y="0"
        width="140"
        height="180"
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clip})`}
      />
    </svg>
  );
}
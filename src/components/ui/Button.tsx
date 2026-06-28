import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "gold" | "green";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed select-none";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-cream hover:bg-primary-deep",
  secondary: "bg-ink text-cream hover:bg-ink-soft",
  gold: "bg-accent text-ink hover:bg-accent-soft",
  green: "bg-secondary text-cream hover:bg-secondary-deep",
  ghost: "bg-transparent text-ink hover:bg-ink/5 ring-1 ring-ink/15",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-4 py-2",
  md: "text-base px-5 py-2.5",
  lg: "text-base sm:text-lg px-7 py-3.5",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: CommonProps & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

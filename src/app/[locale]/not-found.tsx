import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5 text-center">
      <span className="geez-mark text-6xl opacity-40" aria-hidden>
        ጥበብ
      </span>
      <h1 className="display text-3xl text-ink">404</h1>
      <Link
        href="/"
        className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream hover:bg-ink-soft"
      >
        ← Home
      </Link>
    </div>
  );
}

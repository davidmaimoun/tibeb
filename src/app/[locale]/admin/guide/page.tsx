import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { GuideBoard, type GuideOrder } from "@/components/admin/GuideBoard";
import { requireAdmin } from "@/lib/auth-guard";
import { listGuideOrders } from "@/features/booking/actions";

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin(locale);

  const t = await getTranslations("admin");
  const raw = await listGuideOrders();

  const orders: GuideOrder[] = raw.map((o) => ({
    id: o.id,
    startDate: o.startDate.toISOString(),
    numPeople: o.numPeople,
    tourType: o.tourType,
    status: o.status,
    progress: o.progress,
    timeline: (o.timeline ?? []).map((e) => ({
      label: e.label,
      at: e.at.toISOString(),
      kind: e.kind,
    })),
  }));

  return (
    <div>
      <header className="border-b border-ink/10 bg-cream/80 backdrop-blur">
        <Container className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <span className="display text-xl font-bold text-ink">
              Tibeb <span className="text-secondary">ጥበብ</span>
            </span>
            <span className="text-xs text-ink-soft/50">Guide</span>
          </div>
          <Link
            href="/admin"
            className="rounded-full px-4 py-2 text-sm text-ink/80 hover:bg-ink/5"
          >
            ← {t("nav.dashboard")}
          </Link>
        </Container>
      </header>

      <main className="py-10">
        <Container className="max-w-3xl">
          <h1 className="display mb-1 text-2xl text-ink">Your orders</h1>
          <p className="mb-6 text-sm text-ink-soft/70">
            Trips assigned to you — update the progress as you go.
          </p>
          <GuideBoard orders={orders} />
        </Container>
      </main>
    </div>
  );
}
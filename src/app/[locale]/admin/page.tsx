import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { type OrderRow } from "@/components/admin/OrdersPanel";
import { requireAdmin } from "@/lib/auth-guard";
import { getCalendar } from "@/features/availability/actions";
import { listBookings } from "@/features/booking/actions";
import { isoDay } from "@/lib/utils";
import { logoutAction } from "./actions";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin(locale);

  const t = await getTranslations("admin");

  const [calendar, bookings] = await Promise.all([
    getCalendar(),
    listBookings(),
  ]);

  const days = calendar.map((d) => ({
    date: isoDay(d.date),
    status: d.status as "AVAILABLE" | "UNAVAILABLE" | "BOOKED",
  }));

  const orders: OrderRow[] = bookings.map((b) => ({
    id: b.id,
    startDate: b.startDate.toISOString(),
    clientName: b.clientName,
    clientEmail: b.clientEmail,
    clientPhone: b.clientPhone,
    numPeople: b.numPeople,
    tourType: b.tourType,
    message: b.message,
    status: b.status,
    assignedToGuide: b.assignedToGuide,
    progress: b.progress,
    paymentLink: b.paymentLink,
    createdAt: b.createdAt.toISOString(),
  }));

  return (
    <div>
      <AdminHeader locale={locale} t={t} />
      <main className="py-10">
        <Container>
          <AdminTabs orders={orders} days={days} />
        </Container>
      </main>
    </div>
  );
}

function AdminHeader({
  locale,
  t,
}: {
  locale: string;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  return (
    <header className="border-b border-ink/10 bg-cream/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <span className="display text-xl font-bold text-ink">
            Tibeb <span className="text-secondary">ጥበብ</span>
          </span>
          <span className="hidden text-xs text-ink-soft/50 sm:inline">
            powered by{" "}
            <a href="https://sudosu.dev" className="font-semibold text-secondary">
              sudosu.dev
            </a>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/guide"
            className="rounded-full px-4 py-2 text-sm text-ink/80 hover:bg-ink/5"
          >
            Guide view
          </Link>
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-sm text-ink/80 hover:bg-ink/5"
          >
            {t("nav.site")}
          </Link>
          <form action={logoutAction.bind(null, locale)}>
            <button
              type="submit"
              className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream hover:bg-ink-soft"
            >
              {t("nav.logout")}
            </button>
          </form>
        </div>
      </Container>
    </header>
  );
}
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { AvailabilityManager } from "@/components/admin/AvailabilityManager";
import {
  BookingsTable,
  type BookingRow,
} from "@/components/admin/BookingsTable";
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
  const tBookings = await getTranslations("admin.bookings");

  const [calendar, bookings] = await Promise.all([
    getCalendar(),
    listBookings(),
  ]);

  // Serialize to plain props for the client components.
  const days = calendar.map((d) => ({
    date: isoDay(d.date),
    status: d.status as "AVAILABLE" | "UNAVAILABLE" | "BOOKED",
  }));

  const rows: BookingRow[] = bookings.map((b) => ({
    id: b.id,
    startDate: b.startDate.toISOString(),
    clientName: b.clientName,
    clientEmail: b.clientEmail,
    clientPhone: b.clientPhone,
    numPeople: b.numPeople,
    tourType: b.tourType,
    message: b.message,
    status: b.status,
  }));

  return (
    <div>
      <header className="border-b border-ink/10 bg-cream/80 backdrop-blur">
        <Container className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <span className="display text-xl font-bold text-ink">Tibeb</span>
            <span className="text-sm text-ink-soft/60">
              {t("nav.dashboard")}
            </span>
          </div>
          <div className="flex items-center gap-2">
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

      <main className="py-10">
        <Container className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <AvailabilityManager initial={days} />
          <div>
            <h2 className="display mb-4 text-xl text-ink">
              {tBookings("title")}
            </h2>
            <BookingsTable rows={rows} />
          </div>
        </Container>
      </main>
    </div>
  );
}

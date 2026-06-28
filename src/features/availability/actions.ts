"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { toUtcDay } from "@/lib/utils";
import { setAvailabilitySchema, type DayStatusValue } from "./schema";
import { DayStatus } from "@prisma/client";

/** PUBLIC — available days from today forward, for the booking calendar. */
export async function getAvailableDays(): Promise<string[]> {
  const today = toUtcDay(new Date());
  const days = await prisma.availability.findMany({
    where: { status: DayStatus.AVAILABLE, date: { gte: today } },
    orderBy: { date: "asc" },
    select: { date: true },
  });
  return days.map((d) => d.date.toISOString().slice(0, 10));
}

/** ADMIN — full calendar state for a month (or all upcoming). */
export async function getCalendar(from?: Date, to?: Date) {
  const session = await auth();
  if (!session?.user) return [];
  return prisma.availability.findMany({
    where:
      from && to
        ? { date: { gte: toUtcDay(from), lte: toUtcDay(to) } }
        : undefined,
    orderBy: { date: "asc" },
  });
}

/** ADMIN — set/upsert a single day's status. */
export async function setAvailability(raw: unknown) {
  const session = await auth();
  if (!session?.user) return { ok: false as const, error: "unauthorized" };

  const parsed = setAvailabilitySchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "invalid_input" };

  const date = toUtcDay(new Date(parsed.data.date));
  await prisma.availability.upsert({
    where: { date },
    update: { status: parsed.data.status as DayStatus, note: parsed.data.note },
    create: {
      date,
      status: parsed.data.status as DayStatus,
      note: parsed.data.note,
    },
  });

  revalidatePath("/[locale]/admin", "page");
  revalidatePath("/[locale]", "page");
  return { ok: true as const };
}

/** ADMIN — cycle a day AVAILABLE → UNAVAILABLE → (clear) on tap. */
export async function cycleAvailability(dateIso: string) {
  const session = await auth();
  if (!session?.user) return { ok: false as const, error: "unauthorized" };

  const date = toUtcDay(new Date(dateIso));
  const existing = await prisma.availability.findUnique({ where: { date } });

  const next: Record<string, DayStatusValue | "DELETE"> = {
    NONE: "AVAILABLE",
    AVAILABLE: "UNAVAILABLE",
    UNAVAILABLE: "DELETE",
  };
  // BOOKED days are managed via bookings, not by tapping.
  if (existing?.status === DayStatus.BOOKED) {
    return { ok: false as const, error: "day_booked" };
  }

  const action = next[existing?.status ?? "NONE"];
  if (action === "DELETE") {
    await prisma.availability.delete({ where: { date } });
  } else {
    await prisma.availability.upsert({
      where: { date },
      update: { status: action as DayStatus },
      create: { date, status: action as DayStatus },
    });
  }

  revalidatePath("/[locale]/admin", "page");
  revalidatePath("/[locale]", "page");
  return { ok: true as const };
}

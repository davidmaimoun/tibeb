"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { toUtcDay } from "@/lib/utils";
import {
  bookingInputSchema,
  bookingStatusSchema,
  type ActionResult,
} from "./schema";
import { DayStatus } from "@prisma/client";

/**
 * PUBLIC — a client submits a booking request.
 * Always creates a PENDING booking. No payment in the manual flow; the guide
 * confirms availability and follows up. (To automate later: after a successful
 * payment webhook, call setBookingStatus(id, "CONFIRMED").)
 */
export async function createBooking(
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = bookingInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  const input = parsed.data;
  const startDate = toUtcDay(new Date(input.startDate));
  const endDate = input.endDate ? toUtcDay(new Date(input.endDate)) : null;

  // Reject past dates.
  const today = toUtcDay(new Date());
  if (startDate < today) {
    return { ok: false, error: "day_unavailable" };
  }

  // Manual request flow: any future day can be REQUESTED. Only block days the
  // guide explicitly marked UNAVAILABLE or that are already BOOKED. A day with
  // no record yet is fine — the guide confirms availability afterwards.
  const day = await prisma.availability.findUnique({ where: { date: startDate } });
  if (day && day.status !== DayStatus.AVAILABLE) {
    return { ok: false, error: "day_unavailable" };
  }

  const booking = await prisma.booking.create({
    data: {
      startDate,
      endDate,
      clientName: input.clientName,
      clientEmail: input.clientEmail,
      clientPhone: input.clientPhone || null,
      numPeople: input.numPeople,
      tourType: input.tourType || null,
      message: input.message || null,
      locale: input.locale,
      status: "PENDING",
    },
  });

  // TODO(notify): send the guide an email/WhatsApp here.
  revalidatePath("/[locale]/admin", "page");
  return { ok: true, data: { id: booking.id } };
}

/** ADMIN — change a booking status. Optionally flips the day's availability. */
export async function setBookingStatus(
  id: string,
  status: unknown,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "unauthorized" };

  const parsed = bookingStatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "invalid_status" };

  const booking = await prisma.booking.update({
    where: { id },
    data: { status: parsed.data },
  });

  // Keep the calendar in sync: confirming books the day, declining frees it.
  if (parsed.data === "CONFIRMED") {
    await prisma.availability.updateMany({
      where: { date: booking.startDate },
      data: { status: DayStatus.BOOKED },
    });
  } else if (parsed.data === "DECLINED" || parsed.data === "CANCELLED") {
    await prisma.availability.updateMany({
      where: { date: booking.startDate, status: DayStatus.BOOKED },
      data: { status: DayStatus.AVAILABLE },
    });
  }

  revalidatePath("/[locale]/admin", "page");
  return { ok: true };
}

/** ADMIN — list bookings, newest first. */
export async function listBookings() {
  const session = await auth();
  if (!session?.user) return [];
  return prisma.booking.findMany({ orderBy: { createdAt: "desc" } });
}

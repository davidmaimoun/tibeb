"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { toUtcDay } from "@/lib/utils";
import { sendNewBookingEmail, sendEmail } from "@/lib/mail";
import {
  confirmAvailableEmail,
  proposeDatesEmail,
} from "@/lib/email-templates";
import { getTrip } from "@/features/content/trip";
import {
  bookingInputSchema,
  bookingStatusSchema,
  type ActionResult,
} from "./schema";

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

  // Calendar is free: any future day can be requested (the guide may run several
  // groups on the same date). Availability is no longer used to block requests.

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

  // Notify the owner by email (best-effort — never blocks the saved booking).
  await sendNewBookingEmail({
    clientName: booking.clientName,
    clientEmail: booking.clientEmail,
    clientPhone: booking.clientPhone,
    numPeople: booking.numPeople,
    tourType: booking.tourType,
    message: booking.message,
    startDate: booking.startDate,
    locale: booking.locale,
  });

  revalidatePath("/[locale]/admin", "page");
  return { ok: true, data: { id: booking.id } };
}

/**
 * Form-friendly wrapper for useActionState. Reads the FormData posted by the
 * booking form, creates the PENDING booking, emails you, and returns a small
 * status object the UI can render.
 */
export type BookingFormState = {
  status: "idle" | "success" | "error";
  error?: string;
};

export async function requestBooking(
  _prev: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const input = {
    startDate: String(formData.get("startDate") ?? ""),
    clientName: String(formData.get("clientName") ?? ""),
    clientEmail: String(formData.get("clientEmail") ?? ""),
    clientPhone: String(formData.get("clientPhone") ?? ""),
    numPeople: formData.get("numPeople") ?? 1,
    tourType: String(formData.get("tourType") ?? "general"),
    message: String(formData.get("message") ?? ""),
    locale: String(formData.get("locale") ?? "en"),
  };

  const res = await createBooking(input);
  if (!res.ok) {
    return {
      status: "error",
      error: res.error === "day_unavailable" ? "errorDay" : "errorGeneric",
    };
  }
  return { status: "success" };
}

/** ADMIN — change a booking status. */
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
    data: {
      status: parsed.data,
      timeline: {
        push: { label: `Status → ${parsed.data}`, at: new Date(), kind: "status" },
      },
    },
  });

  revalidatePath("/[locale]/admin", "page");
  return { ok: true };
}

/** ADMIN — list bookings, newest first. */
export async function listBookings() {
  const session = await auth();
  if (!session?.user) return [];
  return prisma.booking.findMany({ orderBy: { createdAt: "desc" } });
}

/** ADMIN (owner) — assign / unassign a booking to the guide. */
export async function assignToGuide(
  id: string,
  value: boolean,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "unauthorized" };
  await prisma.booking.update({
    where: { id },
    data: {
      assignedToGuide: value,
      timeline: {
        push: {
          label: value ? "Assigned to guide" : "Unassigned from guide",
          at: new Date(),
          kind: "note",
        },
      },
    },
  });
  revalidatePath("/[locale]/admin", "page");
  revalidatePath("/[locale]/admin/guide", "page");
  return { ok: true };
}

const PROGRESS = ["PENDING", "IN_PROCESS", "DONE"] as const;

/** Guide/owner — advance the work progress (drives the guide timeline). */
export async function setProgress(
  id: string,
  progress: string,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "unauthorized" };
  if (!PROGRESS.includes(progress as (typeof PROGRESS)[number])) {
    return { ok: false, error: "invalid_progress" };
  }
  await prisma.booking.update({
    where: { id },
    data: {
      progress,
      timeline: {
        push: { label: `Progress → ${progress}`, at: new Date(), kind: "progress" },
      },
    },
  });
  revalidatePath("/[locale]/admin", "page");
  revalidatePath("/[locale]/admin/guide", "page");
  return { ok: true };
}

/** ADMIN (owner) — send a client email: confirm (with deposit link) or propose dates. */
export async function sendClientEmail(input: {
  bookingId: string;
  kind: "confirm" | "propose";
  tripCode?: string;
  paymentLink?: string;
  alternativeDates?: string;
  note?: string;
}): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "unauthorized" };

  const b = await prisma.booking.findUnique({ where: { id: input.bookingId } });
  if (!b) return { ok: false, error: "not_found" };

  const trip = getTrip(input.tripCode);
  const dateStr = b.startDate.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let subject: string;
  let html: string;
  if (input.kind === "confirm") {
    ({ subject, html } = confirmAvailableEmail({
      clientName: b.clientName,
      numPeople: b.numPeople,
      dateStr,
      paymentLink: input.paymentLink || "",
      trip,
    }));
  } else {
    ({ subject, html } = proposeDatesEmail({
      clientName: b.clientName,
      dateStr,
      alternativeDates: input.alternativeDates || "",
      note: input.note,
      trip,
    }));
  }

  const res = await sendEmail({ to: b.clientEmail, subject, html });
  if (!res.ok) return { ok: false, error: res.error ?? "send_failed" };

  await prisma.booking.update({
    where: { id: b.id },
    data: {
      ...(input.kind === "confirm" && input.paymentLink
        ? { paymentLink: input.paymentLink }
        : {}),
      timeline: {
        push: {
          label:
            input.kind === "confirm"
              ? "Confirmation email sent"
              : "Alternative-dates email sent",
          at: new Date(),
          kind: "email",
        },
      },
    },
  });

  revalidatePath("/[locale]/admin", "page");
  return { ok: true };
}

/** GUIDE — assigned orders only, WITHOUT client contact details. */
export async function listGuideOrders() {
  const session = await auth();
  if (!session?.user) return [];
  const rows = await prisma.booking.findMany({
    where: { assignedToGuide: true },
    orderBy: { startDate: "asc" },
  });
  // Strip anything that could let the guide contact the client directly.
  return rows.map((b) => ({
    id: b.id,
    startDate: b.startDate,
    numPeople: b.numPeople,
    tourType: b.tourType,
    status: b.status,
    progress: b.progress,
    timeline: b.timeline,
  }));
}
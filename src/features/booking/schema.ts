import { z } from "zod";

export const bookingInputSchema = z.object({
  startDate: z.string().min(1), // ISO day, e.g. "2026-07-01"
  endDate: z.string().optional(),
  clientName: z.string().min(2).max(120),
  clientEmail: z.string().email(),
  clientPhone: z.string().max(40).optional().or(z.literal("")),
  numPeople: z.coerce.number().int().min(2).max(80).default(2),
  tourType: z.string().max(60).optional(),
  message: z.string().max(2000).optional(),
  locale: z.string().min(2).max(5).default("en"),
});

export type BookingInput = z.infer<typeof bookingInputSchema>;

export const bookingStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "DECLINED",
  "CANCELLED",
  "COMPLETED",
]);

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };
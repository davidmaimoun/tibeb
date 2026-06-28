import { z } from "zod";

export const dayStatusSchema = z.enum(["AVAILABLE", "BOOKED", "UNAVAILABLE"]);
export type DayStatusValue = z.infer<typeof dayStatusSchema>;

export const setAvailabilitySchema = z.object({
  date: z.string().min(1), // ISO day
  status: dayStatusSchema,
  note: z.string().max(200).optional(),
});

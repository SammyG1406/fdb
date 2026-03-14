import { z } from "zod";

export const baseEventSchema = z.object({
  eventId: z.string().uuid(),
  eventType: z.string(),
  version: z.number().int().positive(),
  occurredAt: z.string().datetime(),
  source: z.string().min(1)
});
import { z } from "zod";
import { baseEventSchema } from "./baseEvent.Schema.js";

const payloadSchema = z.object({
  mealId: z.string().min(1),
  userId: z.string().min(1),
  deletedAt: z.string().datetime()
});

export const mealDeletedEventSchema = baseEventSchema.extend({
  eventType: z.literal("MealDeleted"),
  payload: payloadSchema
});
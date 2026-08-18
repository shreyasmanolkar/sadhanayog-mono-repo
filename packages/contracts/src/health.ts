import { z } from "zod";

export const liveHealthResponseSchema = z
  .object({
    status: z.literal("ok"),
  })
  .strict();

export const readyHealthResponseSchema = z
  .object({
    status: z.enum(["ok", "degraded"]),
    checks: z
      .object({
        config: z.boolean(),
        d1: z.boolean().optional(),
      })
      .strict(),
  })
  .strict();

export type LiveHealthResponse = z.infer<typeof liveHealthResponseSchema>;
export type ReadyHealthResponse = z.infer<typeof readyHealthResponseSchema>;

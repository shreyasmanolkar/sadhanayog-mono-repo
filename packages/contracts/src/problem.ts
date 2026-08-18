import { z } from "zod";

export const problemDetailsSchema = z.object({
  type: z.string().url().or(z.literal("about:blank")),
  title: z.string().min(1),
  status: z.number().int().min(400).max(599),
  detail: z.string().optional(),
  instance: z.string().optional(),
  code: z.string().min(1),
  requestId: z.string().min(1),
  errors: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
        code: z.string().optional(),
      }),
    )
    .optional(),
});

export type ProblemDetails = z.infer<typeof problemDetailsSchema>;

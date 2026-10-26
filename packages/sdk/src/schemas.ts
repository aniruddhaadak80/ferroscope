import { z } from "zod";

export const profileSchema = z.object({
  stack: z.array(z.string().min(1).max(80)).max(200),
  region: z.string().length(2),
  bank: z.boolean(),
  passwordManager: z.boolean(),
  twoFactor: z.boolean(),
  autoUpdates: z.boolean(),
});

export const exposureRequestSchema = z.object({
  profile: profileSchema,
});

export const cascadeRequestSchema = z.object({
  profile: profileSchema,
  incidentSlug: z.string().min(1).max(120),
  ticks: z.number().int().min(6).max(24).optional(),
});

export const plannerRequestSchema = z.object({
  profile: profileSchema,
  completed: z.array(z.string().min(1).max(120)).max(100).default([]),
});

export const incidentSlugSchema = z.string().min(1).max(120);

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type ExposureRequest = z.infer<typeof exposureRequestSchema>;
export type CascadeRequest = z.infer<typeof cascadeRequestSchema>;
export type PlannerRequest = z.infer<typeof plannerRequestSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;

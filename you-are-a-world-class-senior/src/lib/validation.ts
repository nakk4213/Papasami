import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  remember: z.boolean().optional()
});

export const designRequestSchema = z.object({
  serviceId: z.string().min(1),
  projectName: z.string().min(3).max(140),
  requirements: z.string().min(10).max(5000),
  deadline: z.string().refine((value) => new Date(value).getTime() > Date.now(), "Deadline must be in the future"),
  references: z.string().max(2000).optional()
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(4),
  message: z.string().min(10).max(3000)
});

export const newsletterSchema = z.object({
  email: z.string().email()
});

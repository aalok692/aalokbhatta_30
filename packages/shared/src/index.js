import { z } from "zod";

const safeUrl = z.string().url().refine((value) => /^https?:\/\//i.test(value), "Use an HTTP or HTTPS URL.");
const optionalUrl = z.union([z.literal(""), safeUrl]);

export const projectSchema = z.object({
  title: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  summary: z.string().trim().min(1).max(300),
  description: z.string().trim().max(12000).default(""),
  imageUrl: z.union([
    z.literal(""),
    safeUrl,
    z.string().regex(/^\/uploads\/[\da-f-]+\.webp$/)
  ]).default(""),
  technologies: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  githubUrl: optionalUrl.default(""),
  liveUrl: optionalUrl.default(""),
  category: z.string().trim().max(60).default(""),
  featured: z.boolean().default(false),
  published: z.boolean().default(false)
});

export const postSchema = z.object({
  title: z.string().trim().min(1).max(180),
  slug: z.string().trim().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z.string().trim().max(400).default(""),
  body: z.string().trim().min(1).max(30000),
  category: z.string().trim().max(80).default(""),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  published: z.boolean().default(false)
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(0).optional()
});

export const settingsSchema = z.object({
  introduction: z.string().trim().max(1000),
  availability: z.enum(["available", "not-looking", "limited"]),
  resumeUrl: optionalUrl.default(""),
  about: z.object({
    background: z.string().trim().max(4000).default(""),
    journey: z.string().trim().max(4000).default(""),
    education: z.string().trim().max(2000).default(""),
    experience: z.string().trim().max(4000).default(""),
    goals: z.string().trim().max(4000).default("")
  }).default({}),
  socialLinks: z.object({
    github: optionalUrl,
    linkedin: optionalUrl,
    email: z.string().trim().email().or(z.literal(""))
  })
});

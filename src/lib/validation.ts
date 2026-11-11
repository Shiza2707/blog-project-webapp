import { z } from "zod";
import { SLUG_PATTERN } from "./slug";

export const PASSWORD_MIN = 8;

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address")
  .max(255, "Email must be under 255 characters");

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
  .max(72, "Password must be under 72 characters")
  .regex(/[A-Za-z]/, "Password must include a letter")
  .regex(/[0-9]/, "Password must include a number");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
    email: emailSchema,
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match", path: ["confirm"] });

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  bio: z.string().trim().max(500, "Bio must be under 500 characters"),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60, "Name must be under 60 characters"),
  slug: z.string().trim().regex(SLUG_PATTERN, "Use lowercase letters, numbers and dashes").max(80),
  description: z.string().trim().max(300, "Description must be under 300 characters"),
});

export const postSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(160, "Title is too long"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(180, "Slug is too long")
    .regex(SLUG_PATTERN, "Use lowercase letters, numbers and dashes"),
  excerpt: z.string().trim().max(400, "Excerpt must be under 400 characters"),
  content: z.string().max(100000, "Content is too long"),
  category_id: z.string().uuid().nullable(),
  tags: z.array(z.string().trim().min(1).max(40)).max(12, "Use at most 12 tags"),
  featured_image: z.string().max(2000).nullable(),
  is_featured: z.boolean(),
  meta_title: z.string().trim().max(70, "Meta title must be under 70 characters"),
  meta_description: z.string().trim().max(170, "Meta description must be under 170 characters"),
  status: z.enum(["draft", "published"]),
});

export const newsletterSchema = z.object({ email: emailSchema });

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/** Returns an error message when the file is not an allowed image, otherwise null. */
export function validateImageFile(file: { type: string; size: number }): string | null {
  if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return "Use a JPG, PNG, WebP or GIF image";
  }
  if (file.size > IMAGE_MAX_BYTES) return "Image must be 5 MB or smaller";
  return null;
}

/** First error message from a zod result, keyed by field. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

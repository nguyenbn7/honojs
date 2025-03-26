import { z } from "zod";

export const postIdSchema = z.object({
  id: z.coerce.number(),
});

export const createPostSchema = z.object({
  title: z.string().trim().min(1, "required"),
  content: z.string(),
  published: z.boolean().default(false),
});

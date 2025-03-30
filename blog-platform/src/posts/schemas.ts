import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().trim().min(1),
  content: z.string().min(1),
  published: z.boolean().default(false),
});

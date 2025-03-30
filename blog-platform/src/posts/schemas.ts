import { z } from "zod";
import { numberSchema } from "../lib/schemas";

export const postSchema = z.object({
  title: z.string().trim().min(1),
  content: z.string().min(1),
  published: z.boolean().default(false),
});

export const idSchema = z.object({
  id: numberSchema,
});

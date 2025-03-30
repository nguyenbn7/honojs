import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "required"),
  description: z.string().optional(),
});

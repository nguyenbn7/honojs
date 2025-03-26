import { Hono } from "hono";
import db from "../db";
import { zValidator } from "@hono/zod-validator";
import { categoryIdSchema, createCategorySchema } from "./schemas";

const app = new Hono()
  .get("/", async (c) => {
    const categories = await db
      .selectFrom("category as c")
      .selectAll()
      .execute();

    return c.json({ data: categories });
  })
  .get("/:id", zValidator("param", categoryIdSchema), async (c) => {
    const { id } = c.req.valid("param");

    const category = await db
      .selectFrom("category as c")
      .where("c.id", "=", id)
      .selectAll()
      .executeTakeFirst();

    if (!category) return c.json({ message: "Not found" }, 404);

    return c.json({ data: category });
  })
  .post("/", zValidator("json", createCategorySchema), async (c) => {
    const { name, description } = c.req.valid("json");

    const newCategory = await db
      .insertInto("category")
      .values({
        name,
        description: description ?? null,
      })
      .returningAll()
      .executeTakeFirst();

    if (!newCategory) return c.json({ error: "Cannot create category" }, 400);

    return c.json({ data: newCategory });
  });

export default app;

import { Hono } from "hono";
import db from "../db";
import { zValidator } from "@hono/zod-validator";
import { createPostSchema, postIdSchema } from "./schemas";
import kebabCase from "lodash/kebabCase";

const app = new Hono()
  .get("/", async (c) => {
    const { slug } = c.req.query();

    if (!slug) {
      const posts = await db
        .selectFrom("post as p")
        .select([
          "p.id",
          "p.title",
          "p.slug",
          "p.created_at as createdAt",
          "p.updated_at as updatedAt",
          "p.published",
          "p.content",
        ])
        .execute();

      return c.json({ data: posts });
    }

    const post = await db
      .selectFrom("post as p")
      .where("p.slug", "=", kebabCase(slug))
      .select([
        "p.id",
        "p.title",
        "p.slug",
        "p.created_at as createdAt",
        "p.updated_at as updatedAt",
        "p.published",
        "p.content",
      ])
      .execute();

    return c.json({ data: post });
  })
  .get("/:id", zValidator("param", postIdSchema), async (c) => {
    const { id } = c.req.valid("param");

    const post = await db
      .selectFrom("post as p")
      .where("p.id", "=", id)
      .select([
        "p.id",
        "p.title",
        "p.slug",
        "p.created_at as createdAt",
        "p.updated_at as updatedAt",
        "p.published",
        "p.content",
      ])
      .executeTakeFirst();

    if (!post) return c.json({ message: "Not found" }, 404);

    return c.json({ data: post });
  })
  .post("/", zValidator("json", createPostSchema), async (c) => {
    const { title, content, published } = c.req.valid("json");

    const newPost = await db
      .insertInto("post")
      .values({
        title,
        content,
        published: published ?? false,
        slug: kebabCase(title),
      })
      .returning([
        "id",
        "title",
        "slug",
        "created_at as createdAt",
        "updated_at as updatedAt",
        "published",
        "content",
      ])
      .executeTakeFirst();

    if (!newPost) return c.json({ error: "Cannot create post" }, 400);

    return c.json({ data: newPost });
  });

export default app;

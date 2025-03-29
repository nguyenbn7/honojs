import { Hono } from "hono";
import db from "../db";
import { zValidator } from "@hono/zod-validator";
import { createPostSchema, postIdSchema } from "./schemas";
import slugify from "slugify";
import { createPost, getPost, getPosts } from "./service";
import { STATUS_ERROR, STATUS_FAIL, STATUS_SUCCESS } from "../lib/constants";

const app = new Hono()
  .get("/", async (c) => {
    const { slug } = c.req.query();

    if (!slug) {
      const posts = await getPosts();

      return c.json({ status: STATUS_SUCCESS, data: { posts } });
    }

    const post = await db
      .selectFrom("post as p")
      .where("p.slug", "=", slugify(slug))
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

    return c.json({ status: STATUS_SUCCESS, data: post });
  })
  .get(
    "/:id",
    zValidator("param", postIdSchema, (result, c) => {
      if (!result.success)
        return c.json(
          {
            status: STATUS_FAIL,
            data: {
              message: "Invalid id",
            },
          },
          400
        );
    }),
    async (c) => {
      const { id } = c.req.valid("param");

      const post = await getPost(id);

      if (!post)
        return c.json(
          {
            status: STATUS_ERROR,
            error: { code: 404, message: "Post Not Found" },
            data: null,
          },
          404
        );

      return c.json({ data: post });
    }
  )
  .post(
    "/",
    zValidator("json", createPostSchema, (result, c) => {
      if (!result.success)
        return c.json(
          {
            status: STATUS_FAIL,
            data: {
              validation: result.error.errors.map((e) => ({
                code: e.code,
                message: e.message,
                location: e.path.join("."),
              })),
            },
          },
          400
        );
    }),
    async (c) => {
      const { title, content, published } = c.req.valid("json");

      const post = await createPost({ title, content, published });

      if (!post)
        return c.json(
          {
            status: STATUS_ERROR,
            error: {
              message: "Cannot create post",
            },
          },
          409
        );

      return c.json(
        {
          status: STATUS_SUCCESS,
          data: {
            post,
          },
        },
        201
      );
    }
  );

export default app;

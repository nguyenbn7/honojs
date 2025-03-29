import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { StatusCodes } from "http-status-codes";
import { ErrorCodes, Status } from "../lib/constants";
import { numberSchema } from "../lib/schemas";
import { createPostSchema } from "./schemas";
import { createPost, getPostById, getPostByTitle, getPosts } from "./service";

const app = new Hono()
  .get("/", async (c) => {
    const posts = await getPosts();

    return c.json({
      status: Status.SUCCESS,
      data: { posts },
    });
  })
  .get("/:slug", async (c) => {
    const { slug } = c.req.param();

    let post: AsyncReturnType<typeof getPostById> = undefined;

    const result = numberSchema.safeParse(slug);

    if (result.success) {
      const id = result.data;
      post = await getPostById(id);
    } else {
      post = await getPostByTitle(slug);
    }

    if (!post)
      return c.json(
        {
          status: Status.ERROR,
          error: {
            code: ErrorCodes.NOT_FOUND,
            message: "Post Not Found",
          },
        },
        StatusCodes.NOT_FOUND
      );

    return c.json({ data: post });
  })
  .post(
    "/",
    zValidator("json", createPostSchema, (result, c) => {
      if (!result.success)
        return c.json(
          {
            status: Status.FAIL,
            error: {
              code: ErrorCodes.VALIDATION_ERROR,
              errors: result.error.errors.map((e) => ({
                code: e.code,
                message: e.message,
                path: e.path.join("."),
              })),
            },
          },
          StatusCodes.BAD_REQUEST
        );
    }),
    async (c) => {
      const { title, content, published } = c.req.valid("json");

      const existsPost = await getPostByTitle(title);

      if (existsPost)
        return c.json(
          {
            status: Status.ERROR,
            error: {
              code: ErrorCodes.CONFLICT,
              message: "Post existed",
            },
          },
          StatusCodes.CONFLICT
        );

      const post = await createPost({ title, content, published });

      if (!post)
        return c.json(
          {
            status: Status.ERROR,
            error: {
              code: ErrorCodes.CONFLICT,
              message: "Cannot create post",
            },
          },
          StatusCodes.CONFLICT
        );

      return c.json({
        status: Status.SUCCESS,
        data: {
          post,
        },
      });
    }
  );

export default app;

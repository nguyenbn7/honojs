import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { StatusCodes } from "http-status-codes";
import { ErrorCodes, Status } from "../lib/constants";
import { numberSchema } from "../lib/schemas";
import { createCategorySchema } from "./schemas";
import {
  createCategory,
  getCategories,
  getCategoryById,
  getCategoryByName,
} from "./service";

const app = new Hono()
  .get("/", async (c) => {
    const categories = await getCategories();

    return c.json({
      status: Status.SUCCESS,
      data: { categories },
    });
  })
  .get("/:slug", async (c) => {
    const { slug } = c.req.param();

    let category: AsyncReturnType<typeof getCategoryById> = undefined;

    const result = numberSchema.safeParse(slug);

    if (result.success) {
      const id = result.data;
      category = await getCategoryById(id);
    } else {
      category = await getCategoryByName(slug);
    }

    if (!category)
      return c.json(
        {
          status: Status.ERROR,
          error: {
            code: ErrorCodes.NOT_FOUND,
            message: "Category Not Found",
          },
        },
        StatusCodes.NOT_FOUND
      );

    return c.json({
      status: Status.SUCCESS,
      data: { category },
    });
  })
  .post("/", zValidator("json", createCategorySchema), async (c) => {
    const { name, description } = c.req.valid("json");

    const existsCategory = await getCategoryByName(name);

    if (existsCategory)
      return c.json(
        {
          status: Status.ERROR,
          error: {
            code: ErrorCodes.CONFLICT,
            message: "Category existed",
          },
        },
        StatusCodes.CONFLICT
      );

    const category = await createCategory({
      name,
      description: description ?? null,
    });

    if (!category)
      return c.json(
        {
          status: Status.ERROR,
          error: {
            code: ErrorCodes.CONFLICT,
            message: "Cannot create category",
          },
        },
        StatusCodes.CONFLICT
      );

    return c.json({
      status: Status.SUCCESS,
      data: { category },
    });
  });

export default app;

import slugify from "slugify";
import db from "../db";
import { defaultSlugifyOptions, SlugifyOptions } from "../lib";

export async function getCategories() {
  return db.selectFrom("category as c").selectAll().execute();
}

export async function getCategoryById(id: number) {
  return db
    .selectFrom("category as c")
    .where("c.id", "=", id)
    .selectAll()
    .executeTakeFirst();
}

export async function getCategoryByName(
  slug: string,
  slugifyOptions: SlugifyOptions = defaultSlugifyOptions
) {
  return db
    .selectFrom("category as c")
    .where("c.slug", "=", slugify(slug, slugifyOptions))
    .selectAll()
    .executeTakeFirst();
}

type CreateCategory = {
  name: string;
  description: string | null;
};

export async function createCategory(
  data: CreateCategory,
  slugifyOptions: SlugifyOptions = defaultSlugifyOptions
) {
  try {
    const { name, description = null } = data;

    return await db
      .transaction()
      .setIsolationLevel("serializable")
      .execute(async (trx) => {
        return await trx
          .insertInto("category")
          .values({
            name,
            description,
            slug: slugify(name, slugifyOptions),
          })
          .returningAll()
          .executeTakeFirstOrThrow();
      });
  } catch (error) {
    console.log("Error at createCategory():", error);

    return;
  }
}

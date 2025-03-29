import db from "../db";
import slugify from "slugify";
import { defaultSlugifyOptions, type SlugifyOptions } from "../lib";

export async function getPosts() {
  return db
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
}

export async function getPostById(id: number) {
  return db
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
}

export async function getPostByTitle(
  slug: string,
  slugifyOptions: SlugifyOptions = defaultSlugifyOptions
) {
  return db
    .selectFrom("post as p")
    .where("p.slug", "=", slugify(slug, slugifyOptions))
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
}

type CreatePost = {
  title: string;
  content: string;
  published: boolean;
};

export async function createPost(
  data: CreatePost,
  slugifyOptions: SlugifyOptions = defaultSlugifyOptions
) {
  try {
    const { title, content, published = false } = data;

    return await db
      .transaction()
      .setIsolationLevel("serializable")
      .execute(async (trx) => {
        return await trx
          .insertInto("post")
          .values({
            title,
            content,
            published: published,
            slug: slugify(title, slugifyOptions),
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
          .executeTakeFirstOrThrow();
      });
  } catch (error) {
    console.log("Error at createPost():", error);

    return;
  }
}

import db from "../db";
import slugify from "slugify";

type SlugifyOptions = {
  replacement?: string;
  remove?: RegExp;
  lower?: boolean;
  strict?: boolean;
  locale?: string;
  trim?: boolean;
};

const defaultSlugifyOptions: SlugifyOptions = {
  lower: true,
  locale: "vi",
  trim: true,
};

export function hasPredicates() {}

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

export async function getPost(id: number) {
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

type CreatePost = {
  title: string;
  content: string;
  published: boolean;
};

export async function createPost(
  data: CreatePost,
  slugifyOptions: SlugifyOptions = defaultSlugifyOptions
) {
  const { title, content, published = false } = data;

  return db
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
    .executeTakeFirst();
}

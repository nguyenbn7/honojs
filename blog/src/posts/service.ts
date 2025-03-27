import db from "../db";

export function hasPredicates() {
    
}

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

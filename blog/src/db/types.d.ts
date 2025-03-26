import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Category = {
    id: Generated<number>;
    name: string;
    description: string | null;
};
export type Post = {
    id: Generated<number>;
    title: string;
    created_at: Generated<Timestamp>;
    updated_at: Generated<Timestamp>;
    published: Generated<boolean>;
    slug: string;
    content: string;
};
export type DB = {
    category: Category;
    post: Post;
};

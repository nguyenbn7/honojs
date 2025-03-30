import { Hono } from "hono";

import categories from "./categories/route";
import posts from "./posts/route";

const app = new Hono().route("/categories", categories).route("/posts", posts);

export default app;

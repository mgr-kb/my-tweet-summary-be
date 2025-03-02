import type { D1Database } from "@cloudflare/workers-types";
import { clerkMiddleware } from "@hono/clerk-auth";
import { Hono } from "hono";
import posts from "./routes/posts";
import summaries from "./routes/summaries";
import users from "./routes/users";

export type Bindings = {
  DB: D1Database;
  CLERK_SECRET_KEY: string;
  ENVIRONMENT: string;
};

// メインアプリケーション
const app = new Hono<{ Bindings: Bindings }>();

// Clerkミドルウェアを適用
app.use("*", clerkMiddleware());

// ルートパス
app.get("/", (c) => {
  return c.json({ status: "ok" });
});

// 各ルートを統合
app.route("/users", users);
app.route("/posts", posts);
app.route("/summaries", summaries);

export default app;

import type { D1Database } from "@cloudflare/workers-types";
import { clerkMiddleware } from "@hono/clerk-auth";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import posts from "./routes/posts";
import summaries from "./routes/summaries";
import users from "./routes/users";
import { AppError, createErrorFromHTTPException } from "./utils/errors";

export type Bindings = {
  DB: D1Database;
  CLERK_SECRET_KEY: string;
  ENVIRONMENT: string;
};

// メインアプリケーション
const app = new Hono<{ Bindings: Bindings }>();

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    const error = createErrorFromHTTPException(err);
    return c.json(
      {
        success: false,
        error: {
          message: error.message,
          status: error.statusCode,
          data: error.data,
        },
      },
      error.statusCode,
    );
  }

  if (err instanceof AppError) {
    return c.json(
      {
        success: false,
        error: {
          message: err.message,
          status: err.statusCode,
          data: err.data,
        },
      },
      err.statusCode,
    );
  }

  return c.json(
    {
      success: false,
      error: {
        message:
          c.env.ENVIRONMENT === "production"
            ? "Internal Server Error"
            : err.message,
        status: 500,
      },
    },
    500,
  );
});

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

import type { MiddlewareHandler } from "hono";
import { authUser } from "../libs/clerk-auth";

declare module "hono" {
  interface ContextVariableMap {
    userId: string;
  }
}

export const authUserMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const auth = authUser(c);
    if (!auth.isLogin || !auth.user?.id) {
      return c.json({ error: "認証が必要です" }, 401);
    }
    c.set("userId", auth.user.id);
    await next();
  };
};

import { getAuth } from "@hono/clerk-auth";
import type { Context } from "hono";

export const authUser = (c: Context) => {
  if (c.env.ENVIRONMENT === "local") {
    return {
      isLogin: true,
      user: {
        id: "user1",
      },
    };
  }

  const auth = getAuth(c);
  if (!auth?.userId) {
    return {
      isLogin: false,
      user: null,
    };
  }
  return {
    isLogin: true,
    user: {
      id: auth.userId,
    },
  };
};

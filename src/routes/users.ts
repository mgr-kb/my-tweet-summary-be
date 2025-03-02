import { Hono } from "hono";
import type { Bindings } from "../";
import { authUserMiddleware } from "../middleware/auth-user";
import { UserService } from "../services/user-service";

// ユーザールーター
const usersRouter = new Hono<{ Bindings: Bindings }>();

// 認証済みユーザーのみアクセス可能
usersRouter.use("*", authUserMiddleware());

// 現在のユーザー情報を取得
usersRouter.get("/me", async (c) => {
  const userId = c.get("userId");

  const userService = new UserService(c.env.DB);
  const user = await userService.getUserById(userId);

  if (!user) {
    return c.json({ error: "ユーザーが見つかりません" }, 404);
  }

  return c.json({
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
});

// ユーザー情報を更新
usersRouter.patch("/me", async (c) => {
  const userId = c.get("userId");

  const body = await c.req.json();
  const { name, avatarUrl } = body;

  const userService = new UserService(c.env.DB);
  const updatedUser = await userService.updateUser(userId, {
    name,
    avatarUrl,
  });

  if (!updatedUser) {
    return c.json({ error: "ユーザーの更新に失敗しました" }, 500);
  }

  return c.json({
    id: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name,
    avatarUrl: updatedUser.avatarUrl,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
  });
});

export default usersRouter;

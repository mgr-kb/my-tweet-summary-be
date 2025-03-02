import { Hono } from "hono";
import type { Bindings } from "../";
import { authUserMiddleware } from "../middleware/auth-user";
import { PostService } from "../services/post-service";

// 投稿ルーター
const postsRouter = new Hono<{ Bindings: Bindings }>();

// 認証済みユーザーのみアクセス可能
postsRouter.use("*", authUserMiddleware());

// 自分の投稿一覧を取得
postsRouter.get("/", async (c) => {
  const userId = c.get("userId");

  const postService = new PostService(c.env.DB);
  const posts = await postService.getPostsByUserId(userId);

  return c.json(posts);
});

// 投稿を取得
postsRouter.get("/:id", async (c) => {
  const userId = c.get("userId");

  const postId = Number.parseInt(c.req.param("id"), 10);
  if (Number.isNaN(postId)) {
    return c.json({ error: "無効な投稿IDです" }, 400);
  }

  const postService = new PostService(c.env.DB);
  const post = await postService.getPostById(postId);

  if (!post) {
    return c.json({ error: "投稿が見つかりません" }, 404);
  }

  // 自分の投稿のみ閲覧可能
  if (post.userId !== userId) {
    return c.json({ error: "この投稿を閲覧する権限がありません" }, 403);
  }

  return c.json(post);
});

// 投稿を作成
postsRouter.post("/", async (c) => {
  const userId = c.get("userId");

  const body = await c.req.json();
  const { content, imageUrl } = body;

  if (!content || content.trim() === "") {
    return c.json({ error: "投稿内容は必須です" }, 400);
  }

  const postService = new PostService(c.env.DB);
  const post = await postService.createPost({
    userId,
    content,
    imageUrl,
  });

  return c.json(post, 201);
});

// 投稿を更新
postsRouter.patch("/:id", async (c) => {
  const userId = c.get("userId");

  const postId = Number.parseInt(c.req.param("id"), 10);
  if (Number.isNaN(postId)) {
    return c.json({ error: "無効な投稿IDです" }, 400);
  }

  const body = await c.req.json();
  const { content, imageUrl } = body;

  const postService = new PostService(c.env.DB);

  try {
    const updatedPost = await postService.updatePost(postId, userId, {
      content,
      imageUrl,
    });

    if (!updatedPost) {
      return c.json({ error: "投稿が見つかりません" }, 404);
    }

    return c.json(updatedPost);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 403);
    }
    return c.json({ error: "投稿の更新に失敗しました" }, 500);
  }
});

// 投稿を削除
postsRouter.delete("/:id", async (c) => {
  const userId = c.get("userId");

  const postId = Number.parseInt(c.req.param("id"), 10);
  if (Number.isNaN(postId)) {
    return c.json({ error: "無効な投稿IDです" }, 400);
  }

  const postService = new PostService(c.env.DB);

  try {
    const result = await postService.deletePost(postId, userId);

    if (!result) {
      return c.json({ error: "投稿が見つかりません" }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 403);
    }
    return c.json({ error: "投稿の削除に失敗しました" }, 500);
  }
});

export default postsRouter;

import type { D1Database } from "@cloudflare/workers-types";
import type { CreatePostData, Post, UpdatePostData } from "../models/post";
import { BaseRepository } from "./base";

// TODO: drizzleを用いたDBアクセス

/**
 * 投稿リポジトリクラス
 */
export class PostRepository extends BaseRepository {
  // biome-ignore lint/complexity/noUselessConstructor: 親クラスのコンストラクタを呼び出すために必要
  constructor(db: D1Database) {
    super(db);
  }

  /**
   * 投稿をIDで取得
   */
  async findById(id: number): Promise<Post | null> {
    const row = await this.getOne<{
      id: number;
      user_id: string;
      content: string;
      image_url: string | null;
      created_at: string;
      updated_at: string;
    }>(
      "SELECT id, user_id, content, image_url, created_at, updated_at FROM posts WHERE id = ?",
      [id],
    );

    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      content: row.content,
      imageUrl: row.image_url || undefined,
      createdAt: this.sqliteToDate(row.created_at) || new Date(),
      updatedAt: this.sqliteToDate(row.updated_at) || new Date(),
    };
  }

  /**
   * ユーザーの投稿を全て取得
   */
  async findByUserId(userId: string): Promise<Post[]> {
    const rows = await this.getMany<{
      id: number;
      user_id: string;
      content: string;
      image_url: string | null;
      created_at: string;
      updated_at: string;
    }>(
      "SELECT id, user_id, content, image_url, created_at, updated_at FROM posts WHERE user_id = ? ORDER BY created_at DESC",
      [userId],
    );

    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      content: row.content,
      imageUrl: row.image_url || undefined,
      createdAt: this.sqliteToDate(row.created_at) || new Date(),
      updatedAt: this.sqliteToDate(row.updated_at) || new Date(),
    }));
  }

  /**
   * 特定期間のユーザー投稿を取得
   */
  async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Post[]> {
    const startDateStr = this.dateToSqlite(startDate);
    const endDateStr = this.dateToSqlite(endDate);

    const rows = await this.getMany<{
      id: number;
      user_id: string;
      content: string;
      image_url: string | null;
      created_at: string;
      updated_at: string;
    }>(
      "SELECT id, user_id, content, image_url, created_at, updated_at FROM posts WHERE user_id = ? AND created_at >= ? AND created_at <= ? ORDER BY created_at DESC",
      [userId, startDateStr, endDateStr],
    );

    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      content: row.content,
      imageUrl: row.image_url || undefined,
      createdAt: this.sqliteToDate(row.created_at) || new Date(),
      updatedAt: this.sqliteToDate(row.updated_at) || new Date(),
    }));
  }

  /**
   * 投稿を作成
   */
  async create(data: CreatePostData): Promise<Post> {
    const now = new Date();
    const nowStr = this.dateToSqlite(now);

    const result = await this.execute(
      "INSERT INTO posts (user_id, content, image_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
      [data.userId, data.content, data.imageUrl || null, nowStr, nowStr],
    );

    return {
      id: Number(result.meta.last_row_id),
      userId: data.userId,
      content: data.content,
      imageUrl: data.imageUrl,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * 投稿を更新
   */
  async update(id: number, data: UpdatePostData): Promise<Post | null> {
    const post = await this.findById(id);
    if (!post) return null;

    const now = new Date();
    const nowStr = this.dateToSqlite(now);

    const updates: string[] = [];
    const values: string[] = [];

    if (data.content !== undefined) {
      updates.push("content = ?");
      values.push(data.content);
    }

    if (data.imageUrl !== undefined) {
      updates.push("image_url = ?");
      values.push(data.imageUrl);
    }

    if (updates.length === 0) {
      return post;
    }

    updates.push("updated_at = ?");
    values.push(nowStr);
    values.push(id.toString());

    await this.execute(
      `UPDATE posts SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    return {
      ...post,
      ...data,
      updatedAt: now,
    };
  }

  /**
   * 投稿を削除
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.execute("DELETE FROM posts WHERE id = ?", [id]);
    return result.meta.changes > 0;
  }
}

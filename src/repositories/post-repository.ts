import type { D1Database } from "@cloudflare/workers-types";
import { and, eq, gte, lte } from "drizzle-orm";
import { convertPostDates } from "../db";
import { posts } from "../db/schema";
import type { Post } from "../db/schema";
import type { PostWithDates } from "../db/schema";
import type { CreatePostData, UpdatePostData } from "../models/post";
import { BaseRepository } from "./base";

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
    const result = await this.drizzle
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .get();

    if (!result) return null;

    return convertPostDates(result);
  }

  /**
   * ユーザーの投稿を全て取得
   */
  async findByUserId(userId: string): Promise<Post[]> {
    const results = await this.drizzle
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(posts.createdAt)
      .all();

    return results.map(convertPostDates);
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

    const results = await this.drizzle
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.userId, userId),
          gte(posts.createdAt, startDateStr),
          lte(posts.createdAt, endDateStr),
        ),
      )
      .orderBy(posts.createdAt)
      .all();

    return results.map(convertPostDates);
  }

  /**
   * 投稿を作成
   */
  async create(data: CreatePostData): Promise<Post> {
    const now = new Date();
    const nowStr = this.dateToSqlite(now);

    const insertData = {
      userId: data.userId,
      content: data.content,
      imageUrl: data.imageUrl || null,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    const result = await this.drizzle
      .insert(posts)
      .values(insertData)
      .returning()
      .get();

    return {
      ...result,
      createdAt: now,
      updatedAt: now,
    } as PostWithDates;
  }

  /**
   * 投稿を更新
   */
  async update(id: number, data: UpdatePostData): Promise<Post | null> {
    const post = await this.findById(id);
    if (!post) return null;

    const now = new Date();
    const nowStr = this.dateToSqlite(now);

    const updateData: Partial<typeof posts.$inferInsert> = {
      updatedAt: nowStr,
    };

    if (data.content !== undefined) {
      updateData.content = data.content;
    }

    if (data.imageUrl !== undefined) {
      updateData.imageUrl = data.imageUrl;
    }

    if (Object.keys(updateData).length <= 1) {
      return post;
    }

    const result = await this.drizzle
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, id))
      .returning()
      .get();

    return {
      ...result,
      updatedAt: now,
    } as PostWithDates;
  }

  /**
   * 投稿を削除
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.drizzle
      .delete(posts)
      .where(eq(posts.id, id))
      .run();

    return result.meta.changes > 0;
  }
}

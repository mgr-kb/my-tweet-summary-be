import type { D1Database } from "@cloudflare/workers-types";
import type { CreatePostData, Post, UpdatePostData } from "../models/post";
import { PostRepository } from "../repositories/post-repository";
import { AppError } from "../utils/errors";

/**
 * 投稿サービスクラス
 */
export class PostService {
  private repository: PostRepository;

  constructor(db: D1Database) {
    this.repository = new PostRepository(db);
  }

  /**
   * 投稿をIDで取得
   */
  async getPostById(id: number): Promise<Post | null> {
    return this.repository.findById(id);
  }

  /**
   * ユーザーの投稿を全て取得
   */
  async getPostsByUserId(userId: string): Promise<Post[]> {
    return this.repository.findByUserId(userId);
  }

  /**
   * 特定期間のユーザー投稿を取得
   */
  async getPostsByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Post[]> {
    return this.repository.findByUserIdAndDateRange(userId, startDate, endDate);
  }

  /**
   * 投稿を作成
   */
  async createPost(data: CreatePostData): Promise<Post> {
    return this.repository.create(data);
  }

  /**
   * 投稿を更新
   *
   * 投稿の所有者のみが更新可能です。
   */
  async updatePost(
    id: number,
    userId: string,
    data: UpdatePostData,
  ): Promise<Post | null> {
    const post = await this.repository.findById(id);

    if (!post) {
      return null;
    }

    // 投稿の所有者チェック
    if (post.userId !== userId) {
      throw new AppError("投稿の更新権限がありません", 403, {
        userId,
        postUserId: post.userId,
      });
    }

    return this.repository.update(id, data);
  }

  /**
   * 投稿を削除
   *
   * 投稿の所有者のみが削除可能です。
   */
  async deletePost(id: number, userId: string): Promise<boolean> {
    const post = await this.repository.findById(id);

    if (!post) {
      return false;
    }

    // 投稿の所有者チェック
    if (post.userId !== userId) {
      throw new AppError("投稿の更新権限がありません", 403, {
        userId,
        postUserId: post.userId,
      });
    }

    return this.repository.delete(id);
  }
}

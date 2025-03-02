import type { PostWithDates } from "../db/schema";

/**
 * 投稿モデル
 */
export type Post = PostWithDates;

/**
 * 投稿作成用のデータ型
 */
export interface CreatePostData {
  userId: string;
  content: string;
  imageUrl?: string | null;
}

/**
 * 投稿更新用のデータ型
 */
export interface UpdatePostData {
  content?: string;
  imageUrl?: string | null;
}

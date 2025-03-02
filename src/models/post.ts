/**
 * 投稿モデル
 */
export interface Post {
  id: number;
  userId: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 投稿作成用のデータ型
 */
export interface CreatePostData {
  userId: string;
  content: string;
  imageUrl?: string;
}

/**
 * 投稿更新用のデータ型
 */
export interface UpdatePostData {
  content?: string;
  imageUrl?: string;
}

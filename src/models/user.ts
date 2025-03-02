/**
 * ユーザーモデル
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ユーザー作成用のデータ型
 */
export interface CreateUserData {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

/**
 * ユーザー更新用のデータ型
 */
export interface UpdateUserData {
  name?: string;
  avatarUrl?: string;
}

import type { User as UserEntity } from "../db/schema";

/**
 * ユーザーモデル
 */
export type User = UserEntity;

/**
 * ユーザー作成用のデータ型
 */
export interface CreateUserData {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}

/**
 * ユーザー更新用のデータ型
 */
export interface UpdateUserData {
  name?: string;
  avatarUrl?: string | null;
}

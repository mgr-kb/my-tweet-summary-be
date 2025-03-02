import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
import type { Post, Summary, User } from "./schema";

/**
 * D1データベースからDrizzleインスタンスを作成
 *
 * @param db D1データベースインスタンス
 * @returns Drizzleインスタンス
 */
export function createDb(db: D1Database) {
  return drizzle(db, { schema });
}

/**
 * 日付型をSQLite用の文字列に変換
 */
export function dateToSqlite(date: Date): string {
  return date.toISOString();
}

/**
 * SQLite文字列を日付型に変換
 */
export function sqliteToDate(dateStr: string | null): Date | undefined {
  if (!dateStr) return undefined;
  return new Date(dateStr);
}

/**
 * ユーザーエンティティの日付文字列をDate型に変換
 */
export function convertUserDates(user: User): schema.UserWithDates {
  return {
    ...user,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  };
}

/**
 * 投稿エンティティの日付文字列をDate型に変換
 */
export function convertPostDates(post: Post): schema.PostWithDates {
  return {
    ...post,
    createdAt: new Date(post.createdAt),
    updatedAt: new Date(post.updatedAt),
  };
}

/**
 * 振り返りエンティティの日付文字列をDate型に変換
 */
export function convertSummaryDates(summary: Summary): schema.SummaryWithDates {
  return {
    ...summary,
    createdAt: new Date(summary.createdAt),
    startDate: new Date(summary.startDate),
    endDate: new Date(summary.endDate),
  };
}

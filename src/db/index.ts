import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

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

import type { D1Database } from "@cloudflare/workers-types";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { createDb, dateToSqlite, sqliteToDate } from "../db";
import type * as schema from "../db/schema";

/**
 * ベースリポジトリクラス
 *
 * 全てのリポジトリクラスの基底クラスとして使用します。
 */
export abstract class BaseRepository {
  protected db: D1Database;
  protected drizzle: DrizzleD1Database<typeof schema>;

  constructor(db: D1Database) {
    this.db = db;
    this.drizzle = createDb(db);
  }

  /**
   * 日付型をSQLite用の文字列に変換
   */
  protected dateToSqlite(date: Date): string {
    return dateToSqlite(date);
  }

  /**
   * SQLite文字列を日付型に変換
   */
  protected sqliteToDate(dateStr: string | null): Date | undefined {
    return sqliteToDate(dateStr);
  }
}

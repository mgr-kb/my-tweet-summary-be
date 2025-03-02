import type { D1Database } from "@cloudflare/workers-types";

/**
 * ベースリポジトリクラス
 *
 * 全てのリポジトリクラスの基底クラスとして使用します。
 */
export abstract class BaseRepository {
  protected db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * 日付型をSQLite用の文字列に変換
   */
  protected dateToSqlite(date: Date): string {
    return date.toISOString();
  }

  /**
   * SQLite文字列を日付型に変換
   */
  protected sqliteToDate(dateStr: string | null): Date | undefined {
    if (!dateStr) return undefined;
    return new Date(dateStr);
  }

  /**
   * SQLの実行結果からデータを取得
   */
  // TODO: params type
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  protected async getOne<T>(query: string, params?: any): Promise<T | null> {
    const result = await this.db
      .prepare(query)
      .bind(...(params || []))
      .first<T>();
    return result || null;
  }

  /**
   * SQLの実行結果から複数データを取得
   */
  // TODO: params type
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  protected async getMany<T>(query: string, params?: any): Promise<T[]> {
    const result = await this.db
      .prepare(query)
      .bind(...(params || []))
      .all<T>();
    return result.results;
  }

  /**
   * SQLの実行（INSERT/UPDATE/DELETE）
   */
  // TODO: params type
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  protected async execute(query: string, params?: any): Promise<D1Result> {
    return await this.db
      .prepare(query)
      .bind(...(params || []))
      .run();
  }
}

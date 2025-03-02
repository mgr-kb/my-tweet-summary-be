import type { D1Database } from "@cloudflare/workers-types";
import type {
  CreateSummaryData,
  Summary,
  SummaryType,
} from "../models/summary";
import { BaseRepository } from "./base";

// TODO: drizzleを用いたDBアクセス

/**
 * 振り返りリポジトリクラス
 */
export class SummaryRepository extends BaseRepository {
  // biome-ignore lint/complexity/noUselessConstructor: 親クラスのコンストラクタを呼び出すために必要
  constructor(db: D1Database) {
    super(db);
  }

  /**
   * 振り返りをIDで取得
   */
  async findById(id: number): Promise<Summary | null> {
    const row = await this.getOne<{
      id: number;
      user_id: string;
      content: string;
      type: SummaryType;
      start_date: string;
      end_date: string;
      created_at: string;
    }>(
      "SELECT id, user_id, content, type, start_date, end_date, created_at FROM summaries WHERE id = ?",
      [id],
    );

    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      content: row.content,
      type: row.type,
      startDate: this.sqliteToDate(row.start_date) || new Date(),
      endDate: this.sqliteToDate(row.end_date) || new Date(),
      createdAt: this.sqliteToDate(row.created_at) || new Date(),
    };
  }

  /**
   * ユーザーの振り返りを全て取得
   */
  async findByUserId(userId: string): Promise<Summary[]> {
    const rows = await this.getMany<{
      id: number;
      user_id: string;
      content: string;
      type: SummaryType;
      start_date: string;
      end_date: string;
      created_at: string;
    }>(
      "SELECT id, user_id, content, type, start_date, end_date, created_at FROM summaries WHERE user_id = ? ORDER BY created_at DESC",
      [userId],
    );

    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      content: row.content,
      type: row.type,
      startDate: this.sqliteToDate(row.start_date) || new Date(),
      endDate: this.sqliteToDate(row.end_date) || new Date(),
      createdAt: this.sqliteToDate(row.created_at) || new Date(),
    }));
  }

  /**
   * ユーザーの特定タイプの振り返りを取得
   */
  async findByUserIdAndType(
    userId: string,
    type: SummaryType,
  ): Promise<Summary[]> {
    const rows = await this.getMany<{
      id: number;
      user_id: string;
      content: string;
      type: SummaryType;
      start_date: string;
      end_date: string;
      created_at: string;
    }>(
      "SELECT id, user_id, content, type, start_date, end_date, created_at FROM summaries WHERE user_id = ? AND type = ? ORDER BY created_at DESC",
      [userId, type],
    );

    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      content: row.content,
      type: row.type,
      startDate: this.sqliteToDate(row.start_date) || new Date(),
      endDate: this.sqliteToDate(row.end_date) || new Date(),
      createdAt: this.sqliteToDate(row.created_at) || new Date(),
    }));
  }

  /**
   * 特定期間の振り返りを取得
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Summary[]> {
    const startDateStr = this.dateToSqlite(startDate);
    const endDateStr = this.dateToSqlite(endDate);

    const rows = await this.getMany<{
      id: number;
      user_id: string;
      content: string;
      type: SummaryType;
      start_date: string;
      end_date: string;
      created_at: string;
    }>(
      "SELECT id, user_id, content, type, start_date, end_date, created_at FROM summaries WHERE start_date >= ? AND end_date <= ? ORDER BY created_at DESC",
      [startDateStr, endDateStr],
    );

    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      content: row.content,
      type: row.type,
      startDate: this.sqliteToDate(row.start_date) || new Date(),
      endDate: this.sqliteToDate(row.end_date) || new Date(),
      createdAt: this.sqliteToDate(row.created_at) || new Date(),
    }));
  }

  /**
   * 振り返りを作成
   */
  async create(data: CreateSummaryData): Promise<Summary> {
    const now = new Date();
    const nowStr = this.dateToSqlite(now);
    const startDateStr = this.dateToSqlite(data.startDate);
    const endDateStr = this.dateToSqlite(data.endDate);

    const result = await this.execute(
      "INSERT INTO summaries (user_id, content, type, start_date, end_date, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [data.userId, data.content, data.type, startDateStr, endDateStr, nowStr],
    );

    return {
      id: Number(result.meta.last_row_id),
      userId: data.userId,
      content: data.content,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      createdAt: now,
    };
  }

  /**
   * 振り返りを削除
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.execute("DELETE FROM summaries WHERE id = ?", [
      id,
    ]);
    return result.meta.changes > 0;
  }
}

import type { D1Database } from "@cloudflare/workers-types";
import { and, eq, gte, lte } from "drizzle-orm";
import { convertSummaryDates } from "../db";
import type { SummaryType } from "../db/schema";
import { summaries } from "../db/schema";
import type { Summary } from "../db/schema";
import type { SummaryWithDates } from "../db/schema";
import type { CreateSummaryData } from "../models/summary";
import { BaseRepository } from "./base";

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
    const result = await this.drizzle
      .select()
      .from(summaries)
      .where(eq(summaries.id, id))
      .get();

    if (!result) return null;

    return convertSummaryDates(result);
  }

  /**
   * ユーザーの振り返りを全て取得
   */
  async findByUserId(userId: string): Promise<Summary[]> {
    const results = await this.drizzle
      .select()
      .from(summaries)
      .where(eq(summaries.userId, userId))
      .orderBy(summaries.createdAt)
      .all();

    return results.map(convertSummaryDates);
  }

  /**
   * ユーザーの特定タイプの振り返りを取得
   */
  async findByUserIdAndType(
    userId: string,
    type: SummaryType,
  ): Promise<Summary[]> {
    const results = await this.drizzle
      .select()
      .from(summaries)
      .where(and(eq(summaries.userId, userId), eq(summaries.type, type)))
      .orderBy(summaries.createdAt)
      .all();

    return results.map(convertSummaryDates);
  }

  /**
   * 特定期間の振り返りを取得
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Summary[]> {
    const startDateStr = this.dateToSqlite(startDate);
    const endDateStr = this.dateToSqlite(endDate);

    const results = await this.drizzle
      .select()
      .from(summaries)
      .where(
        and(
          gte(summaries.startDate, startDateStr),
          lte(summaries.endDate, endDateStr),
        ),
      )
      .orderBy(summaries.createdAt)
      .all();

    return results.map(convertSummaryDates);
  }

  /**
   * 振り返りを作成
   */
  async create(data: CreateSummaryData): Promise<Summary> {
    const now = new Date();
    const nowStr = this.dateToSqlite(now);
    const startDateStr = this.dateToSqlite(data.startDate);
    const endDateStr = this.dateToSqlite(data.endDate);

    const insertData = {
      userId: data.userId,
      content: data.content,
      type: data.type,
      startDate: startDateStr,
      endDate: endDateStr,
      createdAt: nowStr,
    };

    const result = await this.drizzle
      .insert(summaries)
      .values(insertData)
      .returning()
      .get();

    return {
      ...result,
      createdAt: now,
      startDate: data.startDate,
      endDate: data.endDate,
    } as SummaryWithDates;
  }

  /**
   * 振り返りを削除
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.drizzle
      .delete(summaries)
      .where(eq(summaries.id, id))
      .run();

    return result.meta.changes > 0;
  }
}

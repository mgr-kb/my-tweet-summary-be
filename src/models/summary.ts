import type { Summary as SummaryEntity, SummaryType } from "../db/schema";

/**
 * 振り返りモデル
 */
export type Summary = SummaryEntity;

/**
 * 振り返りの種類
 */
export type { SummaryType } from "../db/schema";

/**
 * 振り返り作成用のデータ型
 */
export interface CreateSummaryData {
  userId: string;
  content: string;
  type: SummaryType;
  startDate: Date;
  endDate: Date;
}

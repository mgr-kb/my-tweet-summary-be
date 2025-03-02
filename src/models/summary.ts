/**
 * 振り返りの種類
 */
export type SummaryType = "weekly" | "monthly";

/**
 * 振り返りモデル
 */
export interface Summary {
  id: number;
  userId: string;
  content: string;
  type: SummaryType;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

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

import type { D1Database } from "@cloudflare/workers-types";
import type {
  CreateSummaryData,
  Summary,
  SummaryType,
} from "../models/summary";
import { PostRepository } from "../repositories/post-repository";
import { SummaryRepository } from "../repositories/summary-repository";

/**
 * 振り返りサービスクラス
 */
export class SummaryService {
  private summaryRepository: SummaryRepository;
  private postRepository: PostRepository;

  constructor(db: D1Database) {
    this.summaryRepository = new SummaryRepository(db);
    this.postRepository = new PostRepository(db);
  }

  /**
   * 振り返りをIDで取得
   */
  async getSummaryById(id: number): Promise<Summary | null> {
    return this.summaryRepository.findById(id);
  }

  /**
   * ユーザーの振り返りを全て取得
   */
  async getSummariesByUserId(userId: string): Promise<Summary[]> {
    return this.summaryRepository.findByUserId(userId);
  }

  /**
   * ユーザーの特定タイプの振り返りを取得
   */
  async getSummariesByUserIdAndType(
    userId: string,
    type: SummaryType,
  ): Promise<Summary[]> {
    return this.summaryRepository.findByUserIdAndType(userId, type);
  }

  /**
   * 振り返りを作成
   */
  async createSummary(data: CreateSummaryData): Promise<Summary> {
    return this.summaryRepository.create(data);
  }

  /**
   * 週間振り返りを生成
   *
   * 指定されたユーザーの指定期間の投稿を取得し、
   * Gemini APIを使用して週間振り返りを生成します。
   */
  async generateWeeklySummary(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Summary | null> {
    // 期間内の投稿を取得
    const posts = await this.postRepository.findByUserIdAndDateRange(
      userId,
      startDate,
      endDate,
    );

    if (posts.length === 0) {
      // 投稿がない場合は振り返りを生成しない
      return null;
    }

    /**
     * TODO: Gemini APIを使用して振り返りを生成
     * プロンプト設計等はこれから。
     */
    // 現在はダミーの振り返りを生成
    const content = `
# 週間振り返り (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})

この週は合計${posts.length}件の投稿がありました。

## 主な活動
${posts
  .slice(0, 3)
  .map((post) => `- ${post.content.substring(0, 50)}...`)
  .join("\n")}

## 振り返り
この週は充実した活動ができました。引き続き頑張りましょう！
    `;

    // 振り返りを保存
    const summaryData: CreateSummaryData = {
      userId,
      content,
      type: "weekly",
      startDate,
      endDate,
    };

    return this.summaryRepository.create(summaryData);
  }

  /**
   * 月間振り返りを生成
   *
   * 指定されたユーザーの指定期間の投稿を取得し、
   * Gemini APIを使用して月間振り返りを生成します。
   */
  async generateMonthlySummary(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Summary | null> {
    // 期間内の投稿を取得
    const posts = await this.postRepository.findByUserIdAndDateRange(
      userId,
      startDate,
      endDate,
    );

    if (posts.length === 0) {
      // 投稿がない場合は振り返りを生成しない
      return null;
    }

    /**
     * TODO: Gemini APIを使用して振り返りを生成
     * プロンプト設計等はこれから。
     */
    // 現在はダミーの振り返りを生成
    const content = `
# 月間振り返り (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})

この月は合計${posts.length}件の投稿がありました。

## 主な活動
${posts
  .slice(0, 5)
  .map((post) => `- ${post.content.substring(0, 50)}...`)
  .join("\n")}

## 振り返り
この月は多くの成果を上げることができました。来月も引き続き頑張りましょう！
    `;

    // 振り返りを保存
    const summaryData: CreateSummaryData = {
      userId,
      content,
      type: "monthly",
      startDate,
      endDate,
    };

    return this.summaryRepository.create(summaryData);
  }

  /**
   * 振り返りを削除
   */
  async deleteSummary(id: number): Promise<boolean> {
    return this.summaryRepository.delete(id);
  }
}

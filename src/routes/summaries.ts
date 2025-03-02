import { Hono } from "hono";
import type { Bindings } from "../";
import { authUserMiddleware } from "../middleware/auth-user";
import type { SummaryType } from "../models/summary";
import { SummaryService } from "../services/summary-service";

// 振り返りルーター
const summariesRouter = new Hono<{ Bindings: Bindings }>();

// 認証済みユーザーのみアクセス可能
summariesRouter.use("*", authUserMiddleware());

// 自分の振り返り一覧を取得
summariesRouter.get("/", async (c) => {
  const userId = c.get("userId");

  const type = c.req.query("type") as SummaryType | undefined;

  const summaryService = new SummaryService(c.env.DB);

  if (type && (type === "weekly" || type === "monthly")) {
    const summaries = await summaryService.getSummariesByUserIdAndType(
      userId,
      type,
    );
    return c.json(summaries);
  }
  const summaries = await summaryService.getSummariesByUserId(userId);
  return c.json(summaries);
});

// 振り返りを取得
summariesRouter.get("/:id", async (c) => {
  const userId = c.get("userId");

  const summaryId = Number.parseInt(c.req.param("id"), 10);
  if (Number.isNaN(summaryId)) {
    return c.json({ error: "無効な振り返りIDです" }, 400);
  }

  const summaryService = new SummaryService(c.env.DB);
  const summary = await summaryService.getSummaryById(summaryId);

  if (!summary) {
    return c.json({ error: "振り返りが見つかりません" }, 404);
  }

  // 自分の振り返りのみ閲覧可能
  if (summary.userId !== userId) {
    return c.json({ error: "この振り返りを閲覧する権限がありません" }, 403);
  }

  return c.json(summary);
});

// 週間振り返りを生成
summariesRouter.post("/generate/weekly", async (c) => {
  const userId = c.get("userId");

  const body = await c.req.json();
  const { startDate: startDateStr, endDate: endDateStr } = body;

  if (!startDateStr || !endDateStr) {
    return c.json({ error: "開始日と終了日は必須です" }, 400);
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return c.json({ error: "無効な日付形式です" }, 400);
  }

  if (startDate >= endDate) {
    return c.json({ error: "開始日は終了日より前である必要があります" }, 400);
  }

  const summaryService = new SummaryService(c.env.DB);
  const summary = await summaryService.generateWeeklySummary(
    userId,
    startDate,
    endDate,
  );

  if (!summary) {
    return c.json(
      {
        error:
          "振り返りの生成に失敗しました。対象期間の投稿がない可能性があります。",
      },
      400,
    );
  }

  return c.json(summary, 201);
});

// 月間振り返りを生成
summariesRouter.post("/generate/monthly", async (c) => {
  const userId = c.get("userId");

  const body = await c.req.json();
  const { startDate: startDateStr, endDate: endDateStr } = body;

  if (!startDateStr || !endDateStr) {
    return c.json({ error: "開始日と終了日は必須です" }, 400);
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return c.json({ error: "無効な日付形式です" }, 400);
  }

  if (startDate >= endDate) {
    return c.json({ error: "開始日は終了日より前である必要があります" }, 400);
  }

  const summaryService = new SummaryService(c.env.DB);
  const summary = await summaryService.generateMonthlySummary(
    userId,
    startDate,
    endDate,
  );

  if (!summary) {
    return c.json(
      {
        error:
          "振り返りの生成に失敗しました。対象期間の投稿がない可能性があります。",
      },
      400,
    );
  }

  return c.json(summary, 201);
});

// 振り返りを削除
summariesRouter.delete("/:id", async (c) => {
  const userId = c.get("userId");

  const summaryId = Number.parseInt(c.req.param("id"), 10);
  if (Number.isNaN(summaryId)) {
    return c.json({ error: "無効な振り返りIDです" }, 400);
  }

  const summaryService = new SummaryService(c.env.DB);
  const summary = await summaryService.getSummaryById(summaryId);

  if (!summary) {
    return c.json({ error: "振り返りが見つかりません" }, 404);
  }

  // 自分の振り返りのみ削除可能
  if (summary.userId !== userId) {
    return c.json({ error: "この振り返りを削除する権限がありません" }, 403);
  }

  const result = await summaryService.deleteSummary(summaryId);

  if (!result) {
    return c.json({ error: "振り返りの削除に失敗しました" }, 500);
  }

  return c.json({ success: true });
});

export default summariesRouter;

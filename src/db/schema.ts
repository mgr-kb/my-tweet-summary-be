import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * ユーザーテーブルスキーマ
 */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});

/**
 * 投稿テーブルスキーマ
 */
export const posts = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    imageUrl: text("image_url"),
    createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
    updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
  },
  (table) => [
    index("idx_posts_user_id").on(table.userId),
    index("idx_posts_created_at").on(table.createdAt),
  ],
);

/**
 * 振り返りの種類
 */
export type SummaryType = "weekly" | "monthly";

/**
 * 振り返りテーブルスキーマ
 */
export const summaries = sqliteTable(
  "summaries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    type: text("type").$type<SummaryType>().notNull(),
    startDate: text("start_date").notNull(),
    endDate: text("end_date").notNull(),
    createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  },
  (table) => [
    index("idx_summaries_user_id").on(table.userId),
    index("idx_summaries_date_range").on(table.startDate, table.endDate),
    index("idx_summaries_type").on(table.type),
  ],
);

// 型定義のエクスポート
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type Summary = typeof summaries.$inferSelect;
export type NewSummary = typeof summaries.$inferInsert;

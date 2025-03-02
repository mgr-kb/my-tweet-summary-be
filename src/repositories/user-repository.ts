import type { D1Database } from "@cloudflare/workers-types";
import { eq } from "drizzle-orm";
import { convertUserDates } from "../db";
import { users } from "../db/schema";
import type { User } from "../db/schema";
import type { UserWithDates } from "../db/schema";
import type { CreateUserData, UpdateUserData } from "../models/user";
import { BaseRepository } from "./base";

/**
 * ユーザーリポジトリクラス
 */
export class UserRepository extends BaseRepository {
  // biome-ignore lint/complexity/noUselessConstructor: 親クラスのコンストラクタを呼び出すために必要
  constructor(db: D1Database) {
    super(db);
  }

  /**
   * ユーザーをIDで取得
   */
  async findById(id: string): Promise<User | null> {
    const result = await this.drizzle
      .select()
      .from(users)
      .where(eq(users.id, id))
      .get();

    if (!result) return null;

    return convertUserDates(result);
  }

  /**
   * ユーザーをメールアドレスで取得
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await this.drizzle
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (!result) return null;

    return convertUserDates(result);
  }

  /**
   * ユーザーを作成
   */
  async create(data: CreateUserData): Promise<User> {
    const now = new Date();
    const nowStr = this.dateToSqlite(now);

    const insertData = {
      id: data.id,
      email: data.email,
      name: data.name,
      avatarUrl: data.avatarUrl || null,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    await this.drizzle.insert(users).values(insertData).run();

    return {
      ...insertData,
      createdAt: now,
      updatedAt: now,
    } as UserWithDates;
  }

  /**
   * ユーザーを更新
   */
  async update(id: string, data: UpdateUserData): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;

    const now = new Date();
    const nowStr = this.dateToSqlite(now);

    const updateData: Partial<typeof users.$inferInsert> = {
      updatedAt: nowStr,
    };

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.avatarUrl !== undefined) {
      updateData.avatarUrl = data.avatarUrl;
    }

    if (Object.keys(updateData).length <= 1) {
      return user;
    }

    await this.drizzle
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .run();

    return {
      ...user,
      ...data,
      updatedAt: now,
    };
  }

  /**
   * ユーザーを削除
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.drizzle
      .delete(users)
      .where(eq(users.id, id))
      .run();

    return result.meta.changes > 0;
  }
}

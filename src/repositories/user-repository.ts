import type { D1Database } from "@cloudflare/workers-types";
import type { CreateUserData, UpdateUserData, User } from "../models/user";
import { BaseRepository } from "./base";

// TODO: drizzleを用いたDBアクセス

/**
 * ユーザーリポジトリクラス
 */
export class UserRepository extends BaseRepository {
  // NOTE: Biome警告があるが、親クラスのコンストラクタを呼び出すために必要
  // biome-ignore lint/complexity/noUselessConstructor: <explanation>
  constructor(db: D1Database) {
    super(db);
  }

  /**
   * ユーザーをIDで取得
   */
  async findById(id: string): Promise<User | null> {
    const row = await this.getOne<{
      id: string;
      email: string;
      name: string;
      avatar_url: string | null;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT id, email, name, avatar_url, created_at, updated_at
       FROM users
       WHERE id = ?`,
      [id],
    );

    if (!row) return null;

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      avatarUrl: row.avatar_url || undefined,
      createdAt: this.sqliteToDate(row.created_at) || new Date(),
      updatedAt: this.sqliteToDate(row.updated_at) || new Date(),
    };
  }

  /**
   * ユーザーをメールアドレスで取得
   */
  async findByEmail(email: string): Promise<User | null> {
    const row = await this.getOne<{
      id: string;
      email: string;
      name: string;
      avatar_url: string | null;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT id, email, name, avatar_url, created_at, updated_at 
       FROM users 
       WHERE email = ?`,
      [email],
    );

    if (!row) return null;

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      avatarUrl: row.avatar_url || undefined,
      createdAt: this.sqliteToDate(row.created_at) || new Date(),
      updatedAt: this.sqliteToDate(row.updated_at) || new Date(),
    };
  }

  /**
   * ユーザーを作成
   */
  async create(data: CreateUserData): Promise<User> {
    const now = new Date();
    const nowStr = this.dateToSqlite(now);

    await this.execute(
      `INSERT INTO users (id, email, name, avatar_url, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.id, data.email, data.name, data.avatarUrl || null, nowStr, nowStr],
    );

    return {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * ユーザーを更新
   */
  async update(id: string, data: UpdateUserData): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;

    const now = new Date();
    const nowStr = this.dateToSqlite(now);

    const updates: string[] = [];
    const values: string[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name);
    }

    if (data.avatarUrl !== undefined) {
      updates.push("avatar_url = ?");
      values.push(data.avatarUrl);
    }

    if (updates.length === 0) {
      return user;
    }

    updates.push("updated_at = ?");
    values.push(nowStr);
    values.push(id);

    await this.execute(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

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
    const result = await this.execute("DELETE FROM users WHERE id = ?", [id]);
    return result.meta.changes > 0;
  }
}

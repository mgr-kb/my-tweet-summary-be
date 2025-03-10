import type { D1Database } from "@cloudflare/workers-types";
import type { CreateUserData, UpdateUserData, User } from "../models/user";
import { UserRepository } from "../repositories/user-repository";
import { AppError } from "../utils/errors";

/**
 * ユーザーサービスクラス
 */
export class UserService {
  private repository: UserRepository;

  constructor(db: D1Database) {
    this.repository = new UserRepository(db);
  }

  /**
   * ユーザーをIDで取得
   */
  async getUserById(id: string): Promise<User | null> {
    return this.repository.findById(id);
  }

  /**
   * ユーザーをメールアドレスで取得
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return this.repository.findByEmail(email);
  }

  /**
   * ユーザーを作成または更新
   */
  async createOrUpdateUser(data: CreateUserData): Promise<User> {
    const existingUser = await this.repository.findById(data.id);

    if (existingUser) {
      const updateData: UpdateUserData = {
        name: data.name,
        avatarUrl: data.avatarUrl,
      };
      const updatedUser = await this.repository.update(data.id, updateData);
      if (!updatedUser) {
        throw new AppError("ユーザーの更新に失敗しました", 500);
      }
      return updatedUser;
    }

    return this.repository.create(data);
  }

  /**
   * ユーザーを更新
   */
  async updateUser(id: string, data: UpdateUserData): Promise<User | null> {
    return this.repository.update(id, data);
  }

  /**
   * ユーザーを削除
   */
  async deleteUser(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CreateUserData, UpdateUserData, User } from "../models/user";
import { UserRepository } from "../repositories/user-repository";
import { AppError } from "../utils/errors";
import { UserService } from "./user-service";

// モックリポジトリのインスタンスを作成
const mockFindById = vi.fn();
const mockFindByEmail = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

// UserRepositoryクラス全体をモック
vi.mock("../repositories/user-repository", () => {
  return {
    UserRepository: vi.fn().mockImplementation(() => {
      return {
        findById: mockFindById,
        findByEmail: mockFindByEmail,
        create: mockCreate,
        update: mockUpdate,
        delete: mockDelete,
      };
    }),
  };
});

describe("UserService", () => {
  let userService: UserService;
  let mockDb: unknown;

  // テストユーザーデータ
  const mockUser: User = {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    avatarUrl: "https://example.com/avatar.png",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    // テストごとにモックをリセット
    vi.clearAllMocks();

    // D1Databaseのモック
    mockDb = {};

    // UserServiceインスタンスを作成
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    userService = new UserService(mockDb as any);
  });

  describe("getUserById", () => {
    it("should return user when user exists", async () => {
      // モックの設定
      mockFindById.mockResolvedValue(mockUser);

      // メソッド実行
      const result = await userService.getUserById("user-123");

      // 検証
      expect(mockFindById).toHaveBeenCalledWith("user-123");
      expect(result).toEqual(mockUser);
    });

    it("should return null when user does not exist", async () => {
      // モックの設定
      mockFindById.mockResolvedValue(null);

      // メソッド実行
      const result = await userService.getUserById("non-existent-id");

      // 検証
      expect(mockFindById).toHaveBeenCalledWith("non-existent-id");
      expect(result).toBeNull();
    });
  });

  describe("getUserByEmail", () => {
    it("should return user when email exists", async () => {
      // モックの設定
      mockFindByEmail.mockResolvedValue(mockUser);

      // メソッド実行
      const result = await userService.getUserByEmail("test@example.com");

      // 検証
      expect(mockFindByEmail).toHaveBeenCalledWith("test@example.com");
      expect(result).toEqual(mockUser);
    });

    it("should return null when email does not exist", async () => {
      // モックの設定
      mockFindByEmail.mockResolvedValue(null);

      // メソッド実行
      const result = await userService.getUserByEmail(
        "nonexistent@example.com",
      );

      // 検証
      expect(mockFindByEmail).toHaveBeenCalledWith("nonexistent@example.com");
      expect(result).toBeNull();
    });
  });

  describe("createOrUpdateUser", () => {
    const createUserData: CreateUserData = {
      id: "user-123",
      email: "test@example.com",
      name: "Test User",
      avatarUrl: "https://example.com/avatar.png",
    };

    it("should create a new user when user does not exist", async () => {
      // モックの設定
      mockFindById.mockResolvedValue(null);
      mockCreate.mockResolvedValue(mockUser);

      // メソッド実行
      const result = await userService.createOrUpdateUser(createUserData);

      // 検証
      expect(mockFindById).toHaveBeenCalledWith("user-123");
      expect(mockCreate).toHaveBeenCalledWith(createUserData);
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it("should update the user when user exists", async () => {
      // モックの設定
      mockFindById.mockResolvedValue(mockUser);
      mockUpdate.mockResolvedValue({
        ...mockUser,
        name: "Updated Name",
        updatedAt: new Date().toISOString(),
      });

      // メソッド実行
      const result = await userService.createOrUpdateUser({
        ...createUserData,
        name: "Updated Name",
      });

      // 検証
      expect(mockFindById).toHaveBeenCalledWith("user-123");
      expect(mockUpdate).toHaveBeenCalledWith("user-123", {
        name: "Updated Name",
        avatarUrl: "https://example.com/avatar.png",
      });
      expect(mockCreate).not.toHaveBeenCalled();
      expect(result.name).toBe("Updated Name");
    });

    it("should throw AppError when update fails", async () => {
      // モックの設定
      mockFindById.mockResolvedValue(mockUser);
      mockUpdate.mockResolvedValue(null);

      // メソッド実行と例外検証
      await expect(
        userService.createOrUpdateUser(createUserData),
      ).rejects.toThrow(AppError);

      // 検証
      expect(mockFindById).toHaveBeenCalledWith("user-123");
      expect(mockUpdate).toHaveBeenCalledWith("user-123", {
        name: "Test User",
        avatarUrl: "https://example.com/avatar.png",
      });
    });
  });

  describe("updateUser", () => {
    const updateData: UpdateUserData = {
      name: "Updated Name",
      avatarUrl: "https://example.com/new-avatar.png",
    };

    it("should update and return user when successful", async () => {
      // モックの設定
      const updatedUser = {
        ...mockUser,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      mockUpdate.mockResolvedValue(updatedUser);

      // メソッド実行
      const result = await userService.updateUser("user-123", updateData);

      // 検証
      expect(mockUpdate).toHaveBeenCalledWith("user-123", updateData);
      expect(result).toEqual(updatedUser);
    });

    it("should return null when update fails", async () => {
      // モックの設定
      mockUpdate.mockResolvedValue(null);

      // メソッド実行
      const result = await userService.updateUser("user-123", updateData);

      // 検証
      expect(mockUpdate).toHaveBeenCalledWith("user-123", updateData);
      expect(result).toBeNull();
    });
  });

  describe("deleteUser", () => {
    it("should return true when deletion is successful", async () => {
      // モックの設定
      mockDelete.mockResolvedValue(true);

      // メソッド実行
      const result = await userService.deleteUser("user-123");

      // 検証
      expect(mockDelete).toHaveBeenCalledWith("user-123");
      expect(result).toBe(true);
    });

    it("should return false when deletion fails", async () => {
      // モックの設定
      mockDelete.mockResolvedValue(false);

      // メソッド実行
      const result = await userService.deleteUser("non-existent-id");

      // 検証
      expect(mockDelete).toHaveBeenCalledWith("non-existent-id");
      expect(result).toBe(false);
    });
  });
});

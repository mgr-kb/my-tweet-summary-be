# 技術コンテキスト

## 技術スタック詳細

### バックエンド基盤

| 技術               | バージョン | 用途                    |
| ------------------ | ---------- | ----------------------- |
| Node.js            | 最新 LTS   | ランタイム環境          |
| TypeScript         | 最新       | 型安全な開発言語        |
| Hono               | ^4.7.2     | 軽量 Web フレームワーク |
| Cloudflare Workers | 最新       | サーバーレス実行環境    |

### データベース

| 技術          | バージョン | 用途                             |
| ------------- | ---------- | -------------------------------- |
| Cloudflare D1 | 最新       | サーバーレス SQLite データベース |
| Drizzle ORM   | ^0.40.0    | TypeScript 対応 ORM              |
| Drizzle Kit   | ^0.30.5    | マイグレーション管理ツール       |

### 認証

| 技術             | バージョン | 用途                           |
| ---------------- | ---------- | ------------------------------ |
| Clerk            | ^1.24.3    | ユーザー認証・管理サービス     |
| @hono/clerk-auth | ^2.0.0     | Hono 用 Clerk 統合ミドルウェア |

### 開発ツール

| 技術     | バージョン | 用途                          |
| -------- | ---------- | ----------------------------- |
| Wrangler | ^3.109.2   | Cloudflare Workers 開発ツール |
| Vitest   | ^3.0.7     | テストフレームワーク          |
| Biome    | ^1.9.4     | リンター・フォーマッター      |
| Lefthook | ^1.11.2    | Git フック管理                |

## 開発環境セットアップ

### 前提条件

- Node.js (推奨: v18 以上)
- pnpm (v9.15.4 以上)

### 環境構築手順

1. リポジトリのクローン

```bash
git clone <repository-url>
cd my-tweet-summary-app/my-tweet-summary-be
```

2. 依存関係のインストール

```bash
pnpm install
```

3. 環境変数の設定

```
# .dev.vars ファイルを作成（バージョン管理対象外）
CLERK_SECRET_KEY=your_clerk_secret_key
ENVIRONMENT=development
```

4. ローカルデータベースのセットアップ

```bash
pnpm run generate        # マイグレーションファイル生成
pnpm run local:migration # ローカルDBにマイグレーション適用
pnpm run local:seed      # テストデータ投入
```

5. 開発サーバーの起動

```bash
pnpm run dev
```

## デプロイメントフロー

### 開発環境デプロイ

1. マイグレーションの適用

```bash
pnpm run remote:migration
```

2. アプリケーションのデプロイ

```bash
pnpm run deploy
```

### 本番環境デプロイ

1. 本番環境用の設定確認
2. マイグレーションの適用

```bash
pnpm run remote:migration
```

3. アプリケーションのデプロイ

```bash
pnpm run deploy
```

## 技術的制約

### Cloudflare Workers 制約

- **実行時間**: リクエストあたり最大 50ms（無料プラン）、CPU 時間制限あり
- **メモリ使用量**: 制限あり（詳細は Cloudflare のドキュメントを参照）
- **ストレージ**: D1 データベースの容量制限
- **コールドスタート**: 初回リクエスト時の遅延が発生する可能性

### D1 データベース制約

- **SQLite 互換**: SQLite の機能セットに制限
- **トランザクション**: 複雑なトランザクションに制限あり
- **同時接続数**: 制限あり

### Clerk 認証制約

- **カスタマイズ**: UI カスタマイズに一部制限
- **認証フロー**: 定義済みのフローに従う必要あり

## パフォーマンス最適化

### キャッシュ戦略

- **Cloudflare Cache**: 静的リソースのキャッシュ
- **ETags**: リソースの変更検出

### データベース最適化

- **インデックス**: 適切なインデックス設計
- **クエリ最適化**: 効率的なクエリ作成
- **接続プーリング**: 接続の再利用

## セキュリティ対策

### 認証・認可

- **JWT トークン**: Clerk による安全なトークン管理
- **RBAC**: ロールベースのアクセス制御
- **セッション管理**: 安全なセッション処理

### データ保護

- **入力検証**: すべてのユーザー入力の検証
- **SQL インジェクション対策**: パラメータ化クエリの使用
- **XSS 対策**: 適切なエスケープ処理

### API 保護

- **レート制限**: 過剰なリクエストの制限
- **CORS 設定**: 適切なオリジン制限
- **セキュリティヘッダー**: 適切な HTTP セキュリティヘッダーの設定

## テスト戦略

### テスト種別

- **単体テスト**: 個別関数・メソッドのテスト
- **統合テスト**: コンポーネント間の連携テスト
- **E2E テスト**: エンドツーエンドのユーザーフロー検証

### テスト環境

- **モック**: 外部依存のモック化
- **テストデータ**: 専用のテストデータセット
- **CI/CD**: 自動テスト実行環境

## モニタリングと分析

### ログ管理

- **Cloudflare Logs**: アクセスログとエラーログ
- **構造化ログ**: JSON 形式のログ出力

### パフォーマンスモニタリング

- **Cloudflare Analytics**: リクエスト統計
- **カスタムメトリクス**: 重要な業務指標の計測

### エラー追跡

- **集中型エラーハンドリング**: 一貫したエラー処理
- **エラーレポート**: 重大なエラーの通知システム

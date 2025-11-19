# 経済学仮説生成システム（Manus版）

## アプリケーション概要

**経済学仮説生成システム**は、AI技術を活用して、最新の経済動向と技術革新を反映した革新的で実現可能な経済学研究仮説を自動生成するシステムです。ユーザーが3つのキーワードを入力することで、Manus Built-in LLM APIを使用して高品質な仮説を生成し、詳細な分析コメントを提供します。

### 最終デプロイURL

**https://econhypgen-zwqvg72o.manus.space**

### ホーム画面

![Home Screen](./client/public/home-hero.jpg)

---

## 主な機能

### 1. **AI駆動の仮説生成**
- ユーザーが3つのキーワードを入力
- Manus LLM APIを使用した高品質な仮説自動生成
- 8つの経済学カテゴリ（金融政策、マクロ経済学、国際経済学など）に対応

### 2. **詳細な分析コメント**
- 各仮説に対するAI分析コメント自動生成
- マークダウン形式での美しい表示
- 見出し、リスト、強調などの書式対応

### 3. **仮説管理ダッシュボード**
- 生成済み仮説の一覧表示
- 平均信頼度、平均新規性スコア、実現可能性スコアの統計表示
- 仮説の詳細情報表示

### 4. **仮説詳細ページ**
- 仮説の詳細情報（説明、期待される影響）
- スコア表示（信頼度、新規性スコア、実現可能性スコア）
- 研究手法、重要要因、データソース、政策的含意の表示
- フィードバック・ディスカッション機能

### 5. **探索ページ**
- 生成済み仮説の検索・フィルタリング機能
- カテゴリ別の仮説閲覧

---

## 技術仕様

### フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| React | 19 | UIフレームワーク |
| TypeScript | 5.x | 型安全性 |
| Vite | 7.x | ビルドツール |
| Tailwind CSS | 4.x | スタイリング |
| shadcn/ui | 最新 | UIコンポーネント |
| tRPC | 11 | 型安全なAPI通信 |
| wouter | 最新 | ルーティング |
| react-markdown | 10.x | マークダウン表示 |

### バックエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Express | 4.x | Webサーバー |
| Node.js | 22.x | ランタイム |
| TypeScript | 5.x | 型安全性 |
| tRPC | 11 | RPC通信 |
| Drizzle ORM | 最新 | データベースORM |
| MySQL | 8.x | データベース |

### AI・API

| サービス | 用途 |
|---------|------|
| Manus Built-in LLM API | 仮説生成・分析コメント生成 |
| Manus OAuth | ユーザー認証 |

---

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React 19)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Pages: Home, Dashboard, HypothesisDetail, Explore    │   │
│  │ Components: shadcn/ui, Tailwind CSS                 │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ tRPC
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express 4)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ tRPC Routers:                                        │   │
│  │ - hypothesis.generate (キーワード入力)              │   │
│  │ - hypothesis.getDetail (詳細取得)                   │   │
│  │ - hypothesis.listAll (一覧取得)                     │   │
│  │ - feedback.create (フィードバック投稿)             │   │
│  │ - discussion.create (ディスカッション投稿)         │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   MySQL DB   │  │ Manus LLM    │  │ Manus OAuth  │
│ (Drizzle ORM)│  │ API          │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

### データベーススキーマ

```sql
-- ユーザーテーブル
users (id, name, email, loginMethod, role, createdAt, lastSignedIn)

-- 仮説テーブル
hypotheses (
  id, userId, title, category, description, 
  confidence, noveltyScore, feasibilityScore,
  expectedImpact, researchMethods, keyFactors,
  dataSourcesUsed, policyImplications, aiComment,
  keywords, createdAt, updatedAt
)

-- フィードバックテーブル
feedback (id, hypothesisId, userId, comment, createdAt)

-- ディスカッションテーブル
discussions (id, hypothesisId, userId, comment, createdAt)
```

---

## Manusサーバーへのデプロイ方法

### 前提条件

- Manusプラットフォームのアカウント
- Node.js 22.x以上
- pnpm パッケージマネージャー

### デプロイ手順

#### 1. リポジトリのクローン

```bash
git clone https://github.com/tomoto0/economics-hypothesis-generator.git
cd economics-hypothesis-generator
```

#### 2. 依存関係のインストール

```bash
pnpm install
```

#### 3. 環境変数の設定

`.env.example`を参考に、`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
# データベース
DATABASE_URL=mysql://user:password@host:port/database

# JWT
JWT_SECRET=your_jwt_secret_key

# Manus OAuth
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im

# Manus LLM API
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_api_key

# アプリケーション設定
VITE_APP_TITLE=経済学仮説生成システム
VITE_APP_LOGO=https://your-logo-url.png
```

#### 4. データベースマイグレーション

```bash
pnpm db:push
```

#### 5. ビルド

```bash
pnpm build
```

#### 6. Manusプラットフォームへのデプロイ

Manusプラットフォームの管理画面から：

1. 新しいプロジェクトを作成
2. このリポジトリを接続
3. 環境変数を設定
4. デプロイボタンをクリック

---

## ファイル構成

```
economics-hypothesis-generator-manus/
├── client/                          # フロントエンド
│   ├── public/                      # 静的ファイル
│   │   └── home-hero.jpg           # ホーム画面画像
│   └── src/
│       ├── pages/                  # ページコンポーネント
│       │   ├── Home.tsx            # ホームページ
│       │   ├── Dashboard.tsx       # ダッシュボード
│       │   ├── HypothesisDetail.tsx # 仮説詳細ページ
│       │   └── Explore.tsx         # 探索ページ
│       ├── components/             # 再利用可能なコンポーネント
│       │   └── KeywordDialog.tsx   # キーワード入力ダイアログ
│       ├── lib/
│       │   └── trpc.ts             # tRPCクライアント設定
│       ├── App.tsx                 # ルーティング
│       ├── main.tsx                # エントリーポイント
│       └── index.css               # グローバルスタイル
├── server/                          # バックエンド
│   ├── routers.ts                  # tRPCルーター定義
│   ├── db.ts                       # データベースクエリヘルパー
│   ├── storage.ts                  # S3ストレージヘルパー
│   └── _core/                      # コアインフラストラクチャ
│       ├── llm.ts                  # LLM API統合
│       ├── context.ts              # tRPCコンテキスト
│       └── ...
├── drizzle/                         # データベーススキーマ
│   ├── schema.ts                   # テーブル定義
│   └── migrations/                 # マイグレーションファイル
├── shared/                          # 共有コード
│   └── const.ts                    # 定数
├── package.json                     # 依存関係
├── tsconfig.json                    # TypeScript設定
├── vite.config.ts                   # Vite設定
└── README.md                        # このファイル
```

---

## 開発環境でのセットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/tomoto0/economics-hypothesis-generator.git
cd economics-hypothesis-generator
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. 環境変数の設定

```bash
cp .env.example .env
# .envファイルを編集して、必要な環境変数を設定
```

### 4. データベースマイグレーション

```bash
pnpm db:push
```

### 5. 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで `http://localhost:5173` にアクセスしてください。

---

## 主要な機能実装の詳細

### キーワードベースの仮説生成

ユーザーが3つのキーワードを入力すると、以下のプロセスで仮説が生成されます：

1. **キーワード入力**: ユーザーがダッシュボードで3つのキーワードを入力
2. **LLM呼び出し**: バックエンドがManus LLM APIを呼び出し
3. **仮説生成**: LLMが入力キーワードに基づいて仮説を生成
4. **分析コメント生成**: LLMが仮説に対する分析コメントを自動生成
5. **データベース保存**: 生成された仮説をデータベースに保存
6. **UI更新**: ダッシュボードに新しい仮説を表示

### スコアシステム

各仮説には3つのスコアが付与されます：

| スコア | 説明 | 範囲 |
|-------|------|------|
| **信頼度** | 仮説の理論的妥当性を示す指標 | 70-95 |
| **新規性スコア** | 仮説の新しさを示す指標 | 70-95 |
| **実現可能性スコア** | 仮説を実現できる可能性を示す指標 | 65-95 |

---

## トラブルシューティング

### LLM API呼び出しエラー

**症状**: 仮説生成時に「Failed to generate hypothesis」エラーが表示される

**解決方法**:
1. `BUILT_IN_FORGE_API_KEY`が正しく設定されているか確認
2. `BUILT_IN_FORGE_API_URL`がManusサーバーの正しいURLか確認
3. ネットワーク接続を確認
4. ブラウザのコンソールでエラーメッセージを確認

### データベース接続エラー

**症状**: 「Cannot connect to database」エラーが表示される

**解決方法**:
1. `DATABASE_URL`が正しく設定されているか確認
2. MySQLサーバーが起動しているか確認
3. データベースユーザーの権限を確認
4. `pnpm db:push`でマイグレーションを実行

### ポート競合エラー

**症状**: 「Port 3000 is already in use」エラーが表示される

**解決方法**:
```bash
# 別のポートで起動
PORT=3001 pnpm dev
```

---

## 技術的な特徴

### 型安全性

- **TypeScript**: フロントエンドとバックエンド全体でTypeScriptを使用
- **tRPC**: 型安全なAPI通信を実現
- **Drizzle ORM**: 型安全なデータベースクエリ

### パフォーマンス最適化

- **Vite**: 高速なビルドとホットモジュール置換
- **React 19**: 最新のReactフレームワーク
- **Tailwind CSS 4**: ユーティリティファーストのCSS

### セキュリティ

- **Manus OAuth**: セキュアなユーザー認証
- **JWT**: セッション管理
- **環境変数**: APIキーの安全な管理

---

## ライセンス

MIT License

---

## 作成者

Manus AI Platform

---

## サポート

問題が発生した場合は、GitHubのIssuesで報告してください。

**リポジトリ**: https://github.com/tomoto0/economics-hypothesis-generator

---

## 更新履歴

### v1.0.0 (2025-11-20)

- ✅ 初版リリース
- ✅ AI駆動の仮説生成機能
- ✅ キーワードベースの仮説生成
- ✅ 詳細な分析コメント生成
- ✅ ダッシュボード機能
- ✅ フィードバック・ディスカッション機能
- ✅ Manus LLM API統合
- ✅ Manus OAuth統合


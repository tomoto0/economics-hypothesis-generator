# 経済学仮説生成システム

![メインページスクリーンショット](assets/main_page_screenshot.jpeg)

## 概要

このプロジェクトは、AI（特にGoogle Gemini API）を活用して経済学の革新的な研究仮説を自動生成するシステムです。多様な経済データソースから最新情報を収集し、高度な分析を通じて、研究者の皆様が新たな発見をするための強力なツールを提供します。

本システムは、LLMによる経済学の仮説生成・研究アイデア創出を実現し、GitHub Actionsと連携して**定期的な自動更新**と**手動での即時更新**を可能にしています。

## 主な機能と特徴

### 1. AI駆動の仮説生成
- **Google Gemini API**: 最新の経済動向、技術革新、社会変化を反映した革新的で実現可能な研究仮説を生成します。
- **詳細な仮説構造**: 各仮説はタイトル、説明、カテゴリ、信頼度、推奨研究手法、重要要因、データソース、政策的含意、新規性、実現可能性、期待される影響などの多角的な情報を含みます。

### 2. 自動更新と手動更新
- **デプロイ先**: このダッシュボードはGitHub Pagesにもデプロイ可能です。以下のURLからサンプルサイトにアクセスできます。
  [https://tomoto0.github.io/economics-hypothesis-generator/](https://tomoto0.github.io/economics-hypothesis-generator/)
- **GitHub Actionsによる自動更新**: 3日に1回（JST 22:00）、GitHub Actionsが自動的に新しい仮説を生成し、GitHub Pagesを更新します。
- **「更新」ボタンによる手動更新**: Pagesのメインページにある「更新」ボタンをクリックすることで、ユーザーはいつでも新しい仮説を即座に生成・表示できます。
  - APIキーが設定されていない場合でも、その場で入力することで機能を利用可能です。

### 3. AI分析コメント
- 各仮説に対して、Gemini AI Assistantが専門的な観点から分析コメントを生成します。
- 理論的妥当性、実証研究の可能性、政策的含意、既存研究との関連性、改善提案などの視点から詳細な分析を提供します。

### 4. フィードバック・ディスカッションシステム
- **フィードバック**: 各仮説に対して5段階評価（妥当性、実現可能性、新規性、政策的重要性、総合評価）と詳細なコメントを投稿できます。フィードバックは自動的にGitHub Issueとして記録されます。
- **ディスカッション**: 各仮説に関する議論や意見交換が可能です。フィードバックと同様に、ディスカッションの件数や詳細がメインページに表示され、クリックで内容を確認できます。
- **GitHub Issues連携**: フィードバックとディスカッションはGitHub Issues APIと連携しており、透明性の高い議論と記録が可能です。

### 5. 直感的なユーザーインターフェース
- **React + Tailwind CSS + shadcn/ui**: モダンでレスポンシブなWebインターフェースを提供し、仮説の閲覧、フィルタリング、評価、議論を容易にします。
- **完全独立動作**: 外部バックエンドサーバーに依存しないフルスタティック構成で、GitHub Pages上で完全に独立して動作します。

## システム構成

```
economics-hypothesis-generator/
├── public/                 # 静的ファイル (GitHub Pagesでホスト)
│   ├── data/               # 生成された仮説データ
│   │   └── hypotheses.json # AIが生成した仮説データ
│   └── ...
├── src/                    # Reactフロントエンドアプリケーション
│   ├── components/         # 再利用可能なUIコンポーネント
│   │   ├── DiscussionPanel.jsx  # ディスカッション表示・投稿ロジック
│   │   ├── DiscussionSummary.jsx # ディスカッション概要表示
│   │   ├── FeedbackModal.jsx    # フィードバック投稿モーダル
│   │   ├── FeedbackSummary.jsx  # フィードバック概要表示
│   │   └── ...
│   ├── App.jsx            # メインアプリケーションロジックとUI
│   └── ...
├── generate_hypotheses.py  # GitHub Actionsで実行される仮説生成Pythonスクリプト
├── .github/workflows/      # GitHub Actionsワークフロー定義
│   └── main.yml            # ビルド、デプロイ、自動仮説生成、自動コミット
├── vite.config.js          # Vite (フロントエンドビルドツール) 設定
└── README.md               # このドキュメント
```

### 技術スタック
- **フロントエンド**: React 18, Vite, Tailwind CSS, shadcn/ui
- **AI**: Google Gemini 2.5 Flash API
- **データ管理**: GitHub Issues API, 静的JSONファイル
- **自動化・デプロイ**: GitHub Actions, GitHub Pages
- **言語**: JavaScript (React), Python

## セットアップ手順

### 1. リポジトリのクローン
```bash
git clone https://github.com/tomoto0/economics-hypothesis-generator.git
cd economics-hypothesis-generator
```

### 2. GitHub Secretsの設定
Google Gemini APIキーをGitHubリポジトリのSecretsに設定します。
1. GitHubリポジトリにアクセスし、「Settings」タブをクリック。
2. 左サイドバーの「Secrets and variables」から「Actions」を選択。
3. 「New repository secret」をクリックし、以下のシークレットを追加します。
   - `GEMINI_API_KEY`: あなたのGoogle Gemini APIキー。

### 3. GitHub Pagesの有効化
1. リポジトリの「Settings」タブをクリック。
2. 左サイドバーの「Pages」を選択。
3. 「Build and deployment」セクションの「Source」で「GitHub Actions」を選択し、「Save」をクリック。

### 4. 初回デプロイと自動更新の開始
- `main`ブランチにプッシュすると、GitHub Actionsが自動的にトリガーされ、アプリケーションのビルドとGitHub Pagesへのデプロイが行われます。
- 以降、3日に1回自動的に新しい仮説が生成され、サイトが更新されます。

## ローカル開発環境のセットアップ

### 1. 依存関係のインストール
```bash
pnpm install
```

### 2. 環境変数の設定
ローカル開発用に `.env` ファイルを作成し、Gemini APIキーを設定します。
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. 開発サーバーの起動
```bash
pnpm dev
```
ブラウザで `http://localhost:5173` (または表示されたURL) にアクセスすると、開発サーバーが起動し、アプリケーションを確認できます。

## 貢献

このプロジェクトはオープンソースであり、貢献を歓迎します。バグ報告、機能提案、プルリクエストなど、どのような形でもご協力いただけると幸いです。

## ライセンス

MIT

---

**最終更新**: 2025年8月14日
**バージョン**: 4.0.0 (自動更新・手動更新機能強化版)



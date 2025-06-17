# 経済学仮説生成システム

LLMによる経済学の仮説生成・研究アイデア創出を実現するシステムです。GitHub ActionsでGemini APIによる分析を定期実行し、最新の経済動向に基づいた革新的な研究仮説を自動生成します。

## 🌟 特徴

- **AI駆動の仮説生成**: Gemini APIを活用した高度な経済学仮説の自動生成
- **定期自動更新**: GitHub Actionsによる毎日の自動分析・更新
- **美しいWebインターフェース**: React製のモダンなダッシュボード
- **研究支援機能**: 推奨研究手法や重要要因の提示
- **信頼度評価**: AI による仮説の信頼度スコア

## 🚀 システム構成

```
economics-hypothesis-generator/
├── src/                    # Reactフロントエンド
│   ├── components/         # UIコンポーネント
│   ├── App.jsx            # メインアプリケーション
│   └── ...
├── scripts/               # バックエンドスクリプト
│   ├── generate_hypotheses.py  # Gemini API分析スクリプト
│   └── requirements.txt   # Python依存関係
├── .github/workflows/     # GitHub Actions設定
│   └── generate-hypotheses.yml
├── public/data/          # 生成データ保存場所
│   ├── hypotheses.json   # 生成された仮説データ
│   └── metadata.json     # メタデータ
└── README.md
```

## 📊 機能概要

### 1. 仮説生成エンジン
- 最新の経済指標データを自動収集
- Gemini APIによる高度な分析と仮説生成
- 複数の研究分野をカバー（金融政策、労働経済学、国際経済学など）

### 2. 自動化システム
- **定期実行**: 毎日午前9時（JST）に自動実行
- **手動トリガー**: GitHub UIから任意のタイミングで実行可能
- **継続的デプロイ**: 生成結果を自動的にWebサイトに反映

### 3. Webダッシュボード
- 生成された仮説の一覧表示
- 信頼度・研究分野別の分類
- 推奨研究手法と重要要因の表示
- レスポンシブデザイン対応

## 🛠️ セットアップ手順

### 1. リポジトリの準備
```bash
git clone https://github.com/tomoto0/economics-hypothesis-generator.git
cd economics-hypothesis-generator
```

### 2. 環境変数の設定
GitHub リポジトリの Settings > Secrets and variables > Actions で以下を設定：

- `GEMINI_API_KEY`: Google Gemini APIキー

### 3. GitHub Pagesの有効化
1. リポジトリの Settings > Pages
2. Source: "GitHub Actions" を選択
3. 保存

### 4. 初回実行
- Actions タブから "経済学仮説生成システム" ワークフローを手動実行
- または、mainブランチにプッシュして自動実行

## 📈 使用方法

### 自動実行
システムは毎日午前9時（JST）に自動的に実行され、最新の経済仮説を生成します。

### 手動実行
1. GitHubリポジトリのActionsタブを開く
2. "経済学仮説生成システム" ワークフローを選択
3. "Run workflow" ボタンをクリック
4. 必要に応じて強制更新フラグを設定して実行

### 結果の確認
生成された仮説は以下で確認できます：
- **Webサイト**: https://tomoto0.github.io/economics-hypothesis-generator
- **JSONファイル**: `public/data/hypotheses.json`
- **ログファイル**: Actions の Artifacts からダウンロード

## 🔧 カスタマイズ

### 分析頻度の変更
`.github/workflows/generate-hypotheses.yml` の cron 設定を変更：
```yaml
schedule:
  - cron: '0 0 * * *'  # 毎日午前9時（JST）
  - cron: '0 */6 * * *'  # 6時間ごと
```

### 仮説生成ロジックの調整
`scripts/generate_hypotheses.py` の以下を編集：
- `collect_economic_data()`: データ収集ロジック
- `generate_hypothesis_prompt()`: プロンプト生成
- Gemini API パラメータ（temperature, topK など）

### UIのカスタマイズ
`src/App.jsx` を編集してWebインターフェースを変更

## 📋 生成される仮説の例

```json
{
  "title": "デジタル通貨普及と消費者行動の変化",
  "description": "中央銀行デジタル通貨（CBDC）の導入が消費者の支払い行動と貯蓄パターンに与える影響について、行動経済学の観点から分析する必要がある。",
  "category": "金融政策",
  "confidence": 85,
  "research_methods": ["実験経済学", "フィールド調査", "データマイニング"],
  "key_factors": ["プライバシー懸念", "利便性", "金融包摂"],
  "generated_at": "2025-06-17T10:30:00Z"
}
```

## 🔒 セキュリティ

- APIキーはGitHub Secretsで安全に管理
- 最小権限の原則に基づくアクセス制御
- 定期的な依存関係の更新

## 📝 ライセンス

MIT License

## 🤝 貢献

プルリクエストや Issue の報告を歓迎します。

## 📞 サポート

質問や問題がある場合は、GitHub Issues でお知らせください。

---

**Powered by Gemini AI** 🧠✨


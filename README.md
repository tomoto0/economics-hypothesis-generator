# 経済学仮説生成システム - 強化版

## はじめに

このプロジェクトは、AI（特にGemini API）を活用して経済学の革新的な研究仮説を自動生成するシステムです。多様な経済データソースから最新情報を収集し、高度な分析を通じて、研究者の皆様が新たな発見をするための強力なツールを提供します。

LLMによる経済学の仮説生成・研究アイデア創出を実現するシステムです。GitHub ActionsでGemini APIによる分析を定期実行し、**幅広いデータソースから収集した最新の経済動向**に基づいた革新的な研究仮説を自動生成します。

## 🆕 新機能: フィードバック・評価システム

### ✨ 主要機能
- **5段階評価システム**: 妥当性、実現可能性、新規性、政策的重要性、総合評価
- **詳細フィードバック**: コメント、改善提案、関連研究の指摘
- **GitHub Issue連携**: フィードバックは自動的にGitHub Issueとして投稿
- **リアルタイム集計**: フィードバック統計の自動更新・表示
- **研究者情報**: 任意で所属機関や専門分野を記録

### 🔄 自動化システム
- **定期実行**: 毎日午前9時（JST）に仮説生成とフィードバック更新
- **Issue連携**: フィードバックIssue作成時の自動処理
- **手動トリガー**: GitHub UIから任意のタイミングで実行可能
- **継続的デプロイ**: 生成結果とフィードバックを自動的にWebサイトに反映

## 🌐 アクセス

- **AI駆動の仮説生成**: Gemini APIを活用した高度な経済学仮説の自動生成
- **定期自動更新**: GitHub Actionsによる毎日の自動分析・更新
- **美しいWebインターフェース**: React製のモダンなダッシュボード
- **研究支援機能**: 推奨研究手法や重要要因の提示
- **信頼度評価**: AI による仮説の信頼度スコア
- **包括的データ統合**: 複数ソースからのリアルタイムデータ収集

## 🏗️ システム構成

```
economics-hypothesis-generator/
├── src/                    # Reactフロントエンド
│   ├── components/         # UIコンポーネント
│   ├── App.jsx            # メインアプリケーション
│   └── ...
├── economics_api/          # Flaskバックエンド
│   ├── src/                # バックエンドのソースコード
│   │   ├── database/       # SQLiteデータベースファイル
│   │   ├── models/         # データベースモデル
│   │   ├── routes/         # APIルート定義
│   │   └── main.py         # アプリケーションのエントリポイント
│   └── venv/               # Python仮想環境
├── scripts/               # 強化されたバックエンドスクリプト
│   ├── generate_hypotheses.py  # 多元的データ収集・分析スクリプト
│   └── requirements.txt   # Python依存関係
├── .github/workflows/     # GitHub Actions設定
│   └── generate-hypotheses.yml
├── public/data/          # 生成データ保存場所
│   ├── hypotheses.json   # 生成された仮説データ
│   └── metadata.json     # メタデータ
└── README.md
```

## 📈 データ収集機能

### 1. 経済指標データ
- **FRED**: GDP、CPI、失業率、金利、工業生産指数など
- **世界銀行**: GDP成長率、インフレ率、貿易収支、FDI流入など
- **リアルタイム更新**: 最新の経済統計を自動取得

### 2. 金融市場データ
- **株式指数**: S&P 500、NASDAQ、ダウ平均
- **為替レート**: USD/JPY、EUR/USD
- **商品価格**: 金、原油
- **債券**: 10年国債利回り
- **ボラティリティ**: VIX指数

### 3. デジタル経済データ
- **暗号通貨**: Bitcoin、Ethereum、主要アルトコイン
- **価格変動**: 24時間変動率、市場キャップ
- **市場動向**: デジタル資産の普及状況

### 4. 経済カレンダー
- **重要イベント**: 金利決定、雇用統計、GDP発表
- **政策発表**: 中央銀行の政策変更
- **国際会議**: G7、G20などの重要会合

## 🔧 セットアップ手順

### 1. リポジトリの準備
```bash
git clone https://github.com/tomoto0/economics-hypothesis-generator.git
cd economics-hypothesis-generator
```

### 2. 環境変数の設定
GitHub リポジトリの Settings > Secrets and variables > Actions で以下を設定：

- `GEMINI_API_KEY`: Google Gemini APIキー
- `FRED_API_KEY`: FRED APIキー（オプション、より多くのデータ取得に必要）

### 3. GitHub Pagesの有効化
1. リポジトリの Settings > Pages
2. Source: "GitHub Actions" を選択
3. 保存

### 4. 初回実行
- Actions タブから "経済学仮説生成システム" ワークフローを手動実行
- または、mainブランチにプッシュして自動実行

## 📊 生成される仮説の例（強化版）

```json
{
  "title": "多元的データソースによる金融政策効果の非線形分析",
  "description": "従来の金融政策分析は単一データソースに依存していたが、FRED、世界銀行、暗号通貨市場データを統合することで、政策効果の非線形性と波及メカニズムをより精密に分析できる。",
  "category": "金融政策",
  "confidence": 88,
  "research_methods": ["多変量時系列分析", "機械学習回帰", "ネットワーク分析"],
  "key_factors": ["政策金利変化", "暗号通貨ボラティリティ", "国際資本フロー"],
  "data_sources_used": ["FRED", "CoinGecko", "World Bank", "Yahoo Finance"],
  "policy_implications": ["デジタル資産を考慮した金融政策設計", "クロスボーダー政策協調"],
  "novelty_score": 92,
  "feasibility_score": 85,
  "expected_impact": "中央銀行のデジタル時代における政策フレームワーク再構築に貢献"
}
```

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
- **GitHubリポジトリ**: https://github.com/tomoto0/economics-hypothesis-generator
- **フィードバックIssues**: https://github.com/tomoto0/economics-hypothesis-generator/issues?q=label%3Afeedback

## 📊 データソース（強化版）

### 経済データ
- **FRED (Federal Reserve Economic Data)**: 米国経済指標
- **World Bank Open Data**: 国際経済・開発指標
- **Yahoo Finance**: 金融市場データ
- **CoinGecko API**: 暗号通貨市場データ
- **Economic Calendar**: 経済イベント・発表予定

### AI分析
- **Gemini 2.5 Flash**: 高度な仮説生成と分析
- **多元的データ統合**: 複数ソースからの包括的分析
- **リアルタイム処理**: 最新データに基づく動的分析

## 🚀 使用方法

### 1. 仮説の閲覧
1. [Webサイト](https://tomoto0.github.io/economics-hypothesis-generator) にアクセス
2. 生成された経済学仮説を閲覧
3. カテゴリ、信頼度、キーワードでフィルタリング可能

### 2. フィードバックの投稿
1. 各仮説カードの「フィードバック」ボタンをクリック
2. 5段階評価とコメントを入力
3. 送信すると自動的にGitHub Issueとして投稿

### 3. フィードバックの確認
- 各仮説にフィードバック数と平均評価が表示
- 詳細表示でカテゴリ別評価と最新コメントを確認
- GitHub Issuesで全フィードバックの履歴を確認

## ⚙️ 設定

### 必要な環境変数
```bash
GEMINI_API_KEY=your_gemini_api_key
FRED_API_KEY=your_fred_api_key  # 任意
GITHUB_TOKEN=your_github_token  # フィードバック機能用
```

### GitHub Secrets設定
1. リポジトリの Settings → Secrets and variables → Actions
2. 以下のシークレットを追加:
   - `GEMINI_API_KEY`: Gemini APIキー
   - `FRED_API_KEY`: FRED APIキー（任意）

## 🔧 技術仕様

### フロントエンド
- **React 18**: モダンなWebアプリケーション
- **Tailwind CSS**: レスポンシブデザイン
- **Lucide Icons**: 美しいアイコンセット
- **GitHub Pages**: 静的サイトホスティング

### バックエンド
- **Python 3.11**: データ処理とAPI連携
- **GitHub Actions**: 自動化ワークフロー
- **GitHub Issues API**: フィードバック管理
- **JSON**: データ交換フォーマット

### データ処理
- **多元的データ収集**: 複数APIからの統合データ取得
- **AI分析**: Gemini Proによる高度な仮説生成
- **リアルタイム更新**: 最新データに基づく動的分析

## 📈 期待される成果

### 研究支援
- **創造的研究活動**: AI生成仮説による新たな研究方向の発見
- **研究効率向上**: 仮説生成時間の大幅短縮
- **学際的アプローチ**: 複数分野にまたがる研究アイデア

### 品質向上
- **ピアレビュー**: 研究者コミュニティによる評価・改善
- **継続的改善**: フィードバックに基づく仮説生成精度向上
- **知識共有**: 関連研究や改善提案の蓄積

### 政策支援
- **政策立案支援**: 実証可能な政策仮説の提供
- **影響評価**: 政策効果の事前予測と評価手法
- **リアルタイム分析**: 最新データに基づく政策判断支援

## 🤝 貢献方法

### フィードバック投稿
- Webサイトから直接フィードバックを投稿
- GitHub Issuesで詳細な議論や提案

### 開発貢献
- Pull Requestによる機能改善
- バグ報告や機能要望のIssue作成

### 研究協力
- 生成された仮説の実証研究
- 研究結果のフィードバック共有

## 📞 サポート

- **Issues**: https://github.com/tomoto0/economics-hypothesis-generator/issues
- **Discussions**: GitHub Discussionsで質問・議論
- **Documentation**: このREADMEと各スクリプトのコメント

---

**最終更新**: 2024年6月19日
**バージョン**: 2.0.0（フィードバック機能付き）



## 💻 ローカル開発環境のセットアップ

### 1. フロントエンドのセットアップ

```bash
cd economics-hypothesis-generator
pnpm install
pnpm dev
```

### 2. バックエンドのセットアップ

```bash
cd economics-hypothesis-generator/economics_api
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python src/main.py
```

フロントエンドの `src/App.jsx` の `API_BASE_URL` を `http://localhost:5000/api` に戻してください。



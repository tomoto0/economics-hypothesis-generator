# 経済学仮説生成システム - 強化版

## はじめに

このプロジェクトは、AI（特にGemini API）を活用して経済学の革新的な研究仮説を自動生成するシステムです。多様な経済データソースから最新情報を収集し、高度な分析を通じて、研究者の皆様が新たな発見をするための強力なツールを提供します。

LLMによる経済学の仮説生成・研究アイデア創出を実現するシステムです。GitHub ActionsでGemini APIによる分析を定期実行し、**幅広いデータソースから収集した最新の経済動向**に基づいた革新的な研究仮説を自動生成します。

## 🌟 新機能・強化ポイント

### 📊 多元的データソース統合
- **FRED (Federal Reserve Economic Data)**: 米国の主要経済指標
- **世界銀行データ**: 国際的な経済・開発指標
- **Yahoo Finance**: リアルタイム金融市場データ
- **CoinGecko**: 暗号通貨市場データ
- **経済カレンダー**: 重要な経済イベント情報

### 🔍 高度な分析機能
- **市場センチメント分析**: 複数指標からの総合的な市場心理判定
- **トレンド識別**: 主要経済トレンドの自動抽出
- **相互作用分析**: 伝統的指標とデジタル経済指標の関係性
- **政策含意評価**: 研究結果の政策的インパクト評価

### 🚀 システム特徴

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

## 🔧 カスタマイズ

### 分析頻度の変更
`.github/workflows/generate-hypotheses.yml` の cron 設定を変更：
```yaml
schedule:
  - cron: '0 0 * * *'  # 毎日午前9時（JST）
  - cron: '0 */6 * * *'  # 6時間ごと
```

### データソースの追加
`scripts/generate_hypotheses.py` の `EconomicDataCollector` クラスに新しいメソッドを追加：
```python
def collect_new_data_source(self) -> List[EconomicIndicator]:
    # 新しいデータソースからの収集ロジック
    pass
```

### 仮説生成ロジックの調整
- `generate_hypothesis_prompt()`: プロンプト生成の強化
- Gemini API パラメータ（temperature, topK など）の調整
- 分析対象指標の追加・変更

## 🌐 データソース詳細

### FRED (Federal Reserve Economic Data)
- **提供機関**: セントルイス連邦準備銀行
- **データ種類**: 米国の主要経済統計
- **更新頻度**: リアルタイム〜月次
- **API制限**: 無料版は1日1000リクエスト

### 世界銀行オープンデータ
- **提供機関**: 世界銀行
- **データ種類**: 国際開発・経済指標
- **更新頻度**: 年次〜四半期
- **API制限**: 無制限（適切な使用範囲内）

### Yahoo Finance
- **提供機関**: Yahoo
- **データ種類**: 株価、為替、商品価格
- **更新頻度**: リアルタイム
- **API制限**: 非公式API、適度な使用推奨

### CoinGecko
- **提供機関**: CoinGecko
- **データ種類**: 暗号通貨価格・市場データ
- **更新頻度**: リアルタイム
- **API制限**: 無料版は月50,000リクエスト

## 🔒 セキュリティ

- APIキーはGitHub Secretsで安全に管理
- 最小権限の原則に基づくアクセス制御
- 定期的な依存関係の更新
- レート制限の遵守

## 📝 ライセンス

MIT License

## 🤝 貢献

プルリクエストや Issue の報告を歓迎します。特に新しいデータソースの追加や分析手法の改善についてのご提案をお待ちしています。

## 📞 サポート

質問や問題がある場合は、GitHub Issues でお知らせください。

---

**Powered by Gemini AI** 🧠✨  
**Enhanced with Multi-Source Economic Data** 📊🌐



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



# 経済学仮説生成システム - フィードバック機能付き

LLMによる経済学の仮説生成・研究アイデア創出システムに、**評価・フィードバック機能**を追加しました。

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

- **Webサイト**: https://tomoto0.github.io/economics-hypothesis-generator
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
- **Gemini Pro**: 高度な仮説生成と分析
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


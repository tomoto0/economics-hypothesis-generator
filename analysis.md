# 問題分析

## 1. Gemini APIキーの問題

### 現状
- GitHub ActionsでREACT_APP_GEMINI_API_KEYを設定している
- DiscussionPanel.jsxでprocess.env.REACT_APP_GEMINI_API_KEYを参照している
- しかし、GitHub Pagesでは「Gemini APIキーが設定されていません」エラーが発生

### 原因
1. **ビルド時の環境変数設定**: Viteでは環境変数の扱いが特殊で、VITE_プレフィックスが必要
2. **クライアントサイドでの環境変数アクセス**: GitHub Pagesは静的サイトなので、ビルド時に環境変数が埋め込まれる必要がある

### 解決策
1. GitHub ActionsでVITE_GEMINI_API_KEYとして設定
2. コード内でimport.meta.env.VITE_GEMINI_API_KEYを使用

## 2. ディスカッション表示の問題

### 現状
- フィードバック機能では「X件のフィードバック 詳細を表示」が表示される
- ディスカッション機能では同様の表示がされていない

### 原因
- DiscussionSummaryコンポーネントは作成したが、実際のディスカッション投稿時にデータが正しく更新されていない
- GitHub Issues APIとの連携が不完全

### 解決策
1. ディスカッション投稿後のデータ更新ロジックを修正
2. App.jsxでのディスカッション読み込み処理を改善


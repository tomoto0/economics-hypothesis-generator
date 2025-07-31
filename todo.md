# GitHub Actionsワークフロー統合タスク

## 現在の状況
- [x] レポジトリのクローン完了
- [x] 既存ワークフローファイルの確認完了
  - generate-hypotheses.yml: 経済学仮説生成システム（メイン機能）
  - jekyll-gh-pages.yml: Jekyll用のGitHub Pagesデプロイ（不要）

## 問題点の分析
- [ ] jekyll-gh-pages.ymlは不要（ReactアプリなのでJekyllは使わない）
- [ ] generate-hypotheses.ymlは既にReactアプリのビルドとデプロイを含んでいる
- [ ] 重複するデプロイ処理により競合が発生する可能性

## 統合計画
- [x] jekyll-gh-pages.ymlを削除
- [x] generate-hypotheses.ymlを唯一のワークフローとして維持
- [x] 必要に応じてgenerate-hypotheses.ymlを最適化

## 実行タスク
- [x] jekyll-gh-pages.ymlファイルの削除
- [x] generate-hypotheses.ymlの最終確認と調整
- [ ] 変更をコミット・プッシュ
- [ ] GitHub Actionsの動作確認


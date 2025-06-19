#!/usr/bin/env python3
"""
GitHub Issue連携スクリプト
フィードバックをGitHub Issueとして投稿し、既存のフィードバックを取得する
"""

import os
import json
import requests
import datetime
import logging
from typing import List, Dict, Any, Optional

# ログ設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class GitHubFeedbackManager:
    """GitHub Issues APIを使用したフィードバック管理クラス"""
    
    def __init__(self, repo_owner: str, repo_name: str, github_token: str):
        self.repo_owner = repo_owner
        self.repo_name = repo_name
        self.github_token = github_token
        self.base_url = f"https://api.github.com/repos/{repo_owner}/{repo_name}"
        
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'token {github_token}',
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Economics-Hypothesis-Generator-Feedback/1.0'
        })
    
    def create_feedback_issue(self, hypothesis_id: int, hypothesis_title: str, feedback_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """フィードバックをGitHub Issueとして作成"""
        logger.info(f"仮説 {hypothesis_id} のフィードバックIssueを作成中")
        
        try:
            # Issue本文の作成
            issue_body = self._format_feedback_issue_body(hypothesis_id, hypothesis_title, feedback_data)
            
            # Issue作成データ
            issue_data = {
                "title": f"フィードバック: {hypothesis_title}",
                "body": issue_body,
                "labels": ["feedback", "user-input", f"hypothesis-{hypothesis_id}"]
            }
            
            # GitHub Issues APIに投稿
            response = self.session.post(
                f"{self.base_url}/issues",
                json=issue_data,
                timeout=30
            )
            
            if response.status_code == 201:
                issue = response.json()
                logger.info(f"フィードバックIssue作成成功: #{issue['number']}")
                return issue
            else:
                logger.error(f"Issue作成失敗: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"フィードバックIssue作成エラー: {e}")
            return None
    
    def get_feedback_issues(self, hypothesis_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """フィードバックIssueを取得"""
        logger.info("フィードバックIssueを取得中")
        
        try:
            # ラベルでフィルタリング
            labels = "feedback"
            if hypothesis_id:
                labels += f",hypothesis-{hypothesis_id}"
            
            params = {
                "labels": labels,
                "state": "all",
                "sort": "created",
                "direction": "desc",
                "per_page": 100
            }
            
            response = self.session.get(
                f"{self.base_url}/issues",
                params=params,
                timeout=30
            )
            
            if response.status_code == 200:
                issues = response.json()
                logger.info(f"{len(issues)} 件のフィードバックIssueを取得")
                return issues
            else:
                logger.error(f"Issue取得失敗: {response.status_code} - {response.text}")
                return []
                
        except Exception as e:
            logger.error(f"フィードバックIssue取得エラー: {e}")
            return []
    
    def parse_feedback_from_issues(self, issues: List[Dict[str, Any]]) -> Dict[int, List[Dict[str, Any]]]:
        """Issueからフィードバックデータを解析"""
        logger.info("Issueからフィードバックデータを解析中")
        
        feedback_data = {}
        
        for issue in issues:
            try:
                # Issue本文からフィードバックデータを抽出
                feedback = self._extract_feedback_from_issue(issue)
                if feedback:
                    hypothesis_id = feedback['hypothesis_id']
                    
                    if hypothesis_id not in feedback_data:
                        feedback_data[hypothesis_id] = []
                    
                    feedback_data[hypothesis_id].append({
                        **feedback['feedback'],
                        'timestamp': issue['created_at'],
                        'issue_number': issue['number'],
                        'issue_url': issue['html_url']
                    })
                    
            except Exception as e:
                logger.warning(f"Issue #{issue['number']} の解析に失敗: {e}")
                continue
        
        logger.info(f"{len(feedback_data)} 件の仮説に対するフィードバックを解析")
        return feedback_data
    
    def update_feedback_summary(self, feedback_data: Dict[int, List[Dict[str, Any]]]) -> None:
        """フィードバック集計データをJSONファイルに保存"""
        logger.info("フィードバック集計データを保存中")
        
        try:
            # 集計データの計算
            summary = {}
            
            for hypothesis_id, feedbacks in feedback_data.items():
                if not feedbacks:
                    continue
                
                # 評価項目の平均計算
                categories = ['validity', 'feasibility', 'novelty', 'policy_importance', 'overall']
                averages = {}
                
                for category in categories:
                    values = [f.get(category, 0) for f in feedbacks if f.get(category, 0) > 0]
                    averages[category] = sum(values) / len(values) if values else 0
                
                # 最新のコメント
                latest_feedback = max(feedbacks, key=lambda x: x['timestamp'])
                
                summary[hypothesis_id] = {
                    'feedback_count': len(feedbacks),
                    'average_ratings': averages,
                    'latest_comment': latest_feedback.get('comment', ''),
                    'latest_timestamp': latest_feedback['timestamp'],
                    'all_feedbacks': feedbacks
                }
            
            # JSONファイルに保存
            output_file = 'public/data/feedback_summary.json'
            os.makedirs(os.path.dirname(output_file), exist_ok=True)
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump({
                    'generated_at': datetime.datetime.now().isoformat(),
                    'total_hypotheses_with_feedback': len(summary),
                    'total_feedback_count': sum(data['feedback_count'] for data in summary.values()),
                    'feedback_summary': summary
                }, f, ensure_ascii=False, indent=2)
            
            logger.info(f"フィードバック集計データを {output_file} に保存")
            
        except Exception as e:
            logger.error(f"フィードバック集計データ保存エラー: {e}")
    
    def _format_feedback_issue_body(self, hypothesis_id: int, hypothesis_title: str, feedback_data: Dict[str, Any]) -> str:
        """フィードバックIssue本文のフォーマット"""
        return f"""## 仮説へのフィードバック

**仮説ID**: {hypothesis_id}
**仮説タイトル**: {hypothesis_title}

### 評価
- **妥当性**: {feedback_data.get('validity', 0)}/5 ⭐
- **実現可能性**: {feedback_data.get('feasibility', 0)}/5 ⭐
- **新規性**: {feedback_data.get('novelty', 0)}/5 ⭐
- **政策的重要性**: {feedback_data.get('policy_importance', 0)}/5 ⭐
- **総合評価**: {feedback_data.get('overall', 0)}/5 ⭐

### コメント
{feedback_data.get('comment', 'なし')}

### 改善提案
{feedback_data.get('suggestions', 'なし')}

### 関連研究
{feedback_data.get('related_research', 'なし')}

### 研究者情報
{feedback_data.get('reviewer_info', '匿名')}

---

**フィードバック送信日時**: {datetime.datetime.now().strftime('%Y年%m月%d日 %H:%M:%S')}

### 構造化データ
```json
{{
  "hypothesis_id": {hypothesis_id},
  "feedback": {json.dumps(feedback_data, ensure_ascii=False, indent=2)}
}}
```

---

このフィードバックは経済学仮説生成システムから自動投稿されました。
"""
    
    def _extract_feedback_from_issue(self, issue: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Issue本文からフィードバックデータを抽出"""
        try:
            body = issue['body']
            
            # JSON部分を抽出
            import re
            json_match = re.search(r'```json\n(.*?)\n```', body, re.DOTALL)
            
            if json_match:
                json_str = json_match.group(1)
                feedback_data = json.loads(json_str)
                return feedback_data
            
            # フォールバック: 評価値を正規表現で抽出
            ratings = {}
            rating_patterns = {
                'validity': r'\*\*妥当性\*\*:\s*(\d+)/5',
                'feasibility': r'\*\*実現可能性\*\*:\s*(\d+)/5',
                'novelty': r'\*\*新規性\*\*:\s*(\d+)/5',
                'policy_importance': r'\*\*政策的重要性\*\*:\s*(\d+)/5',
                'overall': r'\*\*総合評価\*\*:\s*(\d+)/5'
            }
            
            for key, pattern in rating_patterns.items():
                match = re.search(pattern, body)
                if match:
                    ratings[key] = int(match.group(1))
            
            # 仮説IDを抽出
            hypothesis_id_match = re.search(r'\*\*仮説ID\*\*:\s*(\d+)', body)
            if hypothesis_id_match and ratings:
                return {
                    'hypothesis_id': int(hypothesis_id_match.group(1)),
                    'feedback': ratings
                }
            
            return None
            
        except Exception as e:
            logger.warning(f"フィードバックデータ抽出エラー: {e}")
            return None

def main():
    """メイン関数"""
    # 環境変数から設定を取得
    repo_owner = os.getenv('GITHUB_REPOSITORY_OWNER', 'tomoto0')
    repo_name = os.getenv('GITHUB_REPOSITORY_NAME', 'economics-hypothesis-generator')
    github_token = os.getenv('GITHUB_TOKEN')
    
    if not github_token:
        logger.error("GITHUB_TOKEN環境変数が設定されていません")
        return
    
    # フィードバック管理クラスを初期化
    feedback_manager = GitHubFeedbackManager(repo_owner, repo_name, github_token)
    
    # 既存のフィードバックIssueを取得
    issues = feedback_manager.get_feedback_issues()
    
    # フィードバックデータを解析
    feedback_data = feedback_manager.parse_feedback_from_issues(issues)
    
    # 集計データを更新
    feedback_manager.update_feedback_summary(feedback_data)
    
    print(f"✅ フィードバック処理完了: {len(feedback_data)} 件の仮説に対するフィードバックを処理")

if __name__ == "__main__":
    main()


#!/usr/bin/env python3
"""
フィードバック投稿用スクリプト
Webフォームからのフィードバックデータを受け取り、GitHub Issueとして投稿する
"""

import os
import sys
import json
import argparse
from feedback_manager import GitHubFeedbackManager

def submit_feedback_from_json(json_file_path: str) -> bool:
    """JSONファイルからフィードバックを読み込んでGitHub Issueとして投稿"""
    try:
        # JSONファイルを読み込み
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        hypothesis_id = data['hypothesis_id']
        hypothesis_title = data['hypothesis_title']
        feedback_data = data['feedback']
        
        # GitHub設定
        repo_owner = os.getenv('GITHUB_REPOSITORY_OWNER', 'tomoto0')
        repo_name = os.getenv('GITHUB_REPOSITORY_NAME', 'economics-hypothesis-generator')
        github_token = os.getenv('GITHUB_TOKEN')
        
        if not github_token:
            print("エラー: GITHUB_TOKEN環境変数が設定されていません")
            return False
        
        # フィードバック管理クラスを初期化
        feedback_manager = GitHubFeedbackManager(repo_owner, repo_name, github_token)
        
        # GitHub Issueとして投稿
        issue = feedback_manager.create_feedback_issue(
            hypothesis_id, hypothesis_title, feedback_data
        )
        
        if issue:
            print(f"✅ フィードバックを投稿しました: {issue['html_url']}")
            return True
        else:
            print("❌ フィードバックの投稿に失敗しました")
            return False
            
    except Exception as e:
        print(f"❌ エラー: {e}")
        return False

def submit_feedback_interactive():
    """対話形式でフィードバックを入力してGitHub Issueとして投稿"""
    print("=== 経済学仮説フィードバック投稿 ===")
    
    try:
        # 仮説情報の入力
        hypothesis_id = int(input("仮説ID: "))
        hypothesis_title = input("仮説タイトル: ")
        
        print("\n評価項目 (1-5の数値で入力):")
        validity = int(input("妥当性 (1-5): "))
        feasibility = int(input("実現可能性 (1-5): "))
        novelty = int(input("新規性 (1-5): "))
        policy_importance = int(input("政策的重要性 (1-5): "))
        overall = int(input("総合評価 (1-5): "))
        
        print("\n詳細フィードバック (空白可):")
        comment = input("コメント: ")
        suggestions = input("改善提案: ")
        related_research = input("関連研究: ")
        reviewer_info = input("研究者情報: ")
        
        # フィードバックデータの構築
        feedback_data = {
            'validity': validity,
            'feasibility': feasibility,
            'novelty': novelty,
            'policy_importance': policy_importance,
            'overall': overall,
            'comment': comment,
            'suggestions': suggestions,
            'related_research': related_research,
            'reviewer_info': reviewer_info
        }
        
        # GitHub設定
        repo_owner = os.getenv('GITHUB_REPOSITORY_OWNER', 'tomoto0')
        repo_name = os.getenv('GITHUB_REPOSITORY_NAME', 'economics-hypothesis-generator')
        github_token = os.getenv('GITHUB_TOKEN')
        
        if not github_token:
            print("エラー: GITHUB_TOKEN環境変数が設定されていません")
            return False
        
        # フィードバック管理クラスを初期化
        feedback_manager = GitHubFeedbackManager(repo_owner, repo_name, github_token)
        
        # GitHub Issueとして投稿
        print("\nフィードバックを投稿中...")
        issue = feedback_manager.create_feedback_issue(
            hypothesis_id, hypothesis_title, feedback_data
        )
        
        if issue:
            print(f"✅ フィードバックを投稿しました: {issue['html_url']}")
            return True
        else:
            print("❌ フィードバックの投稿に失敗しました")
            return False
            
    except KeyboardInterrupt:
        print("\n投稿をキャンセルしました")
        return False
    except Exception as e:
        print(f"❌ エラー: {e}")
        return False

def main():
    """メイン関数"""
    parser = argparse.ArgumentParser(description='経済学仮説フィードバック投稿ツール')
    parser.add_argument('--json', '-j', help='JSONファイルからフィードバックを投稿')
    parser.add_argument('--interactive', '-i', action='store_true', help='対話形式でフィードバックを投稿')
    
    args = parser.parse_args()
    
    if args.json:
        success = submit_feedback_from_json(args.json)
    elif args.interactive:
        success = submit_feedback_interactive()
    else:
        print("使用方法:")
        print("  python submit_feedback.py --json feedback.json")
        print("  python submit_feedback.py --interactive")
        return
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()


import os
import requests
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional
from src.models.discussion import Discussion, db

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeminiAICommentator:
    """Gemini API を使用した自動コメント生成クラス"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
        
        if not self.api_key:
            logger.warning("Gemini API key not found. AI comments will be disabled.")
    
    def generate_comment(self, hypothesis: Dict, existing_discussions: List[Dict] = None) -> Optional[str]:
        """
        仮説に対するAIコメントを生成
        
        Args:
            hypothesis: 仮説データ
            existing_discussions: 既存のディスカッション（オプション）
        
        Returns:
            生成されたコメント文字列、またはNone
        """
        if not self.api_key:
            return None
        
        try:
            # プロンプトを構築
            prompt = self._build_comment_prompt(hypothesis, existing_discussions)
            
            # Gemini APIにリクエスト
            response = self._call_gemini_api(prompt)
            
            if response:
                logger.info(f"Generated AI comment for hypothesis {hypothesis.get('id', 'unknown')}")
                return response
            
        except Exception as e:
            logger.error(f"Error generating AI comment: {str(e)}")
        
        return None
    
    def generate_reply(self, original_comment: Dict, hypothesis: Dict) -> Optional[str]:
        """
        既存のコメントに対するAI返信を生成
        
        Args:
            original_comment: 元のコメントデータ
            hypothesis: 関連する仮説データ
        
        Returns:
            生成された返信文字列、またはNone
        """
        if not self.api_key:
            return None
        
        try:
            # 返信用プロンプトを構築
            prompt = self._build_reply_prompt(original_comment, hypothesis)
            
            # Gemini APIにリクエスト
            response = self._call_gemini_api(prompt)
            
            if response:
                logger.info(f"Generated AI reply for comment {original_comment.get('id', 'unknown')}")
                return response
            
        except Exception as e:
            logger.error(f"Error generating AI reply: {str(e)}")
        
        return None
    
    def _build_comment_prompt(self, hypothesis: Dict, existing_discussions: List[Dict] = None) -> str:
        """仮説に対するコメント生成用プロンプトを構築"""
        
        prompt = f"""あなたは経済学の専門家として、以下の研究仮説について建設的で洞察に富んだコメントを提供してください。

【研究仮説】
タイトル: {hypothesis.get('title', '')}
説明: {hypothesis.get('description', '')}
カテゴリ: {hypothesis.get('category', '')}
信頼度: {hypothesis.get('confidence', '')}%
新規性スコア: {hypothesis.get('novelty_score', '')}%
研究手法: {', '.join(hypothesis.get('research_methods', []))}
重要要因: {', '.join(hypothesis.get('key_factors', []))}
政策的含意: {hypothesis.get('policy_implications', '')}

"""

        if existing_discussions:
            prompt += "\n【既存のディスカッション】\n"
            for discussion in existing_discussions[-3:]:  # 最新3件のみ
                prompt += f"- {discussion.get('author_name', 'Unknown')}: {discussion.get('content', '')[:200]}...\n"
        
        prompt += """
【コメント要件】
1. 経済学の専門知識に基づいた分析的なコメント
2. 仮説の強みと改善点の両方を指摘
3. 具体的な研究手法や検証方法の提案
4. 関連する経済理論や先行研究への言及
5. 政策的な観点からの考察
6. 200-400文字程度の適切な長さ

建設的で学術的なコメントをお願いします。"""
        
        return prompt
    
    def _build_reply_prompt(self, original_comment: Dict, hypothesis: Dict) -> str:
        """コメントに対する返信生成用プロンプトを構築"""
        
        prompt = f"""あなたは経済学の専門家として、以下のコメントに対して建設的な返信を提供してください。

【元の研究仮説】
タイトル: {hypothesis.get('title', '')}
説明: {hypothesis.get('description', '')}

【元のコメント】
投稿者: {original_comment.get('author_name', 'Unknown')}
内容: {original_comment.get('content', '')}

【返信要件】
1. 元のコメントの内容を踏まえた適切な応答
2. 追加的な視点や補完的な情報の提供
3. 建設的な議論の促進
4. 具体的な例や事例の提示（可能であれば）
5. 150-300文字程度の適切な長さ

学術的で建設的な返信をお願いします。"""
        
        return prompt
    
    def _call_gemini_api(self, prompt: str) -> Optional[str]:
        """Gemini APIを呼び出してテキストを生成"""
        
        headers = {
            'Content-Type': 'application/json',
        }
        
        data = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 1024,
            }
        }
        
        try:
            url = f"{self.base_url}?key={self.api_key}"
            response = requests.post(url, headers=headers, json=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if 'candidates' in result and len(result['candidates']) > 0:
                    content = result['candidates'][0].get('content', {})
                    parts = content.get('parts', [])
                    if parts and 'text' in parts[0]:
                        return parts[0]['text'].strip()
            else:
                logger.error(f"Gemini API error: {response.status_code} - {response.text}")
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error calling Gemini API: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error calling Gemini API: {str(e)}")
        
        return None

class AICommentService:
    """AI自動コメント機能のサービスクラス"""
    
    def __init__(self):
        self.commentator = GeminiAICommentator()
    
    def auto_comment_on_hypothesis(self, hypothesis_id: int, hypothesis_data: Dict) -> Optional[Discussion]:
        """
        仮説に対してAIが自動コメントを投稿
        
        Args:
            hypothesis_id: 仮説ID
            hypothesis_data: 仮説データ
        
        Returns:
            作成されたDiscussionオブジェクト、またはNone
        """
        try:
            # 既存のディスカッションを取得
            existing_discussions = Discussion.query.filter_by(
                hypothesis_id=hypothesis_id
            ).order_by(Discussion.created_at.desc()).limit(5).all()
            
            existing_discussions_data = [d.to_dict() for d in existing_discussions]
            
            # AIコメントを生成
            ai_comment = self.commentator.generate_comment(
                hypothesis_data, 
                existing_discussions_data
            )
            
            if ai_comment:
                # データベースに保存
                discussion = Discussion(
                    hypothesis_id=hypothesis_id,
                    author_name="Gemini AI Assistant",
                    author_affiliation="AI Research Assistant",
                    content=ai_comment,
                    comment_type='ai',
                    ai_model='gemini-2.5-flash'
                )
                
                db.session.add(discussion)
                db.session.commit()
                
                logger.info(f"AI auto-commented on hypothesis {hypothesis_id}")
                return discussion
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in auto_comment_on_hypothesis: {str(e)}")
        
        return None
    
    def auto_reply_to_comment(self, comment_id: int, hypothesis_data: Dict) -> Optional[Discussion]:
        """
        コメントに対してAIが自動返信
        
        Args:
            comment_id: 元のコメントID
            hypothesis_data: 関連する仮説データ
        
        Returns:
            作成されたDiscussionオブジェクト、またはNone
        """
        try:
            # 元のコメントを取得
            original_comment = Discussion.query.get(comment_id)
            if not original_comment:
                return None
            
            # AI返信を生成
            ai_reply = self.commentator.generate_reply(
                original_comment.to_dict(),
                hypothesis_data
            )
            
            if ai_reply:
                # データベースに保存
                discussion = Discussion(
                    hypothesis_id=original_comment.hypothesis_id,
                    author_name="Gemini AI Assistant",
                    author_affiliation="AI Research Assistant",
                    content=ai_reply,
                    comment_type='ai',
                    ai_model='gemini-2.5-flash',
                    parent_id=comment_id
                )
                
                db.session.add(discussion)
                db.session.commit()
                
                logger.info(f"AI replied to comment {comment_id}")
                return discussion
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in auto_reply_to_comment: {str(e)}")
        
        return None
    
    def should_auto_comment(self, hypothesis_id: int) -> bool:
        """
        自動コメントを投稿すべきかどうかを判定
        
        Args:
            hypothesis_id: 仮説ID
        
        Returns:
            自動コメントすべきかどうか
        """
        try:
            # 既存のAIコメント数をチェック
            ai_comment_count = Discussion.query.filter_by(
                hypothesis_id=hypothesis_id,
                comment_type='ai'
            ).count()
            
            # 総コメント数をチェック
            total_comment_count = Discussion.query.filter_by(
                hypothesis_id=hypothesis_id
            ).count()
            
            # AIコメントが0件、または総コメント数に対してAIコメントが少ない場合
            return ai_comment_count == 0 or (total_comment_count > 0 and ai_comment_count / total_comment_count < 0.3)
            
        except Exception as e:
            logger.error(f"Error in should_auto_comment: {str(e)}")
            return False


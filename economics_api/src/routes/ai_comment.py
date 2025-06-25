from flask import Blueprint, request, jsonify
from src.models.discussion import Discussion, db
from src.services.ai_comment_service import AICommentService
import logging

ai_comment_bp = Blueprint('ai_comment', __name__)

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# AIコメントサービスのインスタンス
ai_service = AICommentService()

@ai_comment_bp.route('/ai-comment/generate/<int:hypothesis_id>', methods=['POST'])
def generate_ai_comment(hypothesis_id):
    """指定された仮説に対してAIコメントを生成"""
    try:
        data = request.get_json()
        hypothesis_data = data.get('hypothesis_data', {})
        
        if not hypothesis_data:
            return jsonify({'error': 'Hypothesis data is required'}), 400
        
        # AIコメントを生成
        discussion = ai_service.auto_comment_on_hypothesis(hypothesis_id, hypothesis_data)
        
        if discussion:
            return jsonify({
                'message': 'AI comment generated successfully',
                'discussion': discussion.to_dict()
            }), 201
        else:
            return jsonify({'error': 'Failed to generate AI comment'}), 500
            
    except Exception as e:
        logger.error(f"Error generating AI comment for hypothesis {hypothesis_id}: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@ai_comment_bp.route('/ai-comment/reply/<int:comment_id>', methods=['POST'])
def generate_ai_reply(comment_id):
    """指定されたコメントに対してAI返信を生成"""
    try:
        data = request.get_json()
        hypothesis_data = data.get('hypothesis_data', {})
        
        if not hypothesis_data:
            return jsonify({'error': 'Hypothesis data is required'}), 400
        
        # AI返信を生成
        discussion = ai_service.auto_reply_to_comment(comment_id, hypothesis_data)
        
        if discussion:
            return jsonify({
                'message': 'AI reply generated successfully',
                'discussion': discussion.to_dict()
            }), 201
        else:
            return jsonify({'error': 'Failed to generate AI reply'}), 500
            
    except Exception as e:
        logger.error(f"Error generating AI reply for comment {comment_id}: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@ai_comment_bp.route('/ai-comment/auto-trigger/<int:hypothesis_id>', methods=['POST'])
def auto_trigger_ai_comment(hypothesis_id):
    """仮説に対してAIコメントを自動トリガー（条件チェック付き）"""
    try:
        data = request.get_json()
        hypothesis_data = data.get('hypothesis_data', {})
        force = data.get('force', False)  # 強制実行フラグ
        
        if not hypothesis_data:
            return jsonify({'error': 'Hypothesis data is required'}), 400
        
        # 自動コメントすべきかチェック（強制実行でない場合）
        if not force and not ai_service.should_auto_comment(hypothesis_id):
            return jsonify({
                'message': 'AI comment not needed at this time',
                'triggered': False
            }), 200
        
        # AIコメントを生成
        discussion = ai_service.auto_comment_on_hypothesis(hypothesis_id, hypothesis_data)
        
        if discussion:
            return jsonify({
                'message': 'AI comment auto-triggered successfully',
                'discussion': discussion.to_dict(),
                'triggered': True
            }), 201
        else:
            return jsonify({
                'error': 'Failed to auto-trigger AI comment',
                'triggered': False
            }), 500
            
    except Exception as e:
        logger.error(f"Error auto-triggering AI comment for hypothesis {hypothesis_id}: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@ai_comment_bp.route('/ai-comment/batch-process', methods=['POST'])
def batch_process_ai_comments():
    """複数の仮説に対してバッチでAIコメントを処理"""
    try:
        data = request.get_json()
        hypotheses = data.get('hypotheses', [])
        
        if not hypotheses:
            return jsonify({'error': 'Hypotheses data is required'}), 400
        
        results = []
        
        for hypothesis in hypotheses:
            hypothesis_id = hypothesis.get('id')
            if not hypothesis_id:
                continue
            
            try:
                # 自動コメントすべきかチェック
                if ai_service.should_auto_comment(hypothesis_id):
                    discussion = ai_service.auto_comment_on_hypothesis(hypothesis_id, hypothesis)
                    
                    if discussion:
                        results.append({
                            'hypothesis_id': hypothesis_id,
                            'status': 'success',
                            'discussion_id': discussion.id
                        })
                    else:
                        results.append({
                            'hypothesis_id': hypothesis_id,
                            'status': 'failed',
                            'error': 'Failed to generate comment'
                        })
                else:
                    results.append({
                        'hypothesis_id': hypothesis_id,
                        'status': 'skipped',
                        'reason': 'AI comment not needed'
                    })
                    
            except Exception as e:
                logger.error(f"Error processing hypothesis {hypothesis_id}: {str(e)}")
                results.append({
                    'hypothesis_id': hypothesis_id,
                    'status': 'error',
                    'error': str(e)
                })
        
        return jsonify({
            'message': 'Batch processing completed',
            'results': results,
            'total_processed': len(results)
        }), 200
        
    except Exception as e:
        logger.error(f"Error in batch processing AI comments: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


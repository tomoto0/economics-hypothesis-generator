from flask import Blueprint, request, jsonify
from src.models.discussion import Discussion, db
from datetime import datetime
import logging

discussion_bp = Blueprint('discussion', __name__)

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@discussion_bp.route('/discussions/<int:hypothesis_id>', methods=['GET'])
def get_discussions(hypothesis_id):
    """指定された仮説のディスカッション一覧を取得"""
    try:
        # ページネーション対応
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # 親コメントのみを取得（返信は別途取得）
        discussions = Discussion.query.filter_by(
            hypothesis_id=hypothesis_id,
            parent_id=None
        ).order_by(Discussion.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        result = {
            'discussions': [discussion.to_dict() for discussion in discussions.items],
            'total': discussions.total,
            'pages': discussions.pages,
            'current_page': page,
            'per_page': per_page,
            'has_next': discussions.has_next,
            'has_prev': discussions.has_prev
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error getting discussions for hypothesis {hypothesis_id}: {str(e)}")
        return jsonify({'error': 'Failed to get discussions'}), 500

@discussion_bp.route('/discussions/<int:discussion_id>/replies', methods=['GET'])
def get_replies(discussion_id):
    """指定されたディスカッションの返信一覧を取得"""
    try:
        replies = Discussion.query.filter_by(parent_id=discussion_id).order_by(Discussion.created_at.asc()).all()
        
        result = {
            'replies': [reply.to_dict() for reply in replies],
            'total': len(replies)
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error getting replies for discussion {discussion_id}: {str(e)}")
        return jsonify({'error': 'Failed to get replies'}), 500

@discussion_bp.route('/discussions', methods=['POST'])
def create_discussion():
    """新しいディスカッションを作成"""
    try:
        data = request.get_json()
        
        # 必須フィールドの検証
        required_fields = ['hypothesis_id', 'author_name', 'content']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # 新しいディスカッションを作成
        discussion = Discussion(
            hypothesis_id=data['hypothesis_id'],
            author_name=data['author_name'],
            author_email=data.get('author_email'),
            author_affiliation=data.get('author_affiliation'),
            content=data['content'],
            comment_type=data.get('comment_type', 'user'),
            ai_model=data.get('ai_model'),
            parent_id=data.get('parent_id')
        )
        
        db.session.add(discussion)
        db.session.commit()
        
        logger.info(f"Created new discussion: {discussion.id} for hypothesis {discussion.hypothesis_id}")
        
        return jsonify(discussion.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating discussion: {str(e)}")
        return jsonify({'error': 'Failed to create discussion'}), 500

@discussion_bp.route('/discussions/<int:discussion_id>', methods=['PUT'])
def update_discussion(discussion_id):
    """ディスカッションを更新"""
    try:
        discussion = Discussion.query.get_or_404(discussion_id)
        data = request.get_json()
        
        # 更新可能なフィールド
        updatable_fields = ['content', 'author_affiliation']
        for field in updatable_fields:
            if field in data:
                setattr(discussion, field, data[field])
        
        discussion.updated_at = datetime.utcnow()
        db.session.commit()
        
        logger.info(f"Updated discussion: {discussion_id}")
        
        return jsonify(discussion.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating discussion {discussion_id}: {str(e)}")
        return jsonify({'error': 'Failed to update discussion'}), 500

@discussion_bp.route('/discussions/<int:discussion_id>', methods=['DELETE'])
def delete_discussion(discussion_id):
    """ディスカッションを削除"""
    try:
        discussion = Discussion.query.get_or_404(discussion_id)
        
        # 返信も一緒に削除
        Discussion.query.filter_by(parent_id=discussion_id).delete()
        
        db.session.delete(discussion)
        db.session.commit()
        
        logger.info(f"Deleted discussion: {discussion_id}")
        
        return jsonify({'message': 'Discussion deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting discussion {discussion_id}: {str(e)}")
        return jsonify({'error': 'Failed to delete discussion'}), 500

@discussion_bp.route('/discussions/<int:discussion_id>/like', methods=['POST'])
def like_discussion(discussion_id):
    """ディスカッションにいいねを追加"""
    try:
        discussion = Discussion.query.get_or_404(discussion_id)
        discussion.likes += 1
        db.session.commit()
        
        return jsonify({
            'message': 'Liked successfully',
            'likes': discussion.likes,
            'dislikes': discussion.dislikes
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error liking discussion {discussion_id}: {str(e)}")
        return jsonify({'error': 'Failed to like discussion'}), 500

@discussion_bp.route('/discussions/<int:discussion_id>/dislike', methods=['POST'])
def dislike_discussion(discussion_id):
    """ディスカッションにディスライクを追加"""
    try:
        discussion = Discussion.query.get_or_404(discussion_id)
        discussion.dislikes += 1
        db.session.commit()
        
        return jsonify({
            'message': 'Disliked successfully',
            'likes': discussion.likes,
            'dislikes': discussion.dislikes
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error disliking discussion {discussion_id}: {str(e)}")
        return jsonify({'error': 'Failed to dislike discussion'}), 500

@discussion_bp.route('/discussions/stats/<int:hypothesis_id>', methods=['GET'])
def get_discussion_stats(hypothesis_id):
    """指定された仮説のディスカッション統計を取得"""
    try:
        total_discussions = Discussion.query.filter_by(hypothesis_id=hypothesis_id).count()
        user_discussions = Discussion.query.filter_by(hypothesis_id=hypothesis_id, comment_type='user').count()
        ai_discussions = Discussion.query.filter_by(hypothesis_id=hypothesis_id, comment_type='ai').count()
        
        # 最新のディスカッション
        latest_discussion = Discussion.query.filter_by(hypothesis_id=hypothesis_id).order_by(Discussion.created_at.desc()).first()
        
        result = {
            'total_discussions': total_discussions,
            'user_discussions': user_discussions,
            'ai_discussions': ai_discussions,
            'latest_discussion': latest_discussion.to_dict() if latest_discussion else None
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error getting discussion stats for hypothesis {hypothesis_id}: {str(e)}")
        return jsonify({'error': 'Failed to get discussion stats'}), 500


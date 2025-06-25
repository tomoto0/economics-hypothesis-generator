from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Discussion(db.Model):
    """ディスカッション（コメント）モデル"""
    __tablename__ = 'discussions'
    
    id = db.Column(db.Integer, primary_key=True)
    hypothesis_id = db.Column(db.Integer, nullable=False, index=True)
    author_name = db.Column(db.String(100), nullable=False)
    author_email = db.Column(db.String(120), nullable=True)
    author_affiliation = db.Column(db.String(200), nullable=True)
    content = db.Column(db.Text, nullable=False)
    comment_type = db.Column(db.String(20), nullable=False, default='user')  # 'user' or 'ai'
    ai_model = db.Column(db.String(50), nullable=True)  # AIコメントの場合のモデル名
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 評価関連フィールド
    likes = db.Column(db.Integer, nullable=False, default=0)
    dislikes = db.Column(db.Integer, nullable=False, default=0)
    
    # 返信機能用
    parent_id = db.Column(db.Integer, db.ForeignKey('discussions.id'), nullable=True)
    replies = db.relationship('Discussion', backref=db.backref('parent', remote_side=[id]), lazy='dynamic')
    
    def to_dict(self):
        """辞書形式に変換"""
        return {
            'id': self.id,
            'hypothesis_id': self.hypothesis_id,
            'author_name': self.author_name,
            'author_email': self.author_email,
            'author_affiliation': self.author_affiliation,
            'content': self.content,
            'comment_type': self.comment_type,
            'ai_model': self.ai_model,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'likes': self.likes,
            'dislikes': self.dislikes,
            'parent_id': self.parent_id,
            'reply_count': self.replies.count() if self.replies else 0
        }
    
    def __repr__(self):
        return f'<Discussion {self.id}: {self.author_name} on hypothesis {self.hypothesis_id}>'


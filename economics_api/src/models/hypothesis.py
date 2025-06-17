from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Hypothesis(db.Model):
    __tablename__ = 'hypotheses'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    confidence = db.Column(db.Integer, nullable=False)
    research_methods = db.Column(db.Text, nullable=False)  # JSON文字列として保存
    key_factors = db.Column(db.Text, nullable=False)  # JSON文字列として保存
    novelty_score = db.Column(db.Integer, default=0)
    feasibility_score = db.Column(db.Integer, default=0)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        import json
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'confidence': self.confidence,
            'researchMethods': json.loads(self.research_methods) if self.research_methods else [],
            'keyFactors': json.loads(self.key_factors) if self.key_factors else [],
            'noveltyScore': self.novelty_score,
            'feasibilityScore': self.feasibility_score,
            'generatedAt': self.generated_at.isoformat() if self.generated_at else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }


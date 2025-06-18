from flask import Blueprint, jsonify, request
from src.models.hypothesis import db, Hypothesis
import json
import requests
import os
from datetime import datetime
import logging

hypothesis_bp = Blueprint('hypothesis', __name__)

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@hypothesis_bp.route('/hypotheses', methods=['GET'])
def get_hypotheses():
    """仮説一覧を取得"""
    try:
        # クエリパラメータの取得
        category = request.args.get('category')
        min_confidence = request.args.get('min_confidence', type=int)
        search = request.args.get('search')
        
        # ベースクエリ
        query = Hypothesis.query
        
        # フィルタリング
        if category:
            query = query.filter(Hypothesis.category == category)
        if min_confidence:
            query = query.filter(Hypothesis.confidence >= min_confidence)
        if search:
            query = query.filter(
                db.or_(
                    Hypothesis.title.contains(search),
                    Hypothesis.description.contains(search)
                )
            )
        
        # 結果取得（最新順）
        hypotheses = query.order_by(Hypothesis.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'data': [h.to_dict() for h in hypotheses],
            'total': len(hypotheses)
        })
        
    except Exception as e:
        logger.error(f"仮説取得エラー: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@hypothesis_bp.route('/hypotheses/<int:hypothesis_id>', methods=['GET'])
def get_hypothesis(hypothesis_id):
    """特定の仮説を取得"""
    try:
        hypothesis = Hypothesis.query.get_or_404(hypothesis_id)
        return jsonify({
            'success': True,
            'data': hypothesis.to_dict()
        })
    except Exception as e:
        logger.error(f"仮説取得エラー: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@hypothesis_bp.route('/hypotheses/generate', methods=['POST'])
def generate_hypotheses():
    """新しい仮説を生成"""
    try:
        # サンプルデータ（実際の実装ではGemini APIと外部データソースを使用）
        # 現在はデモンストレーションのため、静的なサンプルデータを使用しています。
        sample_hypotheses = [
            {
                "title": "デジタル通貨普及と消費者行動の変化",
                "description": "中央銀行デジタル通貨（CBDC）の導入が消費者の支払い行動と貯蓄パターンに与える影響について、行動経済学の観点から分析する必要がある。",
                "category": "金融政策",
                "confidence": 85,
                "research_methods": ["実験経済学", "フィールド調査", "データマイニング"],
                "key_factors": ["プライバシー懸念", "利便性", "金融包摂"],
                "novelty_score": 90,
                "feasibility_score": 80
            },
            {
                "title": "リモートワークと地域経済格差",
                "description": "コロナ後のリモートワーク普及により、都市部から地方への人口移動が地域間の経済格差に与える長期的影響を分析する。",
                "category": "労働経済学",
                "confidence": 78,
                "research_methods": ["パネルデータ分析", "空間経済学モデル", "質的調査"],
                "key_factors": ["住宅価格", "インフラ整備", "教育機会"],
                "novelty_score": 85,
                "feasibility_score": 75
            },
            {
                "title": "ESG投資と企業パフォーマンス",
                "description": "環境・社会・ガバナンス（ESG）要因を重視した投資戦略が、長期的な企業価値と株主リターンに与える因果関係を検証する。",
                "category": "金融経済学",
                "confidence": 92,
                "research_methods": ["イベントスタディ", "回帰分析", "機械学習"],
                "key_factors": ["ESGスコア", "業界特性", "規制環境"],
                "novelty_score": 88,
                "feasibility_score": 90
            },
            {
                "title": "AI技術導入と労働市場の構造変化",
                "description": "人工知能技術の普及が職種別労働需要と賃金格差に与える影響を、技能偏向的技術進歩の理論を用いて分析する。",
                "category": "労働経済学",
                "confidence": 87,
                "research_methods": ["差分の差分法", "機械学習", "職業分析"],
                "key_factors": ["技能代替性", "教育水準", "産業構造"],
                "novelty_score": 92,
                "feasibility_score": 85
            },
            {
                "title": "サステナブル消費と価格プレミアム",
                "description": "環境配慮型商品に対する消費者の支払意思額と実際の購買行動の乖離を、行動経済学の認知バイアス理論で説明する。",
                "category": "消費者行動",
                "confidence": 81,
                "research_methods": ["選択実験", "フィールド実験", "アンケート調査"],
                "key_factors": ["環境意識", "所得水準", "社会的規範"],
                "novelty_score": 86,
                "feasibility_score": 88
            }
        ]
        
        # データベースに保存
        saved_hypotheses = []
        for hyp_data in sample_hypotheses:
            hypothesis = Hypothesis(
                title=hyp_data['title'],
                description=hyp_data['description'],
                category=hyp_data['category'],
                confidence=hyp_data['confidence'],
                research_methods=json.dumps(hyp_data['research_methods'], ensure_ascii=False),
                key_factors=json.dumps(hyp_data['key_factors'], ensure_ascii=False),
                novelty_score=hyp_data['novelty_score'],
                feasibility_score=hyp_data['feasibility_score'],
                generated_at=datetime.utcnow()
            )
            db.session.add(hypothesis)
            db.session.commit()
            saved_hypotheses.append(hypothesis.to_dict())
        
        logger.info(f"新しい仮説を生成しました: {len(saved_hypotheses)} 件")
        
        return jsonify({
            'success': True,
            'data': saved_hypotheses,
            'message': f'{len(saved_hypotheses)} 件の新しい仮説を生成しました'
        })
        
    except Exception as e:
        logger.error(f"仮説生成エラー: {e}")
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@hypothesis_bp.route('/hypotheses/stats', methods=['GET'])
def get_hypothesis_stats():
    """仮説の統計情報を取得"""
    try:
        total_count = Hypothesis.query.count()
        
        if total_count == 0:
            return jsonify({
                'success': True,
                'data': {
                    'totalHypotheses': 0,
                    'averageConfidence': 0,
                    'categoriesCount': 0,
                    'categories': []
                }
            })
        
        # 平均信頼度
        avg_confidence = db.session.query(db.func.avg(Hypothesis.confidence)).scalar()
        
        # カテゴリ別統計
        categories = db.session.query(
            Hypothesis.category,
            db.func.count(Hypothesis.id).label('count')
        ).group_by(Hypothesis.category).all()
        
        return jsonify({
            'success': True,
            'data': {
                'totalHypotheses': total_count,
                'averageConfidence': round(avg_confidence, 1) if avg_confidence else 0,
                'categoriesCount': len(categories),
                'categories': [{'name': cat[0], 'count': cat[1]} for cat in categories]
            }
        })
        
    except Exception as e:
        logger.error(f"統計情報取得エラー: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@hypothesis_bp.route('/hypotheses/<int:hypothesis_id>', methods=['DELETE'])
def delete_hypothesis(hypothesis_id):
    """仮説を削除"""
    try:
        hypothesis = Hypothesis.query.get_or_404(hypothesis_id)
        db.session.delete(hypothesis)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '仮説を削除しました'
        })
        
    except Exception as e:
        logger.error(f"仮説削除エラー: {e}")
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@hypothesis_bp.route('/hypotheses/export', methods=['GET'])
def export_hypotheses():
    """仮説をCSV形式でエクスポート"""
    try:
        import csv
        import io
        from flask import make_response
        
        hypotheses = Hypothesis.query.order_by(Hypothesis.created_at.desc()).all()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # ヘッダー
        writer.writerow([
            'ID', 'タイトル', '説明', 'カテゴリ', '信頼度',
            '研究手法', '重要要因', '新規性スコア', '実現可能性スコア',
            '生成日時', '作成日時'
        ])
        
        # データ
        for h in hypotheses:
            writer.writerow([
                h.id, h.title, h.description, h.category, h.confidence,
                h.research_methods, h.key_factors, h.novelty_score,
                h.feasibility_score, h.generated_at, h.created_at
            ])
        
        output.seek(0)
        
        response = make_response(output.getvalue())
        response.headers['Content-Type'] = 'text/csv; charset=utf-8'
        response.headers['Content-Disposition'] = 'attachment; filename=hypotheses.csv'
        
        return response
        
    except Exception as e:
        logger.error(f"エクスポートエラー: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

